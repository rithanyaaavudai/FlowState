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


    private Long getAuthenticatedUserId(jakarta.servlet.http.HttpServletRequest request) {
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

    @GetMapping
    public ResponseEntity<Object> getAllRecommendations(
            @RequestParam(required = false) Long practitionerId,
            @RequestParam(required = false) Long coachId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            jakarta.servlet.http.HttpServletRequest request) {

        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        if (practitionerId != null) {
            return ResponseEntity.ok(coachRecommendationService.getRecommendationsForPractitioner(practitionerId, pageable));
        }
        if (coachId != null) {
            return ResponseEntity.ok(coachRecommendationService.getRecommendationsByCoach(coachId, pageable));
        }

        return ResponseEntity.ok(coachRecommendationService.getAllRecommendationsPaginated(pageable));
    }

    @PostMapping
    public ResponseEntity<CoachRecommendationResponseDto> issueRecommendationFromAuth(
            @Valid @RequestBody CoachRecommendationRequestDto requestDto,
            jakarta.servlet.http.HttpServletRequest request) {

        Long coachId = getAuthenticatedUserId(request);
        CoachRecommendationResponseDto response =
                coachRecommendationService.issueRecommendation(requestDto, coachId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/coach/{coachId}")
    public ResponseEntity<CoachRecommendationResponseDto> issueRecommendation(
            @PathVariable Long coachId,
            @Valid @RequestBody CoachRecommendationRequestDto requestDto) {

        CoachRecommendationResponseDto response =
                coachRecommendationService.issueRecommendation(requestDto, coachId);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{recommendationId}/acknowledge")
    public ResponseEntity<CoachRecommendationResponseDto> acknowledgeMyRecommendation(
            @PathVariable Long recommendationId,
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        CoachRecommendationResponseDto response =
                coachRecommendationService.acknowledgeRecommendation(
                        recommendationId,
                        userId);

        return ResponseEntity.ok(response);
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

    @PutMapping("/{recommendationId}/dismiss")
    public ResponseEntity<CoachRecommendationResponseDto> dismissMyRecommendation(
            @PathVariable Long recommendationId,
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        CoachRecommendationResponseDto response =
                coachRecommendationService.dismissRecommendation(
                        recommendationId,
                        userId);

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

    @GetMapping("/mine/pending")
    public ResponseEntity<List<CoachRecommendationResponseDto>> getMyPendingRecommendations(
            jakarta.servlet.http.HttpServletRequest request) {

        Long userId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(
                coachRecommendationService.getPendingRecommendationsForPractitioner(
                        userId));
    }

    @GetMapping("/mine/issued")
    public ResponseEntity<Page<CoachRecommendationResponseDto>> getMyIssuedRecommendations(
            jakarta.servlet.http.HttpServletRequest request,
            Pageable pageable) {

        Long coachId = getAuthenticatedUserId(request);
        return ResponseEntity.ok(
                coachRecommendationService.getRecommendationsByCoach(
                        coachId,
                        pageable));
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