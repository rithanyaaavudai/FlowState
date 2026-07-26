package com.flowstate.dto;

public class AuthResponseDto {
    private String accessToken;
    private String refreshToken;
    private String username;
    private String role;
    private Long userId;
    private String fullName;

    public AuthResponseDto() {}
    public AuthResponseDto(String accessToken, String refreshToken, String username, String role, Long userId, String fullName) {
        this.accessToken = accessToken; this.refreshToken = refreshToken; this.username = username;
        this.role = role; this.userId = userId; this.fullName = fullName;
    }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
