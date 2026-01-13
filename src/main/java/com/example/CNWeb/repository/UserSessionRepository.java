package com.example.CNWeb.repository;

import com.example.CNWeb.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    @Modifying
    @Transactional
    @Query("DELETE FROM UserSession s WHERE s.user.id = :userId")
    void deleteByUserId(Integer userId);

    Optional<UserSession> findByRefreshToken(String refreshToken);
}