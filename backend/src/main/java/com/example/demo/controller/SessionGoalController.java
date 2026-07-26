package com.example.demo.controller;

import com.example.demo.dto.GoalCompletionRateResponseDto;
import com.example.demo.dto.SessionGoalRequestDto;
import com.example.demo.dto.SessionGoalResponseDto;
import com.example.demo.service.SessionGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session-goals")
@RequiredArgsConstructor
public class SessionGoalController {

    private final SessionGoalService sessionGoalService;

    /**
     * Attach a goal to a focus session.
     */
    @PostMapping("/practitioner/{practitionerId}")
    public ResponseEntity<SessionGoalResponseDto> attachGoal(
            @PathVariable Long practitionerId,
            @Valid @RequestBody SessionGoalRequestDto requestDto) {

        SessionGoalResponseDto response =
                sessionGoalService.attachGoal(requestDto, practitionerId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Mark the outcome of a goal.
     */
    @PutMapping("/{goalId}/practitioner/{practitionerId}")
    public ResponseEntity<SessionGoalResponseDto> markGoalOutcome(
            @PathVariable Long goalId,
            @RequestParam Integer achievedMinutes,
            @PathVariable Long practitionerId) {

        SessionGoalResponseDto response =
                sessionGoalService.markGoalOutcome(
                        goalId,
                        achievedMinutes,
                        practitionerId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get all goals for a focus session.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionGoalResponseDto>> getGoalsForSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                sessionGoalService.getGoalsForSession(sessionId));
    }

    /**
     * Get goal completion statistics for a practitioner.
     */
    @GetMapping("/practitioner/{practitionerId}/completion-rate")
    public ResponseEntity<GoalCompletionRateResponseDto> getGoalCompletionRate(
            @PathVariable Long practitionerId) {

        return ResponseEntity.ok(
                sessionGoalService.getGoalCompletionRate(practitionerId));
    }
}