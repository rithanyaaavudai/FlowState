package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SessionGoalRequestDto {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank
    @Size(max = 500)
    private String description;

    @NotNull
    @Min(value = 1, message = "Target minutes must be at least 1")
    private Integer targetMinutes;
}