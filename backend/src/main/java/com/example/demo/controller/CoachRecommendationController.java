package com.example.demo.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.CoachRecommendationRequestDto;
import com.example.demo.dto.CoachRecommendationResponseDto;
import com.example.demo.service.CoachRecommendationService;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class CoachRecommendationController {

    private final CoachRecommendationService recommendationService;

    public CoachRecommendationController(CoachRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FLOW_COACH', 'PLATFORM_ADMIN')")
    public ResponseEntity<CoachRecommendationResponseDto> issueRecommendation(
            @Valid @RequestBody CoachRecommendationRequestDto dto,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.status(HttpStatus.CREATED).body(recommendationService.issueRecommendation(dto, userId));
    }

    @GetMapping("/practitioner/{practitionerId}")
    @PreAuthorize("hasAnyRole('FLOW_COACH', 'PLATFORM_ADMIN', 'PRACTITIONER')")
    public ResponseEntity<Page<CoachRecommendationResponseDto>> getForPractitioner(
            @PathVariable Long practitionerId, Pageable pageable) {
        return ResponseEntity.ok(recommendationService.getRecommendationsForPractitioner(practitionerId, pageable));
    }

    @GetMapping("/mine/pending")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<List<CoachRecommendationResponseDto>> getMyPending(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(recommendationService.getPendingRecommendationsForPractitioner(userId));
    }

    @GetMapping("/mine/issued")
    @PreAuthorize("hasRole('FLOW_COACH')")
    public ResponseEntity<Page<CoachRecommendationResponseDto>> getMyIssued(
            HttpServletRequest request, Pageable pageable) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(recommendationService.getRecommendationsByCoach(userId, pageable));
    }

    @PutMapping("/{id}/acknowledge")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<CoachRecommendationResponseDto> acknowledge(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(recommendationService.acknowledgeRecommendation(id, userId));
    }

    @PutMapping("/{id}/dismiss")
    @PreAuthorize("hasRole('PRACTITIONER')")
    public ResponseEntity<CoachRecommendationResponseDto> dismiss(
            @PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("authenticatedUserId");
        return ResponseEntity.ok(recommendationService.dismissRecommendation(id, userId));
    }
}
