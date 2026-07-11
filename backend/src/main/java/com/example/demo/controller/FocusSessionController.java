package com.example.demo.controller;


import com.example.demo.dto.FocusSessionRequestDto;
import com.example.demo.dto.FocusSessionResponseDto;
import com.example.demo.service.FocusSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/sessions")
@CrossOrigin
public class FocusSessionController {


    private final FocusSessionService focusSessionService;


    public FocusSessionController(FocusSessionService focusSessionService) {
        this.focusSessionService = focusSessionService;
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'PRACTITIONER', 'PLATFORM_ADMIN')")
    public ResponseEntity<Page<FocusSessionResponseDto>> getAllSessions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<FocusSessionResponseDto> response = focusSessionService.getAllSessionsPaginated(search, status, page, size);
        return ResponseEntity.ok(response);
    }


    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> scheduleSession(
            @RequestBody @Valid FocusSessionRequestDto dto,
            HttpServletRequest request) {
        Long authenticatedUserId = 1L;
        if (request != null && request.getAttribute("authenticatedUserId") != null) {
            authenticatedUserId = (Long) request.getAttribute("authenticatedUserId");
        }
        FocusSessionResponseDto responseDto = focusSessionService.scheduleSession(dto, authenticatedUserId);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }


    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('USER', 'PRACTITIONER', 'PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> startSession(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long authenticatedUserId = 1L;
        if (request != null && request.getAttribute("authenticatedUserId") != null) {
            authenticatedUserId = (Long) request.getAttribute("authenticatedUserId");
        }
        FocusSessionResponseDto responseDto = focusSessionService.startSession(id, authenticatedUserId);
        return ResponseEntity.ok(responseDto);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'PRACTITIONER', 'PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> getSessionDetails(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long authenticatedUserId = 1L;
        if (request != null && request.getAttribute("authenticatedUserId") != null) {
            authenticatedUserId = (Long) request.getAttribute("authenticatedUserId");
        }
        FocusSessionResponseDto responseDto = focusSessionService.getSessionDetails(id, authenticatedUserId);
        return ResponseEntity.ok(responseDto);
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<String> deleteSession(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long authenticatedUserId = 1L;
        if (request != null && request.getAttribute("authenticatedUserId") != null) {
            authenticatedUserId = (Long) request.getAttribute("authenticatedUserId");
        }
        focusSessionService.deleteSession(id, authenticatedUserId);
        return ResponseEntity.ok("FocusSession deleted successfully.");
    }
}


