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
import org.springframework.data.domain.Pageable;
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

    @Transactional
    public FocusSessionResponseDto scheduleSession(FocusSessionRequestDto dto, Long practitionerId) {
        FlowUser practitioner = flowUserRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found"));

        // 1. Duration Validation [REQ-SVC-05]
        Duration duration = Duration.between(dto.getPlannedStart(), dto.getPlannedEnd());
        if (dto.getPlannedEnd().isBefore(dto.getPlannedStart()) || duration.toMinutes() < 15) {
            throw new BusinessValidationException("Session must be at least 15 minutes long and end after it starts");
        }

        // 2. Overlap Validation [REQ-SVC-05]
        List<FocusSession> conflicts = focusSessionRepository.findConflictingSessions(
                practitionerId, dto.getPlannedStart(), dto.getPlannedEnd());
        if (!conflicts.isEmpty()) {
            throw new BusinessValidationException("Session overlaps with an existing scheduled or in-progress session");
        }

        FocusSession session = FocusSession.builder()
                .practitioner(practitioner)
                .title(dto.getTitle())
                .plannedStart(dto.getPlannedStart())
                .plannedEnd(dto.getPlannedEnd())
                .sessionType(FocusSession.SessionType.valueOf(dto.getSessionType()))
                .notes(dto.getNotes())
                .status(FocusSession.SessionStatus.SCHEDULED)
                .build();

        FocusSession saved = focusSessionRepository.save(session);
        return toResponseDto(saved);
    }

    @Transactional
    public FocusSessionResponseDto startSession(Long sessionId, Long practitionerId) {
        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {
            throw new BusinessValidationException("Only scheduled sessions can be started");
        }

        session.setActualStart(LocalDateTime.now());
        session.setStatus(FocusSession.SessionStatus.IN_PROGRESS);
        return toResponseDto(focusSessionRepository.save(session));
    }

    @Transactional
    public FocusSessionResponseDto completeSession(Long sessionId, Long practitionerId) {
        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Only in-progress sessions can be completed");
        }

        session.setActualEnd(LocalDateTime.now());
        session.setStatus(FocusSession.SessionStatus.COMPLETED);

        for (SessionGoal goal : session.getGoals()) {
            if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {
                goal.setStatus(SessionGoal.GoalStatus.MISSED);
            }
        }

        session.setFocusScore(calculateFocusScore(session));
        return toResponseDto(focusSessionRepository.save(session));
    }

    /**
     * Focus Score (0-100) [REQ-SVC-03]:
     * Base Score = 100
     * Distraction Penalty = (totalDistractionSeconds / sessionDurationSeconds) * 50
     * Goal Completion Bonus = (achievedGoals / totalGoals) * 20 (capped at 20)
     * Focus Score = Max(0, Base Score - Distraction Penalty + Goal Completion Bonus)
     */
    private int calculateFocusScore(FocusSession session) {
        long durationSeconds = Duration.between(session.getPlannedStart(), session.getPlannedEnd()).getSeconds();
        if (durationSeconds <= 0) {
            durationSeconds = 1;
        }

        Long totalDistractionSeconds = distractionLogRepository.sumDurationSecondsBySessionId(session.getId());
        if (totalDistractionSeconds == null) {
            totalDistractionSeconds = 0L;
        }

        double distractionPenalty = ((double) totalDistractionSeconds / durationSeconds) * 50;

        int totalGoals = session.getGoals().size();
        long achievedGoals = session.getGoals().stream()
                .filter(g -> g.getStatus() == SessionGoal.GoalStatus.ACHIEVED)
                .count();

        double goalBonus = totalGoals > 0 ? ((double) achievedGoals / totalGoals) * 20 : 0;
        if (goalBonus > 20) {
            goalBonus = 20;
        }

        double score = 100 - distractionPenalty + goalBonus;
        return (int) Math.max(0, Math.round(score));
    }

    @Transactional
    public FocusSessionResponseDto abandonSession(Long sessionId, String reason, Long practitionerId) {
        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Only in-progress sessions can be abandoned");
        }

        session.setAbandonReason(reason);
        session.setStatus(FocusSession.SessionStatus.ABANDONED);

        for (SessionGoal goal : session.getGoals()) {
            if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {
                goal.setStatus(SessionGoal.GoalStatus.MISSED);
            }
        }

        return toResponseDto(focusSessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(Long sessionId, Long practitionerId) {
        FocusSession session = getOwnedSession(sessionId, practitionerId);

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {
            throw new BusinessValidationException("Only scheduled sessions can be deleted");
        }

        focusSessionRepository.delete(session);
    }

    public FocusSessionResponseDto getSession(Long sessionId, Long practitionerId) {
        return toResponseDto(getOwnedSession(sessionId, practitionerId));
    }

    public Page<FocusSessionResponseDto> getMySessionsPaginated(Long practitionerId, Pageable pageable) {
        return focusSessionRepository.findByPractitionerId(practitionerId, pageable).map(this::toResponseDto);
    }

    public Page<FocusSessionResponseDto> getAllSessionsPaginated(Pageable pageable) {
        return focusSessionRepository.findAll(pageable).map(this::toResponseDto);
    }

    public SessionStatsResponseDto getSummaryStats(Long userId) {
        long total = focusSessionRepository.findByPractitionerId(userId, Pageable.unpaged()).getTotalElements();
        long completed = focusSessionRepository.findByPractitionerIdAndStatus(userId, FocusSession.SessionStatus.COMPLETED).size();
        long abandoned = focusSessionRepository.findByPractitionerIdAndStatus(userId, FocusSession.SessionStatus.ABANDONED).size();

        Double avgScore = focusSessionRepository.findAverageFocusScore(userId);
        Long totalMinutes = focusSessionRepository.findTotalFocusMinutes(userId);

        List<Object[]> countsBySessionType = focusSessionRepository.countBySessionType(userId);
        Map<String, Long> typeMap = new HashMap<>();
        for (Object[] row : countsBySessionType) {
            typeMap.put(String.valueOf(row[0]), (Long) row[1]);
        }

        return SessionStatsResponseDto.builder()
                .totalSessions(total)
                .completedSessions(completed)
                .abandonedSessions(abandoned)
                .averageFocusScore(avgScore != null ? avgScore : 0.0)
                .totalFocusMinutes(totalMinutes != null ? totalMinutes : 0L)
                .countBySessionType(typeMap)
                .build();
    }

    private FocusSession getOwnedSession(Long sessionId, Long practitionerId) {
        return focusSessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found"));
    }

    private FocusSessionResponseDto toResponseDto(FocusSession session) {
        return FocusSessionResponseDto.builder()
                .id(session.getId())
                .practitionerId(session.getPractitioner().getId())
                .practitionerName(session.getPractitioner().getFullName())
                .title(session.getTitle())
                .plannedStart(session.getPlannedStart())
                .plannedEnd(session.getPlannedEnd())
                .actualStart(session.getActualStart())
                .actualEnd(session.getActualEnd())
                .status(session.getStatus().name())
                .sessionType(session.getSessionType().name())
                .focusScore(session.getFocusScore())
                .notes(session.getNotes())
                .abandonReason(session.getAbandonReason())
                .createdAt(session.getCreatedAt())
                .build();
    }

    public Object getAllSessionsPaginated(String search, String status, int page, int size) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllSessionsPaginated'");
    }
}