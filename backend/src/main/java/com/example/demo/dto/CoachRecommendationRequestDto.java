package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CoachRecommendationRequestDto {

    @NotNull(message = "Practitioner ID is required")
    private Long practitionerId;

    @NotBlank
    @Size(min = 10, message = "Recommendation must be at least 10 characters")
    private String recommendationText;

    @NotBlank(message = "Priority is required")
    private String priority;
}