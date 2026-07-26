package com.flowstate.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class FocusSessionRequestDto {
    @NotBlank @Size(max = 200)
    private String title;
    @NotNull
    private LocalDateTime plannedStart;
    @NotNull
    private LocalDateTime plannedEnd;
    @NotBlank
    private String sessionType;
    private String notes;

    public FocusSessionRequestDto() {}
    public FocusSessionRequestDto(String title, LocalDateTime plannedStart, LocalDateTime plannedEnd, String sessionType, String notes) {
        this.title = title; this.plannedStart = plannedStart; this.plannedEnd = plannedEnd;
        this.sessionType = sessionType; this.notes = notes;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDateTime getPlannedStart() { return plannedStart; }
    public void setPlannedStart(LocalDateTime plannedStart) { this.plannedStart = plannedStart; }
    public LocalDateTime getPlannedEnd() { return plannedEnd; }
    public void setPlannedEnd(LocalDateTime plannedEnd) { this.plannedEnd = plannedEnd; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
