package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "focus_block")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FocusBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private FlowUser practitioner;

    @Column(name = "practitioner_id")
    private Long practitionerId;

    @Column(name = "day_of_week", nullable = false, length = 10)
    private String dayOfWeek;

    @Column(name = "block_start_time", nullable = false)
    private LocalTime blockStartTime;

    @Column(name = "block_end_time", nullable = false)
    private LocalTime blockEndTime;

    @Column(name = "is_protected", nullable = false)
    private Boolean isProtected;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_session_type", length = 20)
    private FocusSession.SessionType preferredSessionType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @PreUpdate
    protected void onPersistOrUpdate() {
        if (this.practitioner != null) {
            this.practitionerId = this.practitioner.getId();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isProtected == null) {
            this.isProtected = false;
        }
    }
}