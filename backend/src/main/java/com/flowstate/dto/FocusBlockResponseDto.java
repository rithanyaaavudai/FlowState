package com.flowstate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class FocusBlockResponseDto {
    private Long id;
    private Long practitionerId;
    private String dayOfWeek;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime blockStartTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime blockEndTime;

    private Boolean isProtected;
    private String preferredSessionType;
    private LocalDateTime createdAt;

    public FocusBlockResponseDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPractitionerId() { return practitionerId; }
    public void setPractitionerId(Long practitionerId) { this.practitionerId = practitionerId; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public LocalTime getBlockStartTime() { return blockStartTime; }
    public void setBlockStartTime(LocalTime blockStartTime) { this.blockStartTime = blockStartTime; }
    public LocalTime getBlockEndTime() { return blockEndTime; }
    public void setBlockEndTime(LocalTime blockEndTime) { this.blockEndTime = blockEndTime; }
    public Boolean getIsProtected() { return isProtected; }
    public void setIsProtected(Boolean isProtected) { this.isProtected = isProtected; }
    public String getPreferredSessionType() { return preferredSessionType; }
    public void setPreferredSessionType(String preferredSessionType) { this.preferredSessionType = preferredSessionType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
