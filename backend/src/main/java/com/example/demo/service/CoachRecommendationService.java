package com.example.demo.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CoachRecommendationRequestDto;
import com.example.demo.dto.CoachRecommendationResponseDto;
import com.example.demo.entity.CoachRecommendation;
import com.example.demo.entity.FlowUser;
import com.example.demo.exception.BusinessValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CoachRecommendationRepository;
import com.example.demo.repository.FlowUserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoachRecommendationService {

    private final CoachRecommendationRepository recommendationRepository;
    private final FlowUserRepository userRepository;

    public CoachRecommendationService(CoachRecommendationRepository recommendationRepository,
                                       FlowUserRepository userRepository) {
        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
    }

    public CoachRecommendationResponseDto issueRecommendation(CoachRecommendationRequestDto dto, Long coachId) {
        FlowUser coach = userRepository.findById(coachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found."));

        if (coach.getRole() != FlowUser.UserRole.FLOW_COACH && coach.getRole() != FlowUser.UserRole.PLATFORM_ADMIN) {
            throw new BusinessValidationException("Only coaches can issue recommendations.");
        }

        if (dto.getPractitionerId().equals(coachId)) {
            throw new BusinessValidationException("Cannot issue a recommendation to yourself.");
        }

        FlowUser practitioner = userRepository.findById(dto.getPractitionerId())
                .orElseThrow(() -> new ResourceNotFoundException("Practitioner not found."));

        if (practitioner.getRole() != FlowUser.UserRole.PRACTITIONER) {
            throw new BusinessValidationException("Recommendations can only be issued to practitioners.");
        }

        CoachRecommendation rec = new CoachRecommendation();
        rec.setCoach(coach);
        rec.setPractitioner(practitioner);
        rec.setRecommendationText(dto.getRecommendationText());
        rec.setPriority(CoachRecommendation.Priority.valueOf(dto.getPriority()));

        return mapToResponseDto(recommendationRepository.save(rec));
    }

    public CoachRecommendationResponseDto acknowledgeRecommendation(Long id, Long practitionerId) {
        CoachRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found."));

        if (!rec.getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("Recommendation not found.");
        }

        if (rec.getStatus() != CoachRecommendation.RecommendationStatus.PENDING) {
            throw new BusinessValidationException("Only PENDING recommendations can be acknowledged.");
        }

        rec.setStatus(CoachRecommendation.RecommendationStatus.ACKNOWLEDGED);
        rec.setAcknowledgedAt(LocalDateTime.now());
        return mapToResponseDto(recommendationRepository.save(rec));
    }

    public CoachRecommendationResponseDto dismissRecommendation(Long id, Long practitionerId) {
        CoachRecommendation rec = recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found."));

        if (!rec.getPractitioner().getId().equals(practitionerId)) {
            throw new ResourceNotFoundException("Recommendation not found.");
        }

        if (rec.getStatus() != CoachRecommendation.RecommendationStatus.PENDING) {
            throw new BusinessValidationException("Only PENDING recommendations can be dismissed.");
        }

        rec.setStatus(CoachRecommendation.RecommendationStatus.DISMISSED);
        return mapToResponseDto(recommendationRepository.save(rec));
    }

    public Page<CoachRecommendationResponseDto> getRecommendationsForPractitioner(Long practitionerId, Pageable pageable) {
        return recommendationRepository.findByPractitionerIdOrderByCreatedAtDesc(practitionerId, pageable)
                .map(this::mapToResponseDto);
    }

    public List<CoachRecommendationResponseDto> getPendingRecommendationsForPractitioner(Long practitionerId) {
        return recommendationRepository.findByPractitionerIdAndStatus(practitionerId,
                CoachRecommendation.RecommendationStatus.PENDING).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public Page<CoachRecommendationResponseDto> getRecommendationsByCoach(Long coachId, Pageable pageable) {
        return recommendationRepository.findByCoachIdOrderByCreatedAtDesc(coachId, pageable)
                .map(this::mapToResponseDto);
    }

    private CoachRecommendationResponseDto mapToResponseDto(CoachRecommendation r) {
        CoachRecommendationResponseDto dto = new CoachRecommendationResponseDto();
        dto.setId(r.getId());
        dto.setCoachId(r.getCoach().getId());
        dto.setCoachName(r.getCoach().getFullName());
        dto.setPractitionerId(r.getPractitioner().getId());
        dto.setPractitionerName(r.getPractitioner().getFullName());
        dto.setRecommendationText(r.getRecommendationText());
        dto.setPriority(r.getPriority() != null ? r.getPriority().name() : null);
        dto.setStatus(r.getStatus() != null ? r.getStatus().name() : null);
        dto.setCreatedAt(r.getCreatedAt());
        dto.setAcknowledgedAt(r.getAcknowledgedAt());
        return dto;
    }
}
