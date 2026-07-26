package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "distraction_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    @Column(name = "category", nullable = false, length = 30)
    private DistractionCategory category;

    @Column(name = "description", length = 500, nullable = true)
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
}