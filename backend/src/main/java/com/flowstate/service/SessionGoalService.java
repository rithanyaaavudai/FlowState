package com.flowstate.service;

import com.flowstate.dto.GoalCompletionRateResponseDto;
import com.flowstate.dto.SessionGoalRequestDto;
import com.flowstate.dto.SessionGoalResponseDto;
import com.flowstate.entity.FocusSession;
import com.flowstate.entity.SessionGoal;
import com.flowstate.exception.BusinessValidationException;
import com.flowstate.exception.ResourceNotFoundException;
import com.flowstate.repository.FocusSessionRepository;
import com.flowstate.repository.SessionGoalRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SessionGoalService {

    private final SessionGoalRepository goalRepository;
    private final FocusSessionRepository sessionRepository;

    public SessionGoalService(SessionGoalRepository goalRepository, FocusSessionRepository sessionRepository) {
        this.goalRepository = goalRepository;
        this.sessionRepository = sessionRepository;
    }

    public SessionGoalResponseDto attachGoal(SessionGoalRequestDto dto, Long practitionerId) {
        FocusSession session = sessionRepository.findByIdAndPractitionerId(dto.getSessionId(), practitionerId)
                .orElseThrow(() -> new ResourceNotFoundException("FocusSession not found."));

        if (session.getStatus() != FocusSession.SessionStatus.SCHEDULED &&
            session.getStatus() != FocusSession.SessionStatus.IN_PROGRESS) {
            throw new BusinessValidationException("Goals can only be added to SCHEDULED or IN_PROGRESS sessions.");
        }

        SessionGoal goal = new SessionGoal();
        goal.setSession(session);
        goal.setDescription(dto.getDescription());
        goal.setTargetMinutes(dto.getTargetMinutes());

        SessionGoal saved = goalRepository.save(goal);
        return mapToResponseDto(saved);
    }

    public SessionGoalResponseDto markGoalOutcome(Long goalId, Integer achievedMinutes, Long practitionerId) {
        SessionGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("SessionGoal not found."));

        if (!goal.getSession().getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("SessionGoal not found.");
        }

        goal.setAchievedMinutes(achievedMinutes);

        if (achievedMinutes >= goal.getTargetMinutes()) {
            goal.setStatus(SessionGoal.GoalStatus.ACHIEVED);
        } else if (achievedMinutes > 0) {
            goal.setStatus(SessionGoal.GoalStatus.PARTIAL);
        } else {
            goal.setStatus(SessionGoal.GoalStatus.MISSED);
        }

        return mapToResponseDto(goalRepository.save(goal));
    }

    public List<SessionGoalResponseDto> getGoalsForSession(Long sessionId) {
        return goalRepository.findBySessionId(sessionId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public GoalCompletionRateResponseDto getGoalCompletionRate(Long practitionerId) {
        long achieved = goalRepository.countAchievedGoalsByPractitioner(practitionerId);
        long resolved = goalRepository.countResolvedGoalsByPractitioner(practitionerId);
        List<Object[]> statusCounts = goalRepository.countGoalsByStatusForPractitioner(practitionerId);

        long total = 0;
        Map<String, Long> goalStatusCounts = new HashMap<>();
        for (Object[] row : statusCounts) {
            String status = row[0].toString();
            Long count = (Long) row[1];
            goalStatusCounts.put(status, count);
            total += count;
        }

        double completionRate = resolved > 0 ? ((double) achieved / resolved) * 100 : 0;

        return new GoalCompletionRateResponseDto(total, achieved, resolved, completionRate, goalStatusCounts);
    }

    private SessionGoalResponseDto mapToResponseDto(SessionGoal g) {
        SessionGoalResponseDto dto = new SessionGoalResponseDto();
        dto.setId(g.getId());
        dto.setSessionId(g.getSession().getId());
        dto.setDescription(g.getDescription());
        dto.setTargetMinutes(g.getTargetMinutes());
        dto.setAchievedMinutes(g.getAchievedMinutes());
        dto.setStatus(g.getStatus().name());
        dto.setCreatedAt(g.getCreatedAt());
        return dto;
    }
}
