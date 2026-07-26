package com.flowstate.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "distraction_log")
public class DistractionLog {

    public enum DistractionCategory {
        NOTIFICATION, SOCIAL, ENVIRONMENT, MENTAL, OTHER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private FocusSession session;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private DistractionCategory category;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotNull
    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DistractionLog() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.loggedAt == null) {
            this.loggedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FocusSession getSession() { return session; }
    public void setSession(FocusSession session) { this.session = session; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
    public DistractionCategory getCategory() { return category; }
    public void setCategory(DistractionCategory category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
