package com.flowstate.service;

import com.flowstate.dto.FocusSessionRequestDto;
import com.flowstate.dto.FocusSessionResponseDto;
import com.flowstate.dto.SessionStatsResponseDto;
import com.flowstate.entity.FlowUser;
import com.flowstate.entity.FocusSession;
import com.flowstate.entity.SessionGoal;
import com.flowstate.exception.BusinessValidationException;
import com.flowstate.exception.ResourceNotFoundException;
import com.flowstate.repository.DistractionLogRepository;
import com.flowstate.repository.FlowUserRepository;
import com.flowstate.repository.FocusSessionRepository;
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
public class FocusSessionService {

    private final FocusSessionRepository sessionRepository;
    private final FlowUserRepository userRepository;
    private final DistractionLogRepository distractionLogRepository;

    public FocusSessionService(FocusSessionRepository sessionRepository,
                               FlowUserRepository userRepository,
                               DistractionLogRepository distractionLogRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.distractionLogRepository = distractionLogRepository;
    }

    public FocusSessionResponseDto scheduleSession(FocusSessionRequestDto dto, Long practitionerId) {
        if (dto.getPlannedEnd().isBefore(dto.getPlannedStart()) ||
            Duration.between(dto.getPlannedStart(), dto.getPlannedEnd()).toMinutes() < 15) {
            throw new BusinessValidationException("Session must be at least 15 minutes long and plannedEnd must be after plannedStart.");
        }

        List<FocusSession> conflicts = sessionRepository.findConflictingSessions(
                practitionerId, dto.getPlannedStart(), dto.getPlannedEnd());
        if (!conflicts.isEmpty()) {
            throw new BusinessValidationException("Session overlaps with an existing scheduled or in-progress session.");
        }

        FlowUser practitioner = userRepository.findById(practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        FocusSession session = new FocusSession();
        session.setPractitioner(practitioner);
        session.setTitle(dto.getTitle());
        session.setPlannedStart(dto.getPlannedStart());
        session.setPlannedEnd(dto.getPlannedEnd());
        session.setSessionType(FocusSession.SessionType.valueOf(dto.getSessionType()));
        session.setNotes(dto.getNotes());

        FocusSession saved = sessionRepository.save(session);
        return mapToResponseDto(saved);
    }

    public FocusSessionResponseDto startSession(Long sessionId, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {
            throw new BusinessValidationException("Only SCHEDULED sessions can be started.");
        }

        session.setActualStart(LocalDateTime.now());
        session.setStatus(FocusSession.SessionStatus.IN_PROGRESS);
        return mapToResponseDto(sessionRepository.save(session));
    }

    @Transactional
    public FocusSessionResponseDto completeSession(Long sessionId, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Only IN_PROGRESS sessions can be completed.");
        }

        session.setActualEnd(LocalDateTime.now());
        session.setStatus(FocusSession.SessionStatus.COMPLETED);

        for (SessionGoal goal : session.getGoals()) {
            if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {
                goal.setStatus(SessionGoal.GoalStatus.MISSED);
            }
        }

        long totalDistractionSeconds = distractionLogRepository.sumDurationSecondsBySessionId(session.getId());
        long sessionDurationSeconds = Duration.between(session.getActualStart(), session.getActualEnd()).getSeconds();
        if (sessionDurationSeconds <= 0) sessionDurationSeconds = 1;

        double distractionPenalty = ((double) totalDistractionSeconds / sessionDurationSeconds) * 50;

        long totalGoals = session.getGoals().size();
        long achievedGoals = session.getGoals().stream()
                .filter(g -> g.getStatus() == SessionGoal.GoalStatus.ACHIEVED).count();
        double goalBonus = totalGoals > 0 ? ((double) achievedGoals / totalGoals) * 20 : 0;
        goalBonus = Math.min(goalBonus, 20);

        int focusScore = (int) Math.max(0, 100 - distractionPenalty + goalBonus);
        session.setFocusScore(focusScore);

        return mapToResponseDto(sessionRepository.save(session));
    }

    @Transactional
    public FocusSessionResponseDto abandonSession(Long sessionId, String reason, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Only IN_PROGRESS sessions can be abandoned.");
        }

        session.setAbandonReason(reason);
        session.setStatus(FocusSession.SessionStatus.ABANDONED);
        session.setActualEnd(LocalDateTime.now());

        for (SessionGoal goal : session.getGoals()) {
            if (goal.getStatus() == SessionGoal.GoalStatus.PENDING) {
                goal.setStatus(SessionGoal.GoalStatus.MISSED);
            }
        }

        return mapToResponseDto(sessionRepository.save(session));
    }

    public void deleteSession(Long sessionId, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED) {
            throw new BusinessValidationException("Only SCHEDULED sessions can be deleted.");
        }

        sessionRepository.delete(session);
    }

    public FocusSessionResponseDto getSessionById(Long sessionId, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(sessionId, practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));
        return mapToResponseDto(session);
    }

    public SessionStatsResponseDto getSummaryStats(Long userId) {
        long total = sessionRepository.findByPractitionerId(userId, Pageable.unpaged()).getTotalElements();
        long completed = sessionRepository.findByPractitionerIdAndStatus(userId, FocusSession.SessionStatus.COMPLETED).size();
        long abandoned = sessionRepository.findByPractitionerIdAndStatus(userId, FocusSession.SessionStatus.ABANDONED).size();
        Double avgScore = sessionRepository.findAverageFocusScore(userId);
        Long totalMinutes = sessionRepository.findTotalFocusMinutes(userId);
        List<Object[]> typeCounts = sessionRepository.countBySessionType(userId);

        Map<String, Long> sessionTypeCounts = new HashMap<>();
        for (Object[] row : typeCounts) {
            if (row[0] != null) {
                sessionTypeCounts.put(row[0].toString(), (Long) row[1]);
            }
        }

        return new SessionStatsResponseDto(total, completed, abandoned, avgScore, totalMinutes, sessionTypeCounts);
    }

    public Page<FocusSessionResponseDto> getMySessionsPaginated(Long practitionerId, Pageable pageable) {
        return sessionRepository.findByPractitionerId(practitionerId, pageable)
                .map(this::mapToResponseDto);
    }

    public Page<FocusSessionResponseDto> getAllSessionsPaginated(Pageable pageable) {
        return sessionRepository.findAll(pageable)
                .map(this::mapToResponseDto);
    }

    private FocusSessionResponseDto mapToResponseDto(FocusSession s) {
        FocusSessionResponseDto dto = new FocusSessionResponseDto();
        dto.setId(s.getId());
        dto.setPractitionerId(s.getPractitioner().getId());
        dto.setPractitionerName(s.getPractitioner().getFullName());
        dto.setTitle(s.getTitle());
        dto.setPlannedStart(s.getPlannedStart());
        dto.setPlannedEnd(s.getPlannedEnd());
        dto.setActualStart(s.getActualStart());
        dto.setActualEnd(s.getActualEnd());
        dto.setStatus(s.getStatus().name());
        dto.setSessionType(s.getSessionType() != null ? s.getSessionType().name() : null);
        dto.setFocusScore(s.getFocusScore());
        dto.setNotes(s.getNotes());
        dto.setAbandonReason(s.getAbandonReason());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
