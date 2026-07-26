package com.example.demo.dto;

import java.util.Map;

public class GoalCompletionRateResponseDto {
    private long totalGoals;
    private long achievedGoals;
    private long resolvedGoals;
    private double completionRate;
    private Map<String, Long> goalStatusCounts;

    public GoalCompletionRateResponseDto() {}
    public GoalCompletionRateResponseDto(long totalGoals, long achievedGoals, long resolvedGoals, double completionRate, Map<String, Long> goalStatusCounts) {
        this.totalGoals = totalGoals; this.achievedGoals = achievedGoals;
        this.resolvedGoals = resolvedGoals; this.completionRate = completionRate;
        this.goalStatusCounts = goalStatusCounts;
    }
    public long getTotalGoals() { return totalGoals; }
    public void setTotalGoals(long totalGoals) { this.totalGoals = totalGoals; }
    public long getAchievedGoals() { return achievedGoals; }
    public void setAchievedGoals(long achievedGoals) { this.achievedGoals = achievedGoals; }
    public long getResolvedGoals() { return resolvedGoals; }
    public void setResolvedGoals(long resolvedGoals) { this.resolvedGoals = resolvedGoals; }
    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    public Map<String, Long> getGoalStatusCounts() { return goalStatusCounts; }
    public void setGoalStatusCounts(Map<String, Long> goalStatusCounts) { this.goalStatusCounts = goalStatusCounts; }
}
