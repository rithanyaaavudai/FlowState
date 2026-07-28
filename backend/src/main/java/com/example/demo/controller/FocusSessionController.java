package com.example.demo.controller;

import com.example.demo.dto.FocusSessionRequestDto;
import com.example.demo.dto.FocusSessionResponseDto;
import com.example.demo.service.FocusSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<Object> getAllSessions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                focusSessionService.getAllSessionsPaginated(
                        search,
                        status,
                        page,
                        size
                )
        );
    }

    

    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusSessionResponseDto> scheduleSession(
            @RequestBody @Valid FocusSessionRequestDto dto,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        FocusSessionResponseDto response =
                focusSessionService.scheduleSession(dto, userId);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    

    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> startSession(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                focusSessionService.startSession(id, userId)
        );
    }

    

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> getSessionDetails(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                focusSessionService.getSession(id, userId)
        );
    }

    

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<String> deleteSession(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        focusSessionService.deleteSession(id, userId);

        return ResponseEntity.ok(
                "FocusSession deleted successfully."
        );
    }

    

    private Long getAuthenticatedUserId(HttpServletRequest request) {

        if (request != null) {

            Object attribute =
                    request.getAttribute("authenticatedUserId");

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
}