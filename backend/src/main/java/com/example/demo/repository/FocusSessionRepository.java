package com.example.demo.repository;

import com.example.demo.entity.FocusSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FocusSessionRepository extends JpaRepository<FocusSession, Long> {

    List<FocusSession> findByStatus(String status);

    @Query("SELECT fs FROM FocusSession fs WHERE fs.userId = :userId")
    List<FocusSession> findSessionsByUserId(Long userId);
}