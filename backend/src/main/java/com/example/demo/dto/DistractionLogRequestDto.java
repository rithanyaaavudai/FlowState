package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DistractionLogRequestDto {

    @NotNull(message = "Session ID is required")
    private Long sessionId;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;

    @NotNull
    @Min(value = 1, message = "Duration must be at least 1 second")
    private Integer durationSeconds;
}