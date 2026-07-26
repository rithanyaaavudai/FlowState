package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class FocusSessionRequestDto {

    @NotBlank
    private String title;

    private String status;

    public FocusSessionRequestDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}