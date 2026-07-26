package com.flowstate.controller;

import com.flowstate.dto.DistractionBreakdownResponseDto;
import com.flowstate.dto.DistractionLogRequestDto;
import com.flowstate.dto.DistractionLogResponseDto;
import com.flowstate.service.DistractionLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/distractions")
public class DistractionLogController {

    private final DistractionLogService distractionLogService;

    public DistractionLogController(DistractionLogService distractionLogService) {
        this.distractionLogService = distractionLogService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<DistractionLogResponseDto> logDistraction(
            @Valid @RequestBody DistractionLogRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.status(HttpStatus.CREATED).body(distractionLogService.logDistraction(dto, userId));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<DistractionLogResponseDto>> getLogsForSession(
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(distractionLogService.getLogsForSession(sessionId));
    }

    @GetMapping("/breakdown")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<DistractionBreakdownResponseDto>> getBreakdown(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(distractionLogService.getDistractionBreakdown(userId));
    }

    @GetMapping("/trend")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<Object[]>> getTrend(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(distractionLogService.getDistractionTrendByWeek(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Page<DistractionLogResponseDto>> getAllDistractions(Pageable pageable) {
        return ResponseEntity.ok(distractionLogService.getAllDistractionsPageable(pageable));
    }
}
