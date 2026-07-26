package com.flowstate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.FlowUser;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlowUserRepository extends JpaRepository<FlowUser, Long> {
    Optional<FlowUser> findByUsername(String username);
    Optional<FlowUser> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<FlowUser> findByRole(FlowUser.UserRole role);

    @Query("SELECT u FROM FlowUser u WHERE u.role = :role AND u.isActive = true")
    List<FlowUser> findActiveByRole(@Param("role") FlowUser.UserRole role);

    @Query("SELECT COUNT(u) FROM FlowUser u WHERE u.role = :role AND u.isActive = true")
    long countActiveByRole(@Param("role") FlowUser.UserRole role);
}
