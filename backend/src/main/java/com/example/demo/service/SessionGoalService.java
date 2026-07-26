package com.example.demo.service;

import com.example.demo.dto.GoalCompletionRateResponseDto;
import com.example.demo.dto.SessionGoalRequestDto;
import com.example.demo.dto.SessionGoalResponseDto;
import com.example.demo.entity.FocusSession;
import com.example.demo.entity.SessionGoal;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.FocusSessionRepository;
import com.example.demo.repository.SessionGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionGoalService {

    private final SessionGoalRepository sessionGoalRepository;
    private final FocusSessionRepository focusSessionRepository;

    @Transactional
    public SessionGoalResponseDto attachGoal(SessionGoalRequestDto dto, Long practitionerId) {
        FocusSession session = focusSessionRepository.findByIdAndPractitionerId(dto.getSessionId(), practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found"));

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED
                && session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Goals can only be attached to scheduled or active sessions");
        }

        SessionGoal goal = SessionGoal.builder()
                .session(session)
                .description(dto.getDescription())
                .targetMinutes(dto.getTargetMinutes())
                .achievedMinutes(0)
                .status(SessionGoal.GoalStatus.PENDING)
                .build();

        return toResponseDto(sessionGoalRepository.save(goal));
    }

    @Transactional
    public SessionGoalResponseDto markGoalOutcome(Long goalId, Integer achievedMinutes, Long practitionerId) {
        SessionGoal goal = sessionGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SessionGoal not found"));

        if (!goal.getSession().getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("SessionGoal not found");
        }

        goal.setAchievedMinutes(achievedMinutes);

        if (achievedMinutes >= goal.getTargetMinutes()) {
            goal.setStatus(SessionGoal.GoalStatus.ACHIEVED);
        } else if (achievedMinutes > 0) {
            goal.setStatus(SessionGoal.GoalStatus.PARTIAL);
        } else {
            goal.setStatus(SessionGoal.GoalStatus.MISSED);
        }

        return toResponseDto(sessionGoalRepository.save(goal));
    }

    public List<SessionGoalResponseDto> getGoalsForSession(Long sessionId) {
        return sessionGoalRepository.findBySessionId(sessionId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public GoalCompletionRateResponseDto getGoalCompletionRate(Long practitionerId) {
        long achieved = sessionGoalRepository.countAchievedGoalsByPractitioner(practitionerId);
        long resolved = sessionGoalRepository.countResolvedGoalsByPractitioner(practitionerId);

        List<Object[]> statusCounts = sessionGoalRepository.countGoalsByStatusForPractitioner(practitionerId);
        long total = statusCounts.stream().mapToLong(row -> (Long) row[1]).sum();

        double rate = resolved > 0 ? ((double) achieved / resolved) * 100 : 0.0;

        return GoalCompletionRateResponseDto.builder()
                .totalGoals(total)
                .achievedGoals(achieved)
                .resolvedGoals(resolved)
                .completionRate(rate)
                .build();
    }

    private SessionGoalResponseDto toResponseDto(SessionGoal goal) {
        return SessionGoalResponseDto.builder()
                .id(goal.getId())
                .sessionId(goal.getSession().getId())
                .description(goal.getDescription())
                .targetMinutes(goal.getTargetMinutes())
                .achievedMinutes(goal.getAchievedMinutes())
                .status(goal.getStatus().name())
                .createdAt(goal.getCreatedAt())
                .build();
    }
}