package com.flowstate.controller;

import com.flowstate.dto.FocusBlockRequestDto;
import com.flowstate.dto.FocusBlockResponseDto;
import com.flowstate.service.FocusBlockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
public class FocusBlockController {

    private final FocusBlockService blockService;

    public FocusBlockController(FocusBlockService blockService) {
        this.blockService = blockService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> createBlock(
            @Valid @RequestBody FocusBlockRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.status(HttpStatus.CREATED).body(blockService.registerBlock(dto, userId));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<List<FocusBlockResponseDto>> getMyBlocks(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(blockService.getMyBlocks(userId));
    }

    @GetMapping("/capacity-plan")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<FocusBlockResponseDto>> getCapacityPlan(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(blockService.getCapacityPlan(userId));
    }

    @PutMapping("/{id}/protect")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> protectBlock(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(blockService.protectBlock(id, userId));
    }

    @PutMapping("/{id}/unprotect")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<FocusBlockResponseDto> unprotectBlock(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(blockService.unprotectBlock(id, userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PRACTITIONER', 'PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        String role = (String) request.getAttribute("authenticatedRole");
        if ("PLATFORM_ADMIN".equals(role)) {
            blockService.deleteBlockAdmin(id);
        } else {
            blockService.deleteBlock(id, userId);
        }
        return ResponseEntity.noContent().build();
    }
}
