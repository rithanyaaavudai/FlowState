package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "session_goal")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private FocusSession session;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "target_minutes", nullable = false)
    private Integer targetMinutes;

    @Column(name = "achieved_minutes", nullable = false)
    private Integer achievedMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.achievedMinutes == null) {
            this.achievedMinutes = 0;
        }
        if (this.status == null) {
            this.status = GoalStatus.PENDING;
        }
    }

    public enum GoalStatus {
        PENDING, ACHIEVED, PARTIAL, MISSED
    }
}