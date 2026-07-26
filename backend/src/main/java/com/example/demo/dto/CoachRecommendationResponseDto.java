package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachRecommendationResponseDto {
    private Long id;
    private Long coachId;
    private String coachName;
    private Long practitionerId;
    private String practitionerName;
    private String recommendationText;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime acknowledgedAt;
}