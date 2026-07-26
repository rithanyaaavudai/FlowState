package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "distraction_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistractionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private FocusSession session;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DistractionCategory category;

    @Column(length = 500)
    private String description;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.loggedAt == null) {
            this.loggedAt = LocalDateTime.now();
        }
    }

    public enum DistractionCategory {
        NOTIFICATION, SOCIAL, ENVIRONMENT, MENTAL, OTHER
    }
}