package com.example.demo.dto;

public class AbandonSessionRequestDto {
    private String abandonReason;

    public AbandonSessionRequestDto() {}
    public AbandonSessionRequestDto(String abandonReason) { this.abandonReason = abandonReason; }
    public String getAbandonReason() { return abandonReason; }
    public void setAbandonReason(String abandonReason) { this.abandonReason = abandonReason; }
}
