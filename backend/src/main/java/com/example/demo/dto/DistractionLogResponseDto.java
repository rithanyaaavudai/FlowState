package com.example.demo.dto;

import java.time.LocalDateTime;

public class DistractionLogResponseDto {
    private Long id;
    private Long sessionId;
    private LocalDateTime loggedAt;
    private String category;
    private String description;
    private Integer durationSeconds;
    private LocalDateTime createdAt;

    public DistractionLogResponseDto() {}
    public DistractionLogResponseDto(Long id, Long sessionId, LocalDateTime loggedAt, String category, String description, Integer durationSeconds, LocalDateTime createdAt) {
        this.id = id; this.sessionId = sessionId; this.loggedAt = loggedAt;
        this.category = category; this.description = description;
        this.durationSeconds = durationSeconds; this.createdAt = createdAt;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
