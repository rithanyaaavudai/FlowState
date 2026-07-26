package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalCompletionRateResponseDto {
    private long totalGoals;
    private long achievedGoals;
    private long resolvedGoals;
    private double completionRate;
}