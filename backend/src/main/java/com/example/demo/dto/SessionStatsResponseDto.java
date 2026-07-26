package com.example.demo.dto;

import java.util.Map;

public class SessionStatsResponseDto {
    private long totalSessions;
    private long completedSessions;
    private long abandonedSessions;
    private Double averageFocusScore;
    private Long totalFocusMinutes;
    private Map<String, Long> sessionTypeCounts;

    public SessionStatsResponseDto() {}
    public SessionStatsResponseDto(long totalSessions, long completedSessions, long abandonedSessions, Double averageFocusScore, Long totalFocusMinutes, Map<String, Long> sessionTypeCounts) {
        this.totalSessions = totalSessions; this.completedSessions = completedSessions;
        this.abandonedSessions = abandonedSessions; this.averageFocusScore = averageFocusScore;
        this.totalFocusMinutes = totalFocusMinutes; this.sessionTypeCounts = sessionTypeCounts;
    }
    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }
    public long getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(long completedSessions) { this.completedSessions = completedSessions; }
    public long getAbandonedSessions() { return abandonedSessions; }
    public void setAbandonedSessions(long abandonedSessions) { this.abandonedSessions = abandonedSessions; }
    public Double getAverageFocusScore() { return averageFocusScore; }
    public void setAverageFocusScore(Double averageFocusScore) { this.averageFocusScore = averageFocusScore; }
    public Long getTotalFocusMinutes() { return totalFocusMinutes; }
    public void setTotalFocusMinutes(Long totalFocusMinutes) { this.totalFocusMinutes = totalFocusMinutes; }
    public Map<String, Long> getSessionTypeCounts() { return sessionTypeCounts; }
    public void setSessionTypeCounts(Map<String, Long> sessionTypeCounts) { this.sessionTypeCounts = sessionTypeCounts; }
}
