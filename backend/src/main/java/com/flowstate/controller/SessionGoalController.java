package com.flowstate.controller;

import com.flowstate.dto.GoalCompletionRateResponseDto;
import com.flowstate.dto.GoalOutcomeRequestDto;
import com.flowstate.dto.SessionGoalRequestDto;
import com.flowstate.dto.SessionGoalResponseDto;
import com.flowstate.service.SessionGoalService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SessionGoalController {

    private final SessionGoalService goalService;

    public SessionGoalController(SessionGoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<SessionGoalResponseDto> attachGoal(
            @Valid @RequestBody SessionGoalRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.attachGoal(dto, userId));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<SessionGoalResponseDto>> getGoalsForSession(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(goalService.getGoalsForSession(sessionId));
    }

    @PutMapping("/{id}/outcome")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<SessionGoalResponseDto> markOutcome(
            @PathVariable Long id,
            @Valid @RequestBody GoalOutcomeRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(goalService.markGoalOutcome(id, dto.getAchievedMinutes(), userId));
    }

    @GetMapping("/completion-rate")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<GoalCompletionRateResponseDto> getCompletionRate(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(goalService.getGoalCompletionRate(userId));
    }
}
