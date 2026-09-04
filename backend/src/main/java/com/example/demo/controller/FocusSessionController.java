package com.example.demo.controller;

import com.example.demo.dto.FocusSessionRequestDto;
import com.example.demo.dto.FocusSessionResponseDto;
import com.example.demo.service.FocusSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin
public class FocusSessionController {

    private final FocusSessionService focusSessionService;
    private final com.example.demo.repository.FlowUserRepository flowUserRepository;

    public FocusSessionController(FocusSessionService focusSessionService,
                                  com.example.demo.repository.FlowUserRepository flowUserRepository) {
        this.focusSessionService = focusSessionService;
        this.flowUserRepository = flowUserRepository;
    }

    

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','FLOW_COACH','PLATFORM_ADMIN')")
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


    // GET /api/sessions/mine  — paginated sessions for the authenticated user
    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','FLOW_COACH','PLATFORM_ADMIN')")
    public ResponseEntity<Object> getMySessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(focusSessionService.getMySessionsPaginated(userId, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
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

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> completeSession(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusSessionService.completeSession(id, userId));
    }

    @PutMapping("/{id}/abandon")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> abandonSession(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(focusSessionService.abandonSession(id, reason, userId));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','FLOW_COACH','PLATFORM_ADMIN')")
    public ResponseEntity<Object> getStats(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusSessionService.getSummaryStats(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','FLOW_COACH','PLATFORM_ADMIN')")
    public ResponseEntity<FocusSessionResponseDto> getSessionDetails(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);

        return ResponseEntity.ok(
                focusSessionService.getSession(id, userId)
        );
    }

    

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','PRACTITIONER','FLOW_COACH','PLATFORM_ADMIN')")
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
                        .map(com.example.demo.entity.FlowUser::getId)
                        .orElse(1L);
            }
        } catch (Exception ignored) {
        }

        return 1L;
    }
}