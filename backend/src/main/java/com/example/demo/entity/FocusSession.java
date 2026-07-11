package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "focus_session")
public class FocusSession {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "title", nullable = false)
    private String title;


    @Column(name = "status", nullable = false)
    private String status;


    @Column(name = "user_id", nullable = false)
    private Long userId;


    @OneToMany(mappedBy = "focusSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FocusBlock> focusBlocks = new ArrayList<>();


    public FocusSession() {}


    public FocusSession(String title, String status, Long userId) {
        this.title = title;
        this.status = status;
        this.userId = userId;
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getTitle() {
        return title;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }


    public Long getUserId() {
        return userId;
    }


    public void setUserId(Long userId) {
        this.userId = userId;
    }


    public List<FocusBlock> getFocusBlocks() {
        return focusBlocks;
    }


    public void setFocusBlocks(List<FocusBlock> focusBlocks) {
        this.focusBlocks = focusBlocks;
    }
}
