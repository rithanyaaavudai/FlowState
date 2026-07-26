package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusBlockResponseDto {
    private Long id;
    private Long practitionerId;
    private String dayOfWeek;
    private LocalTime blockStartTime;
    private LocalTime blockEndTime;
    private Boolean isProtected;
    private String preferredSessionType;
    private LocalDateTime createdAt;
}