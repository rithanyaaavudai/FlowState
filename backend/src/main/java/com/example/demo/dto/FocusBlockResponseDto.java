package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private Integer durationMinutes;
    private LocalDateTime createdAt;

    @JsonProperty("startTime")
    public String getStartTime() {
        return blockStartTime != null ? blockStartTime.toString() : null;
    }

    @JsonProperty("endTime")
    public String getEndTime() {
        return blockEndTime != null ? blockEndTime.toString() : null;
    }

    @JsonProperty("protected")
    public Boolean isProtectedFlag() {
        return isProtected != null ? isProtected : false;
    }
}