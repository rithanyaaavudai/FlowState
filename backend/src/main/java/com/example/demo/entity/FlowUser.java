package com.example.demo.entity;
import java.time.LocalDateTime;

import org.springframework.cglib.core.Local;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


@Entity
@Table(name="Flow_user")
public class FlowUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max=100)
    @Column(name="username",unique=true,nullable=false,length=100)
    private String username;

    @NotBlank
    @Email
    @Size(max=100)
    @Column(name="email",unique=true,nullable=false,length=100)
    private String email;

    @NotBlank
    @Column(name="password_hash",nullable=false)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name="full_name",nullable=false,length=150)
    private String fullName;

    @NotNull
    @Column(name="is_active",nullable=false)
    private Boolean isActive=true;

    @Column(name="created_at",nullable=false,updatable=false)
    private LocalDateTime createdAt;

    @Column(name="last_login_at")
    private LocalDateTime lastLoginAt;

    @PrePersist
    protected void onCreate(){
        this.createdAt=LocalDateTime.now();
    }
    public Long getId(){
        return id;
    }
    public String setId(Long id){
        this.id=id;
    }
    public String getUsername(){
        return username;
    }
    public String setUsername(String username){
        this.username=username;
    }
    public String getEmail(){
        return email;
    }
    public String setEmail(String email){
        this.email=email;
    }
    public String getPasswordHash(){
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash){
        this.passwordHash=password;
    }
    

}
