package com.flowstate.dto;

import jakarta.validation.constraints.*;

public class RegisterDto {
    @NotBlank @Size(min = 3, max = 100)
    private String username;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8)
    private String password;
    @NotBlank
    private String fullName;
    @NotBlank
    private String role;

    public RegisterDto() {}
    public RegisterDto(String username, String email, String password, String fullName, String role) {
        this.username = username; this.email = email; this.password = password; this.fullName = fullName; this.role = role;
    }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
