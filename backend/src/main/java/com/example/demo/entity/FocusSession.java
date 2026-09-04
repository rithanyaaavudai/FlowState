package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "focus_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private FlowUser practitioner;

    @Column(name = "practitioner_id")
    private Long practitionerId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "planned_start", nullable = false)
    private LocalDateTime plannedStart;

    @Column(name = "planned_end", nullable = false)
    private LocalDateTime plannedEnd;

    @Column(name = "actual_start")
    private LocalDateTime actualStart;

    @Column(name = "actual_end")
    private LocalDateTime actualEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private SessionType sessionType;

    @Column(name = "focus_score")
    private Integer focusScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "abandon_reason", columnDefinition = "TEXT")
    private String abandonReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SessionGoal> goals = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DistractionLog> distractions = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        if (this.practitioner != null) {
            this.practitionerId = this.practitioner.getId();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = SessionStatus.SCHEDULED;
        }
    }

    public enum SessionStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, ABANDONED
    }

    public enum SessionType {
        DEEP_WORK, CREATIVE, REVIEW
    }
}