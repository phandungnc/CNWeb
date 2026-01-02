package com.example.CNWeb.controller;

import com.example.CNWeb.dto.Request.ChangePasswordRequest;
import com.example.CNWeb.dto.Request.LoginRequest;
import com.example.CNWeb.dto.Request.RefreshTokenRequest;
import com.example.CNWeb.dto.Response.LoginResponse;
import com.example.CNWeb.dto.Response.RestResponse;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.entity.UserSession;
import com.example.CNWeb.repository.UserRepository;
import com.example.CNWeb.security.JwtUtil;
import com.example.CNWeb.service.UserSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final UserSessionService sessionService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public RestResponse<LoginResponse> login(@RequestBody @Valid LoginRequest req) {
        // sai code/pass
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUserCode(), req.getPassword())
        );

        User user = userRepo.findByUserCode(req.getUserCode())
                .orElseThrow(() -> new RuntimeException("Tài khoản hoặc mật khẩu không đúng"));
        UserSession session = sessionService.createSession(user);

        String accessToken = jwtUtil.generateToken(
                user.getUserCode(),
                user.getRole().getName(),
                session.getId()
        );

        return new RestResponse<>(true, "Đăng nhập thành công",
                new LoginResponse(accessToken, session.getRefreshToken()));
    }

    @PostMapping("/logout")
    public RestResponse<?> logout() {
        UUID sessionId = jwtUtil.getSessionIdFromContext();
        sessionService.logout(sessionId);
        return new RestResponse<>(true, "Đã đăng xuất", null);
    }

    @PutMapping("/change-password")
    public RestResponse<?> changePassword(@RequestBody @Valid ChangePasswordRequest req) {
        String userCode = jwtUtil.getUserCodeFromContext();
        User user = userRepo.findByUserCode(userCode)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // pass cũ
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }

        // pass mới khác pass cũ
        if (passwordEncoder.matches(req.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
        sessionService.logoutAll(user.getId());

        return new RestResponse<>(true, "Đổi mật khẩu thành công. Vui lòng đăng nhập lại", null);
    }

    @PostMapping("/refresh")
    public RestResponse<LoginResponse> refresh(@RequestBody RefreshTokenRequest req) {
        UserSession currentSession = sessionService.validateRefreshToken(req.getRefreshToken());

        String newAccessToken = jwtUtil.generateToken(
                currentSession.getUser().getUserCode(),
                currentSession.getUser().getRole().getName(),
                currentSession.getId()
        );

        return new RestResponse<>(true, "Token đã được làm mới",
                new LoginResponse(newAccessToken, currentSession.getRefreshToken()));
    }

    //ping để check session
    @GetMapping("/check-session")
    public RestResponse<?> checkSession() {
        // Session còn hợp lệ
        return new RestResponse<>(true, "Session hợp lệ", null);
    }
}