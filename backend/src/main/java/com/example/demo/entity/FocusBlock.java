package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "focus_block")
public class FocusBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_name", nullable = false)
    private String taskName;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "focus_session_id")
    private FocusSession focusSession;

    public FocusBlock() {}

    public FocusBlock(String taskName, Integer durationMinutes, FocusSession focusSession) {
        this.taskName = taskName;
        this.durationMinutes = durationMinutes;
        this.focusSession = focusSession;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public FocusSession getFocusSession() { return focusSession; }
    public void setFocusSession(FocusSession focusSession) { this.focusSession = focusSession; }
}