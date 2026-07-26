package com.example.demo.dto;

import jakarta.validation.constraints.*;

public class SessionGoalRequestDto {
    @NotNull
    private Long sessionId;
    @NotBlank @Size(max = 500)
    private String description;
    @NotNull @Min(1)
    private Integer targetMinutes;

    public SessionGoalRequestDto() {}
    public SessionGoalRequestDto(Long sessionId, String description, Integer targetMinutes) {
        this.sessionId = sessionId; this.description = description; this.targetMinutes = targetMinutes;
    }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getTargetMinutes() { return targetMinutes; }
    public void setTargetMinutes(Integer targetMinutes) { this.targetMinutes = targetMinutes; }
}
