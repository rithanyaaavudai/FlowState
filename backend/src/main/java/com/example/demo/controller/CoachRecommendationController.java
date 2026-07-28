package com.example.demo.controller;

import com.example.demo.dto.CoachRecommendationRequestDto;
import com.example.demo.dto.CoachRecommendationResponseDto;
import com.example.demo.service.CoachRecommendationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class CoachRecommendationController {

    private final CoachRecommendationService coachRecommendationService;


    @PostMapping("/coach/{coachId}")
    public ResponseEntity<CoachRecommendationResponseDto> issueRecommendation(
            @PathVariable Long coachId,
            @Valid @RequestBody CoachRecommendationRequestDto requestDto) {

        CoachRecommendationResponseDto response =
                coachRecommendationService.issueRecommendation(requestDto, coachId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    
    @PutMapping("/{recommendationId}/acknowledge/{practitionerId}")
    public ResponseEntity<CoachRecommendationResponseDto> acknowledgeRecommendation(
            @PathVariable Long recommendationId,
            @PathVariable Long practitionerId) {

        CoachRecommendationResponseDto response =
                coachRecommendationService.acknowledgeRecommendation(
                        recommendationId,
                        practitionerId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{recommendationId}/dismiss/{practitionerId}")
    public ResponseEntity<CoachRecommendationResponseDto> dismissRecommendation(
            @PathVariable Long recommendationId,
            @PathVariable Long practitionerId) {

        CoachRecommendationResponseDto response =
                coachRecommendationService.dismissRecommendation(
                        recommendationId,
                        practitionerId);

        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/practitioner/{practitionerId}")
    public ResponseEntity<Page<CoachRecommendationResponseDto>> getRecommendationsForPractitioner(
            @PathVariable Long practitionerId,
            Pageable pageable) {

        return ResponseEntity.ok(
                coachRecommendationService.getRecommendationsForPractitioner(
                        practitionerId,
                        pageable));
    }

    
    @GetMapping("/practitioner/{practitionerId}/pending")
    public ResponseEntity<List<CoachRecommendationResponseDto>> getPendingRecommendations(
            @PathVariable Long practitionerId) {

        return ResponseEntity.ok(
                coachRecommendationService.getPendingRecommendationsForPractitioner(
                        practitionerId));
    }

    
    @GetMapping("/coach/{coachId}")
    public ResponseEntity<Page<CoachRecommendationResponseDto>> getRecommendationsByCoach(
            @PathVariable Long coachId,
            Pageable pageable) {

        return ResponseEntity.ok(
                coachRecommendationService.getRecommendationsByCoach(
                        coachId,
                        pageable));
    }
}