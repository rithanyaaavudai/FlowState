package com.flowstate.dto;

import jakarta.validation.constraints.*;

public class DistractionLogRequestDto {
    @NotNull
    private Long sessionId;
    @NotBlank
    private String category;
    private String description;
    @NotNull @Min(1)
    private Integer durationSeconds;

    public DistractionLogRequestDto() {}
    public DistractionLogRequestDto(Long sessionId, String category, String description, Integer durationSeconds) {
        this.sessionId = sessionId; this.category = category;
        this.description = description; this.durationSeconds = durationSeconds;
    }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
}
