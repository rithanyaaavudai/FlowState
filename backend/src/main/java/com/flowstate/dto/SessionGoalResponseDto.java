package com.flowstate.dto;

import java.time.LocalDateTime;

public class SessionGoalResponseDto {
    private Long id;
    private Long sessionId;
    private String description;
    private Integer targetMinutes;
    private Integer achievedMinutes;
    private String status;
    private LocalDateTime createdAt;

    public SessionGoalResponseDto() {}
    public SessionGoalResponseDto(Long id, Long sessionId, String description, Integer targetMinutes, Integer achievedMinutes, String status, LocalDateTime createdAt) {
        this.id = id; this.sessionId = sessionId; this.description = description;
        this.targetMinutes = targetMinutes; this.achievedMinutes = achievedMinutes;
        this.status = status; this.createdAt = createdAt;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getTargetMinutes() { return targetMinutes; }
    public void setTargetMinutes(Integer targetMinutes) { this.targetMinutes = targetMinutes; }
    public Integer getAchievedMinutes() { return achievedMinutes; }
    public void setAchievedMinutes(Integer achievedMinutes) { this.achievedMinutes = achievedMinutes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
