package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "coach_recommendation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachRecommendation {

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum RecommendationStatus {
        PENDING, ACKNOWLEDGED, DISMISSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    private FlowUser coach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practitioner_id", nullable = false)
    private FlowUser practitioner;

    @Lob
    @Column(name = "recommendation_text", nullable = false)
    private String recommendationText;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RecommendationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "acknowledged_at", nullable = true)
    private LocalDateTime acknowledgedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RecommendationStatus.PENDING;
        }
    }
}