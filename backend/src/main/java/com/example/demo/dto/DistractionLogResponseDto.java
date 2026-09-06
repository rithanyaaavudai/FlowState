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
public class DistractionLogResponseDto {
    private Long id;
    private Long sessionId;
    private String sessionTitle;
    private Long practitionerId;
    private String practitionerName;
    private LocalDateTime loggedAt;
    private String category;
    private String description;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
}