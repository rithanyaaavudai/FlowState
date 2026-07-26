package com.flowstate.controller;

import com.flowstate.dto.AbandonSessionRequestDto;
import com.flowstate.dto.FocusSessionRequestDto;
import com.flowstate.dto.FocusSessionResponseDto;
import com.flowstate.dto.SessionStatsResponseDto;
import com.flowstate.service.FocusSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class FocusSessionController {

    private final FocusSessionService sessionService;

    public FocusSessionController(FocusSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> createSession(
            @Valid @RequestBody FocusSessionRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        FocusSessionResponseDto response = sessionService.scheduleSession(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<Page<FocusSessionResponseDto>> getMySessions(
            HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.getMySessionsPaginated(userId, pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'FLOW_COACH')")
    public ResponseEntity<Page<FocusSessionResponseDto>> getAllSessions(Pageable pageable) {
        return ResponseEntity.ok(sessionService.getAllSessionsPaginated(pageable));
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> startSession(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.startSession(id, userId));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> completeSession(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.completeSession(id, userId));
    }

    @PutMapping("/{id}/abandon")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> abandonSession(
            @PathVariable Long id,
            @RequestBody AbandonSessionRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.abandonSession(id, dto.getAbandonReason(), userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> getSession(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.getSessionById(id, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<String> deleteSession(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        sessionService.deleteSession(id, userId);
        return ResponseEntity.ok("FocusSession deleted successfully.");
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'PLATFORM_ADMIN')")
    public ResponseEntity<SessionStatsResponseDto> getStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(sessionService.getSummaryStats(userId));
    }
}
