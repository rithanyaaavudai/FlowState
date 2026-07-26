package com.flowstate.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "focus_block")
public class FocusBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id", nullable = false)
    private FlowUser practitioner;

    @NotBlank
    @Size(max = 10)
    @Column(name = "day_of_week", nullable = false, length = 10)
    private String dayOfWeek;

    @NotNull
    @Column(name = "block_start_time", nullable = false)
    private LocalTime blockStartTime;

    @NotNull
    @Column(name = "block_end_time", nullable = false)
    private LocalTime blockEndTime;

    @Column(name = "is_protected", nullable = false)
    private Boolean isProtected = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_session_type", length = 20)
    private FocusSession.SessionType preferredSessionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FocusBlock() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isProtected == null) {
            this.isProtected = false;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FlowUser getPractitioner() {
        return practitioner;
    }

    public void setPractitioner(FlowUser practitioner) {
        this.practitioner = practitioner;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getBlockStartTime() {
        return blockStartTime;
    }

    public void setBlockStartTime(LocalTime blockStartTime) {
        this.blockStartTime = blockStartTime;
    }

    public LocalTime getBlockEndTime() {
        return blockEndTime;
    }

    public void setBlockEndTime(LocalTime blockEndTime) {
        this.blockEndTime = blockEndTime;
    }

    public Boolean getIsProtected() {
        return isProtected;
    }

    public void setIsProtected(Boolean isProtected) {
        this.isProtected = isProtected;
    }

    public FocusSession.SessionType getPreferredSessionType() {
        return preferredSessionType;
    }

    public void setPreferredSessionType(FocusSession.SessionType preferredSessionType) {
        this.preferredSessionType = preferredSessionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
