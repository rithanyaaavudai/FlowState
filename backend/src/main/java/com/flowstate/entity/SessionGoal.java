package com.flowstate.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_goal")
public class SessionGoal {

    public enum GoalStatus {
        PENDING, ACHIEVED, PARTIAL, MISSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private FocusSession session;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull
    @Column(name = "target_minutes", nullable = false)
    private Integer targetMinutes;

    @Column(name = "achieved_minutes", nullable = false)
    private Integer achievedMinutes = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GoalStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SessionGoal() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = GoalStatus.PENDING;
        }
        if (this.achievedMinutes == null) {
            this.achievedMinutes = 0;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FocusSession getSession() { return session; }
    public void setSession(FocusSession session) { this.session = session; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getTargetMinutes() { return targetMinutes; }
    public void setTargetMinutes(Integer targetMinutes) { this.targetMinutes = targetMinutes; }
    public Integer getAchievedMinutes() { return achievedMinutes; }
    public void setAchievedMinutes(Integer achievedMinutes) { this.achievedMinutes = achievedMinutes; }
    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
