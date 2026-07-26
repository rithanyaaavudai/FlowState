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
public class SessionGoalResponseDto {
    private Long id;
    private Long sessionId;
    private String description;
    private Integer targetMinutes;
    private Integer achievedMinutes;
    private String status;
    private LocalDateTime createdAt;
}