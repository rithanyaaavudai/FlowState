package com.example.demo.controller;

import com.example.demo.dto.DistractionBreakdownResponseDto;
import com.example.demo.dto.DistractionLogRequestDto;
import com.example.demo.dto.DistractionLogResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.service.DistractionLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/distractions")
@RequiredArgsConstructor
@CrossOrigin
public class DistractionLogController {

    private final DistractionLogService distractionLogService;
    private final FlowUserRepository flowUserRepository;

    private Long getAuthenticatedUserId(HttpServletRequest request) {
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
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().isBlank() && !"anonymousUser".equals(auth.getName())) {
                return flowUserRepository.findByUsername(auth.getName())
                        .or(() -> flowUserRepository.findByEmail(auth.getName()))
                        .map(FlowUser::getId)
                        .orElse(1L);
            }
        } catch (Exception ignored) {
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
            @RequestParam(required = false) Long practitionerId,
            jakarta.servlet.http.HttpServletRequest request) {

        if (practitionerId != null) {
            return ResponseEntity.ok(distractionLogService.getDistractionBreakdown(practitionerId));
        }

        Long userId = getAuthenticatedUserId(request);
        boolean isAdmin = request.isUserInRole("ROLE_PLATFORM_ADMIN") || request.isUserInRole("PLATFORM_ADMIN");
        if (isAdmin) {
            return ResponseEntity.ok(distractionLogService.getDistractionBreakdown(null));
        }
        return ResponseEntity.ok(
                distractionLogService.getDistractionBreakdown(userId));
    }

    @GetMapping("/trend")
    public ResponseEntity<List<Map<String, Object>>> getMyDistractionTrend(
            @RequestParam(required = false) Long practitionerId,
            jakarta.servlet.http.HttpServletRequest request) {

        if (practitionerId != null) {
            return ResponseEntity.ok(distractionLogService.getDistractionTrendByWeek(practitionerId));
        }

        Long userId = getAuthenticatedUserId(request);
        boolean isAdmin = request.isUserInRole("ROLE_PLATFORM_ADMIN") || request.isUserInRole("PLATFORM_ADMIN");
        if (isAdmin) {
            return ResponseEntity.ok(distractionLogService.getDistractionTrendByWeek(null));
        }
        return ResponseEntity.ok(
                distractionLogService.getDistractionTrendByWeek(userId));
    }

    @GetMapping("/platform/breakdown")
    public ResponseEntity<DistractionBreakdownResponseDto> getPlatformBreakdown() {
        return ResponseEntity.ok(distractionLogService.getDistractionBreakdown(null));
    }

    @GetMapping("/platform/trend")
    public ResponseEntity<List<Map<String, Object>>> getPlatformTrend() {
        return ResponseEntity.ok(distractionLogService.getDistractionTrendByWeek(null));
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "loggedAt"));
        return ResponseEntity.ok(
                distractionLogService.getAllPaginated(pageable));
    }
}