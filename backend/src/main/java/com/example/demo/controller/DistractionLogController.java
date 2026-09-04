package com.example.demo.controller;

import com.example.demo.dto.DistractionBreakdownResponseDto;
import com.example.demo.dto.DistractionLogRequestDto;
import com.example.demo.dto.DistractionLogResponseDto;
import com.example.demo.service.DistractionLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/distractions")
@RequiredArgsConstructor
public class DistractionLogController {

    private final DistractionLogService distractionLogService;

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
    public ResponseEntity<DistractionLogResponseDto> logMyDistraction(
            @Valid @RequestBody DistractionLogRequestDto requestDto,
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        DistractionLogResponseDto response =
                distractionLogService.logDistraction(requestDto, userId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/practitioner/{practitionerId}")
    public ResponseEntity<DistractionLogResponseDto> logDistraction(
            @PathVariable Long practitionerId,
            @Valid @RequestBody DistractionLogRequestDto requestDto) {

        DistractionLogResponseDto response =
                distractionLogService.logDistraction(requestDto, practitionerId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/breakdown")
    public ResponseEntity<DistractionBreakdownResponseDto> getMyDistractionBreakdown(
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(
                distractionLogService.getDistractionBreakdown(userId));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<Map<String, Object>>> getMyDistractionTrend(
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(
                distractionLogService.getDistractionTrendByWeek(userId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<DistractionLogResponseDto>> getLogsForSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                distractionLogService.getLogsForSession(sessionId));
    }

    @GetMapping("/practitioner/{practitionerId}/breakdown")
    public ResponseEntity<DistractionBreakdownResponseDto> getDistractionBreakdown(
            @PathVariable Long practitionerId) {

        return ResponseEntity.ok(
                distractionLogService.getDistractionBreakdown(practitionerId));
    }

    @GetMapping("/practitioner/{practitionerId}/trend")
    public ResponseEntity<List<Map<String, Object>>> getDistractionTrend(
            @PathVariable Long practitionerId) {

        return ResponseEntity.ok(
                distractionLogService.getDistractionTrendByWeek(practitionerId));
    }

    @GetMapping
    public ResponseEntity<Page<DistractionLogResponseDto>> getAllDistractionLogs(
            Pageable pageable) {

        return ResponseEntity.ok(
                distractionLogService.getAllPaginated(pageable));
    }
}