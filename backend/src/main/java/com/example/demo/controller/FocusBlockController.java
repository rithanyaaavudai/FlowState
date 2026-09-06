package com.example.demo.controller;

import com.example.demo.dto.FocusBlockRequestDto;
import com.example.demo.dto.FocusBlockResponseDto;
import com.example.demo.entity.FlowUser;
import com.example.demo.repository.FlowUserRepository;
import com.example.demo.service.FocusBlockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
@CrossOrigin
public class FocusBlockController {

    private final FocusBlockService focusBlockService;
    private final FlowUserRepository flowUserRepository;

    public FocusBlockController(FocusBlockService focusBlockService, FlowUserRepository flowUserRepository) {
        this.focusBlockService = focusBlockService;
        this.flowUserRepository = flowUserRepository;
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
                        .map(FlowUser::getId)
                        .orElse(1L);
            }
        } catch (Exception ignored) {
        }
        return 1L;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> registerBlock(
            @Valid @RequestBody FocusBlockRequestDto dto,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        FocusBlockResponseDto response = focusBlockService.registerBlock(dto, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'FLOW_COACH', 'PRACTITIONER')")
    public ResponseEntity<List<FocusBlockResponseDto>> getBlocks(
            @RequestParam(required = false) Long practitionerId,
            HttpServletRequest request) {
        if (practitionerId != null) {
            return ResponseEntity.ok(focusBlockService.getMyBlocks(practitionerId));
        }
        boolean isAdmin = request.isUserInRole("ROLE_PLATFORM_ADMIN") || request.isUserInRole("PLATFORM_ADMIN");
        if (isAdmin) {
            return ResponseEntity.ok(focusBlockService.getAllBlocks());
        }
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.getMyBlocks(userId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<FocusBlockResponseDto>> getAllBlocks() {
        return ResponseEntity.ok(focusBlockService.getAllBlocks());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'FLOW_COACH', 'PRACTITIONER')")
    public ResponseEntity<List<FocusBlockResponseDto>> getMyBlocks(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.getMyBlocks(userId));
    }

    @GetMapping("/capacity-plan")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'FLOW_COACH', 'PRACTITIONER')")
    public ResponseEntity<List<FocusBlockResponseDto>> getCapacityPlan(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.getCapacityPlan(userId));
    }

    @PutMapping("/{id}/protect")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> protectBlock(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.protectBlock(id, userId));
    }

    @PutMapping("/{id}/unprotect")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> unprotectBlock(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.unprotectBlock(id, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'PRACTITIONER')")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        focusBlockService.deleteBlock(id, userId);

        return ResponseEntity.noContent().build();
    }
}