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
public class FocusSessionResponseDto {
    private Long id;
    private Long practitionerId;
    private String practitionerName;
    private String title;
    private LocalDateTime plannedStart;
    private LocalDateTime plannedEnd;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    private String status;
    private String sessionType;
    private Integer focusScore;
    private String notes;
    private String abandonReason;
    private LocalDateTime createdAt;
}