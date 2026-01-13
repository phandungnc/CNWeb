package com.example.CNWeb.service;

import com.example.CNWeb.dto.Response.SocketMessage;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.entity.UserSession;
import com.example.CNWeb.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository repo;
    private final SimpMessagingTemplate messagingTemplate;  // gui tn websocket

    @Value("${jwt.refreshExpiration}")
    private long refreshExpiration;

    @Transactional
    public UserSession createSession(User user) {
            SocketMessage msg = new SocketMessage("FORCE_LOGOUT", "Tài khoản đang được đăng nhập ở nơi khác! Nhấn OK để đăng xuất.");
            messagingTemplate.convertAndSendToUser(
                    user.getUserCode(),
                    "/queue/notifications",
                    msg
            );

        // xóa cái cũ trước khi thêm mới 1user lưu 1 session
        repo.deleteByUserId(user.getId());
        repo.flush(); // Force delete ngay lập tức

//      debug
//        System.out.println("Đang gửi thông báo cho user: " + user.getUserCode());
//
//        messagingTemplate.convertAndSendToUser(
//                user.getUserCode(),
//                "/queue/notifications",
//                msg
//        );
//        System.out.println("Đã gửi lệnh xuống Socket");


        // tạo mới
        UserSession session = new UserSession();
        session.setUser(user);
        session.setRefreshToken(UUID.randomUUID().toString());
        session.setExpiryDate(LocalDateTime.now().plusSeconds(refreshExpiration / 1000));
        session.setCreatedAt(LocalDateTime.now());

        return repo.save(session);
    }

    public void validateSession(UUID sessionId) {
        UserSession session = repo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên đăng nhập không hợp lệ hoặc bị đăng xuất"));

        if (session.getExpiryDate().isBefore(LocalDateTime.now())) {
            repo.deleteById(sessionId);
            throw new RuntimeException("Phiên đăng nhập đã hết hạn");
        }
    }
    //xac thực token
    @Transactional
    public UserSession validateRefreshToken(String refreshToken) {
        UserSession session = repo.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));

        if (session.getExpiryDate().isBefore(LocalDateTime.now())) {
            repo.deleteById(session.getId());
            throw new RuntimeException("Refresh token đã hết hạn");
        }

        return session;
    }
    //logout thì xóa phiên
    @Transactional
    public void logout(UUID sessionId) {
        if (sessionId != null) {
            repo.deleteById(sessionId);
        }
    }

    @Transactional
    public void logoutAll(Integer userId) {
        repo.deleteByUserId(userId);
    }
}