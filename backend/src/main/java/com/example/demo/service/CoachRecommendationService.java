package com.example.demo.service;

import com.example.demo.dto.CoachRecommendationRequestDto;
import com.example.demo.dto.CoachRecommendationResponseDto;
import com.example.demo.entity.CoachRecommendation;
import com.example.demo.entity.FlowUser;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CoachRecommendationRepository;
import com.example.demo.repository.FlowUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachRecommendationService {

    private final CoachRecommendationRepository coachRecommendationRepository;
    private final FlowUserRepository flowUserRepository;

    @Transactional
    public CoachRecommendationResponseDto issueRecommendation(CoachRecommendationRequestDto dto, Long coachId) {
        FlowUser coach = flowUserRepository.findById(coachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));

        // 1. Coach Role Validation [REQ-SVC-REC-01]
        if (coach.getRole() != FlowUser.UserRole.FLOW_COACH) {
            throw new BusinessValidationException("Only users with the FLOW_COACH role can issue recommendations");
        }

        FlowUser practitioner = flowUserRepository.findById(dto.getPractitionerId())
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found"));

        // 2. Recipient Role Validation [REQ-SVC-REC-01]
        if (practitioner.getRole() != FlowUser.UserRole.PRACTITIONER) {
            throw new BusinessValidationException("Recommendations can only be issued to users with the PRACTITIONER role");
        }

        // 3. Self-recommendation Check [REQ-SVC-REC-01]
        if (dto.getPractitionerId().equals(coachId)) {
            throw new BusinessValidationException("A coach cannot issue a recommendation to themselves");
        }

        CoachRecommendation recommendation = CoachRecommendation.builder()
                .coach(coach)
                .practitioner(practitioner)
                .recommendationText(dto.getRecommendationText())
                .priority(CoachRecommendation.Priority.valueOf(dto.getPriority()))
                .status(CoachRecommendation.RecommendationStatus.PENDING)
                .build();

        return toResponseDto(coachRecommendationRepository.save(recommendation));
    }

    @Transactional
    public CoachRecommendationResponseDto acknowledgeRecommendation(Long id, Long practitionerId) {
        CoachRecommendation recommendation = getOwnedByPractitioner(id, practitionerId);
        recommendation.setStatus(CoachRecommendation.RecommendationStatus.ACKNOWLEDGED);
        recommendation.setAcknowledgedAt(LocalDateTime.now());
        return toResponseDto(coachRecommendationRepository.save(recommendation));
    }

    @Transactional
    public CoachRecommendationResponseDto dismissRecommendation(Long id, Long practitionerId) {
        CoachRecommendation recommendation = getOwnedByPractitioner(id, practitionerId);
        recommendation.setStatus(CoachRecommendation.RecommendationStatus.DISMISSED);
        return toResponseDto(coachRecommendationRepository.save(recommendation));
    }

    public Page<CoachRecommendationResponseDto> getRecommendationsForPractitioner(Long practitionerId, Pageable pageable) {
        return coachRecommendationRepository.findByPractitionerIdOrderByCreatedAtDesc(practitionerId, pageable)
                .map(this::toResponseDto);
    }

    public List<CoachRecommendationResponseDto> getPendingRecommendationsForPractitioner(Long practitionerId) {
        return coachRecommendationRepository.findByPractitionerIdAndStatus(practitionerId, CoachRecommendation.RecommendationStatus.PENDING)
                .stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public Page<CoachRecommendationResponseDto> getRecommendationsByCoach(Long coachId, Pageable pageable) {
        return coachRecommendationRepository.findByCoachIdOrderByCreatedAtDesc(coachId, pageable)
                .map(this::toResponseDto);
    }

    private CoachRecommendation getOwnedByPractitioner(Long id, Long practitionerId) {
        CoachRecommendation recommendation = coachRecommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CoachRecommendation not found"));

        if (!recommendation.getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("CoachRecommendation not found");
        }
        return recommendation;
    }

    private CoachRecommendationResponseDto toResponseDto(CoachRecommendation recommendation) {
        return CoachRecommendationResponseDto.builder()
                .id(recommendation.getId())
                .coachId(recommendation.getCoach().getId())
                .coachName(recommendation.getCoach().getFullName())
                .practitionerId(recommendation.getPractitioner().getId())
                .practitionerName(recommendation.getPractitioner().getFullName())
                .recommendationText(recommendation.getRecommendationText())
                .priority(recommendation.getPriority().name())
                .status(recommendation.getStatus().name())
                .createdAt(recommendation.getCreatedAt())
                .acknowledgedAt(recommendation.getAcknowledgedAt())
                .build();
    }
}