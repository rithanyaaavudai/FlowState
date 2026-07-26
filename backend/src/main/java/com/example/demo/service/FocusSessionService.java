package com.example.demo.service;

import com.example.demo.dto.FocusSessionRequestDto;
import com.example.demo.dto.FocusSessionResponseDto;
import com.example.demo.dto.SessionStatsResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.entity.FocusSession;
import com.example.demo.entity.SessionGoal;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DistractionLogRepository;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.repository.FocusSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FocusSessionService {

    private final FocusSessionRepository focusSessionRepository;
    private final FlowUserRepository flowUserRepository;
    private final DistractionLogRepository distractionLogRepository;

    // =========================================================
    // SCHEDULE SESSION
    // =========================================================

    @Transactional
    public FocusSessionResponseDto scheduleSession(
            FocusSessionRequestDto dto,
            Long practitionerId) {

        FlowUser practitioner = flowUserRepository
                .findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Practitioner not found"));

        // Validate start/end
        if (dto.getPlannedStart() == null ||
                dto.getPlannedEnd() == null) {

            throw new BusinessValidationException(
                    "Planned start and end time are required");
        }

        Duration duration = Duration.between(
                dto.getPlannedStart(),
                dto.getPlannedEnd());

        if (dto.getPlannedEnd()
                .isBefore(dto.getPlannedStart())
                || duration.toMinutes() < 15) {

            throw new BusinessValidationException(
                    "Session must be at least 15 minutes long and end after it starts");
        }

        // Check overlapping sessions
        List<FocusSession> conflicts = focusSessionRepository.findConflictingSessions(
                practitionerId,
                dto.getPlannedStart(),
                dto.getPlannedEnd());

        if (!conflicts.isEmpty()) {
            throw new BusinessValidationException(
                    "Session overlaps with an existing scheduled or in-progress session");
        }

        FocusSession.SessionType sessionType;

        try {
            sessionType = FocusSession.SessionType.valueOf(
                    dto.getSessionType()
                            .trim()
                            .toUpperCase());
        } catch (Exception e) {
            throw new BusinessValidationException(
                    "Invalid session type: " +
                            dto.getSessionType());
        }

        FocusSession session = FocusSession.builder()
                .practitioner(practitioner)
                .title(dto.getTitle())
                .plannedStart(dto.getPlannedStart())
                .plannedEnd(dto.getPlannedEnd())
                .sessionType(sessionType)
                .notes(dto.getNotes())
                .status(
                        FocusSession.SessionStatus.SCHEDULED)
                .build();

        FocusSession saved = focusSessionRepository.save(session);

        return toResponseDto(saved);
    }

    // =========================================================
    // START SESSION
    // =========================================================

    @Transactional
    public FocusSessionResponseDto startSession(
            Long sessionId,
            Long practitionerId) {

        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {

            throw new BusinessValidationException(
                    "Only scheduled sessions can be started");
        }

        session.setActualStart(LocalDateTime.now());

        session.setStatus(
                FocusSession.SessionStatus.IN_PROGRESS);

        return toResponseDto(
                focusSessionRepository.save(session));
    }

    // =========================================================
    // COMPLETE SESSION
    // =========================================================

    @Transactional
    public FocusSessionResponseDto completeSession(
            Long sessionId,
            Long practitionerId) {

        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {

            throw new BusinessValidationException(
                    "Only in-progress sessions can be completed");
        }

        session.setActualEnd(LocalDateTime.now());

        session.setStatus(
                FocusSession.SessionStatus.COMPLETED);

        if (session.getGoals() != null) {

            for (SessionGoal goal : session.getGoals()) {

                if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {

                    goal.setStatus(
                            SessionGoal.GoalStatus.MISSED);
                }
            }
        }

        session.setFocusScore(
                calculateFocusScore(session));

        return toResponseDto(
                focusSessionRepository.save(session));
    }

    // =========================================================
    // CALCULATE FOCUS SCORE
    // =========================================================

    private int calculateFocusScore(
            FocusSession session) {

        LocalDateTime start = session.getActualStart() != null
                ? session.getActualStart()
                : session.getPlannedStart();

        LocalDateTime end = session.getActualEnd() != null
                ? session.getActualEnd()
                : session.getPlannedEnd();

        long durationSeconds = Duration.between(start, end)
                .getSeconds();

        if (durationSeconds <= 0) {
            durationSeconds = 1;
        }

        Long totalDistractionSeconds = distractionLogRepository
                .sumDurationSecondsBySessionId(
                        session.getId());

        if (totalDistractionSeconds == null) {
            totalDistractionSeconds = 0L;
        }

        double distractionPenalty = ((double) totalDistractionSeconds
                / durationSeconds) * 50;

        int totalGoals = 0;
        long achievedGoals = 0;

        if (session.getGoals() != null) {

            totalGoals = session.getGoals().size();

            achievedGoals = session.getGoals()
                    .stream()
                    .filter(goal -> goal.getStatus() == SessionGoal.GoalStatus.ACHIEVED)
                    .count();
        }

        double goalBonus = totalGoals > 0
                ? ((double) achievedGoals /
                        totalGoals) * 20
                : 0;

        goalBonus = Math.min(goalBonus, 20);

        double score = 100
                - distractionPenalty
                + goalBonus;

        return (int) Math.min(
                100,
                Math.max(
                        0,
                        Math.round(score)));
    }

    // =========================================================
    // ABANDON SESSION
    // =========================================================

    @Transactional
    public FocusSessionResponseDto abandonSession(
            Long sessionId,
            String reason,
            Long practitionerId) {

        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {

            throw new BusinessValidationException(
                    "Only in-progress sessions can be abandoned");
        }

        session.setAbandonReason(reason);

        session.setStatus(
                FocusSession.SessionStatus.ABANDONED);

        if (session.getGoals() != null) {

            for (SessionGoal goal : session.getGoals()) {

                if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {

                    goal.setStatus(
                            SessionGoal.GoalStatus.MISSED);
                }
            }
        }

        return toResponseDto(
                focusSessionRepository.save(session));
    }

    // =========================================================
    // DELETE SESSION
    // =========================================================

    @Transactional
    public void deleteSession(
            Long sessionId,
            Long practitionerId) {

        FocusSession session = getOwnedSession(
                sessionId,
                practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {

            throw new BusinessValidationException(
                    "Only scheduled sessions can be deleted");
        }

        focusSessionRepository.delete(session);
    }

    // =========================================================
    // GET SINGLE SESSION
    // =========================================================

    @Transactional(readOnly = true)
    public FocusSessionResponseDto getSession(
            Long sessionId,
            Long practitionerId) {

        return toResponseDto(
                getOwnedSession(
                        sessionId,
                        practitionerId));
    }

    // =========================================================
    // GET PRACTITIONER SESSIONS
    // =========================================================

    @Transactional(readOnly = true)
    public Page<FocusSessionResponseDto> getMySessionsPaginated(
            Long practitionerId,
            Pageable pageable) {

        return focusSessionRepository
                .findByPractitionerId(
                        practitionerId,
                        pageable)
                .map(this::toResponseDto);
    }

    // =========================================================
    // GET ALL SESSIONS
    // Existing Pageable version
    // =========================================================

    @Transactional(readOnly = true)
    public Page<FocusSessionResponseDto> getAllSessionsPaginated(
            Pageable pageable) {

        return focusSessionRepository
                .findAll(pageable)
                .map(this::toResponseDto);
    }

    // =========================================================
    // GET ALL SESSIONS WITH SEARCH / STATUS / PAGINATION
    // =========================================================

    @Transactional(readOnly = true)
    public Page<FocusSessionResponseDto> getAllSessionsPaginated(
            String search,
            String status,
            int page,
            int size) {

        if (page < 0) {
            throw new BusinessValidationException(
                    "Page number cannot be negative");
        }

        if (size <= 0) {
            throw new BusinessValidationException(
                    "Page size must be greater than zero");
        }

        String title = null;

        if (search != null &&
                !search.trim().isEmpty()) {

            title = search.trim();
        }

        FocusSession.SessionStatus sessionStatus = null;

        if (status != null &&
                !status.trim().isEmpty()) {

            try {

                sessionStatus = FocusSession.SessionStatus.valueOf(
                        status.trim()
                                .toUpperCase());

            } catch (IllegalArgumentException e) {

                throw new BusinessValidationException(
                        "Invalid session status: " +
                                status);
            }
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"));

        return focusSessionRepository
                .findAllWithStatusAndTitleFilter(
                        sessionStatus,
                        title,
                        pageable)
                .map(this::toResponseDto);
    }

    // =========================================================
    // SUMMARY STATS
    // =========================================================

    @Transactional(readOnly = true)
    public SessionStatsResponseDto getSummaryStats(
            Long userId) {

        long total = focusSessionRepository
                .findByPractitionerId(
                        userId,
                        Pageable.unpaged())
                .getTotalElements();

        long completed = focusSessionRepository
                .findByPractitionerIdAndStatus(
                        userId,
                        FocusSession.SessionStatus.COMPLETED)
                .size();

        long abandoned = focusSessionRepository
                .findByPractitionerIdAndStatus(
                        userId,
                        FocusSession.SessionStatus.ABANDONED)
                .size();

        Double avgScore = focusSessionRepository
                .findAverageFocusScore(userId);

        Long totalMinutes = focusSessionRepository
                .findTotalFocusMinutes(userId);

        List<Object[]> countsBySessionType = focusSessionRepository
                .countBySessionType(userId);

        Map<String, Long> typeMap = new HashMap<>();

        for (Object[] row : countsBySessionType) {

            typeMap.put(
                    String.valueOf(row[0]),
                    (Long) row[1]);
        }

        return SessionStatsResponseDto
                .builder()
                .totalSessions(total)
                .completedSessions(completed)
                .abandonedSessions(abandoned)
                .averageFocusScore(
                        avgScore != null
                                ? avgScore
                                : 0.0)
                .totalFocusMinutes(
                        totalMinutes != null
                                ? totalMinutes
                                : 0L)
                .countBySessionType(typeMap)
                .build();
    }


    private FocusSession getOwnedSession(
            Long sessionId,
            Long practitionerId) {

        return focusSessionRepository
                .findByIdAndPractitionerId(
                        sessionId,
                        practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "FocusSession not found"));
    }

    private FocusSessionResponseDto toResponseDto(
            FocusSession session) {

        return FocusSessionResponseDto
                .builder()
                .id(session.getId())
                .practitionerId(
                        session.getPractitioner()
                                .getId())
                .practitionerName(
                        session.getPractitioner()
                                .getFullName())
                .title(session.getTitle())
                .plannedStart(
                        session.getPlannedStart())
                .plannedEnd(
                        session.getPlannedEnd())
                .actualStart(
                        session.getActualStart())
                .actualEnd(
                        session.getActualEnd())
                .status(
                        session.getStatus() != null
                                ? session.getStatus().name()
                                : null)
                .sessionType(
                        session.getSessionType() != null
                                ? session.getSessionType().name()
                                : null)
                .focusScore(
                        session.getFocusScore())
                .notes(
                        session.getNotes())
                .abandonReason(
                        session.getAbandonReason())
                .createdAt(
                        session.getCreatedAt())
                .build();
    }
}