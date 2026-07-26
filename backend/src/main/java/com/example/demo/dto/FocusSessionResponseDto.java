package com.example.demo.dto;

public class FocusSessionResponseDto {

    private Long id;
    private String title;
    private String status;
    private Long userId;

    public FocusSessionResponseDto() {}

    public FocusSessionResponseDto(Long id, String title, String status, Long userId) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.userId = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}