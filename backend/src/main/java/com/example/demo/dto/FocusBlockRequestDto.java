package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalTime;

@Data
public class FocusBlockRequestDto {

    @NotBlank
    @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY",
            message = "Day must be a valid day of week in uppercase")
    private String dayOfWeek;

    @NotNull
    private LocalTime blockStartTime;

    @NotNull
    private LocalTime blockEndTime;

    private String preferredSessionType;
}