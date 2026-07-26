package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coach_recommendation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    private FlowUser coach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id", nullable = false)
    private FlowUser practitioner;

    @Column(name = "recommendation_text", nullable = false, columnDefinition = "TEXT")
    private String recommendationText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RecommendationStatus.PENDING;
        }
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum RecommendationStatus {
        PENDING, ACKNOWLEDGED, DISMISSED
    }
}