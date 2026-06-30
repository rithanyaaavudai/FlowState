package com.example.demo.entity;
import com.example.demo.enums.UserRole;
import jakarta.persistence.*;

@Entity
@Table(name="users")
public class FlowUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column

}
