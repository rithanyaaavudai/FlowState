package com.example.demo.controller;

import com.example.demo.dto.FocusBlockRequestDto;
import com.example.demo.dto.FocusBlockResponseDto;
import com.example.demo.service.FocusBlockService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
public class FocusBlockController {

    private final FocusBlockService focusBlockService;

    public FocusBlockController(FocusBlockService focusBlockService) {
        this.focusBlockService = focusBlockService;
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
        return 1L;
    }

    @PostMapping
    public ResponseEntity<FocusBlockResponseDto> registerBlock(
            @Valid @RequestBody FocusBlockRequestDto dto,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        FocusBlockResponseDto response = focusBlockService.registerBlock(dto, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<FocusBlockResponseDto>> getMyBlocks(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.getMyBlocks(userId));
    }

    @GetMapping("/capacity-plan")
    public ResponseEntity<List<FocusBlockResponseDto>> getCapacityPlan(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.getCapacityPlan(userId));
    }

    @PutMapping("/{id}/protect")
    public ResponseEntity<FocusBlockResponseDto> protectBlock(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.protectBlock(id, userId));
    }

    @PutMapping("/{id}/unprotect")
    public ResponseEntity<FocusBlockResponseDto> unprotectBlock(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(focusBlockService.unprotectBlock(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        focusBlockService.deleteBlock(id, userId);

        return ResponseEntity.noContent().build();
    }
}