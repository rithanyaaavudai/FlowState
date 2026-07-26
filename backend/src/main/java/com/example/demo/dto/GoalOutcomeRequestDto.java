package com.example.demo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class GoalOutcomeRequestDto {
    @NotNull @Min(0)
    private Integer achievedMinutes;

    public GoalOutcomeRequestDto() {}
    public GoalOutcomeRequestDto(Integer achievedMinutes) { this.achievedMinutes = achievedMinutes; }
    public Integer getAchievedMinutes() { return achievedMinutes; }
    public void setAchievedMinutes(Integer achievedMinutes) { this.achievedMinutes = achievedMinutes; }
}
