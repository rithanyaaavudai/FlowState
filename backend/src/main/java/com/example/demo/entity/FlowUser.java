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

    @Column(unique=true)
    private String username;
    private String password;

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
