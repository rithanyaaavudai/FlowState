package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FocusSessionRequestDto {

    @NotBlank(message = "Session title is required")
    @Size(max = 200)
    private String title;

    @NotNull(message = "Planned start time is required")
    private LocalDateTime plannedStart;

    @NotNull(message = "Planned end time is required")
    private LocalDateTime plannedEnd;

    @NotBlank(message = "Session type is required")
    private String sessionType;

    private String notes;
}