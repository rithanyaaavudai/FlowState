package com.flowstate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalTime;

public class FocusBlockRequestDto {
    @NotBlank
    @Pattern(regexp = "MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY")
    private String dayOfWeek;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime blockStartTime;

    @NotNull
    @JsonFormat(pattern = "HH:mm")
    private LocalTime blockEndTime;

    private String preferredSessionType;

    public FocusBlockRequestDto() {}
    public FocusBlockRequestDto(String dayOfWeek, LocalTime blockStartTime, LocalTime blockEndTime, String preferredSessionType) {
        this.dayOfWeek = dayOfWeek; this.blockStartTime = blockStartTime;
        this.blockEndTime = blockEndTime; this.preferredSessionType = preferredSessionType;
    }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getBlockStartTime() { return blockStartTime; }
    public void setBlockStartTime(LocalTime blockStartTime) { this.blockStartTime = blockStartTime; }
    public LocalTime getBlockEndTime() { return blockEndTime; }
    public void setBlockEndTime(LocalTime blockEndTime) { this.blockEndTime = blockEndTime; }
    public String getPreferredSessionType() { return preferredSessionType; }
    public void setPreferredSessionType(String preferredSessionType) { this.preferredSessionType = preferredSessionType; }
}
