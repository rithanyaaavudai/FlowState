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
@RequestMapping({"/api/session-goals", "/api/goals"})
@RequiredArgsConstructor
public class SessionGoalController {

    private final SessionGoalService sessionGoalService;

    private Long getAuthenticatedUserId(jakarta.servlet.http.HttpServletRequest request) {
        if (request != null) {
            Object attribute = request.getAttribute("authenticatedUserId");
            if (attribute instanceof Long) {
                return (Long) attribute;
            }
            if (attribute instanceof Integer) {
                return ((Integer) attribute).longValue();
            }
            if (attribute != null) {
                try {
                    return Long.valueOf(attribute.toString());
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return 1L;
    }

    @PostMapping
    public ResponseEntity<SessionGoalResponseDto> attachMyGoal(
            @Valid @RequestBody SessionGoalRequestDto requestDto,
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        SessionGoalResponseDto response =
                sessionGoalService.attachGoal(requestDto, userId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/practitioner/{practitionerId}")
    public ResponseEntity<SessionGoalResponseDto> attachGoal(
            @PathVariable Long practitionerId,
            @Valid @RequestBody SessionGoalRequestDto requestDto) {

        SessionGoalResponseDto response =
                sessionGoalService.attachGoal(requestDto, practitionerId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{goalId}/outcome")
    public ResponseEntity<SessionGoalResponseDto> markMyGoalOutcome(
            @PathVariable Long goalId,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            @RequestParam(required = false) Integer achievedMinutes,
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        Integer minutes = achievedMinutes;
        if (minutes == null && body != null && body.containsKey("achievedMinutes")) {
            Object val = body.get("achievedMinutes");
            if (val instanceof Number) {
                minutes = ((Number) val).intValue();
            }
        }
        if (minutes == null) minutes = 0;

        SessionGoalResponseDto response =
                sessionGoalService.markGoalOutcome(
                        goalId,
                        minutes,
                        userId);

        return ResponseEntity.ok(response);
    }

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

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionGoalResponseDto>> getGoalsForSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                sessionGoalService.getGoalsForSession(sessionId));
    }

    @GetMapping("/completion-rate")
    public ResponseEntity<GoalCompletionRateResponseDto> getMyGoalCompletionRate(
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(
                sessionGoalService.getGoalCompletionRate(userId));
    }

    @GetMapping("/practitioner/{practitionerId}/completion-rate")
    public ResponseEntity<GoalCompletionRateResponseDto> getGoalCompletionRate(
            @PathVariable Long practitionerId) {

        return ResponseEntity.ok(
                sessionGoalService.getGoalCompletionRate(practitionerId));
    }
}