package com.example.demo.entity;
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
    
    public String getUsername(){
        return username;
    }
    public String setUsername(String username){
        this.username=username;
    }
    public String getPassword(){
        return password;
    }
    public String setPassword(String password){
        this.password=password;
    }
    

}
