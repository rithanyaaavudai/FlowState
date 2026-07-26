package com.example.demo.dto;

public class DistractionBreakdownResponseDto {
    private String category;
    private Long count;
    private Long totalDurationSeconds;

    public DistractionBreakdownResponseDto() {}
    public DistractionBreakdownResponseDto(String category, Long count, Long totalDurationSeconds) {
        this.category = category; this.count = count; this.totalDurationSeconds = totalDurationSeconds;
    }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Long getCount() { return count; }
    public void setCount(Long count) { this.count = count; }
    public Long getTotalDurationSeconds() { return totalDurationSeconds; }
    public void setTotalDurationSeconds(Long totalDurationSeconds) { this.totalDurationSeconds = totalDurationSeconds; }
}
