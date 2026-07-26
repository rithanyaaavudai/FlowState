package com.example.demo.dto;

import jakarta.validation.constraints.*;

public class CoachRecommendationRequestDto {
    @NotNull
    private Long practitionerId;
    @NotBlank @Size(min = 10)
    private String recommendationText;
    @NotBlank
    private String priority;

    public CoachRecommendationRequestDto() {}
    public CoachRecommendationRequestDto(Long practitionerId, String recommendationText, String priority) {
        this.practitionerId = practitionerId; this.recommendationText = recommendationText; this.priority = priority;
    }
    public Long getPractitionerId() { return practitionerId; }
    public void setPractitionerId(Long practitionerId) { this.practitionerId = practitionerId; }
    public String getRecommendationText() { return recommendationText; }
    public void setRecommendationText(String recommendationText) { this.recommendationText = recommendationText; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
