package com.example.CNWeb.controller;

import com.example.CNWeb.dto.Request.UpdateProfileRequest;
import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    //Lấy thông tin người đang đăng nhập
    // GET http://localhost:8080/api/users/profile
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.getMyProfile(auth.getName()));
    }

    //Cập nhật thông tin cá nhân
    // PUT http://localhost:8080/api/users/profile
    @PutMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody UpdateProfileRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(userService.updateMyProfile(auth.getName(), req));
    }
}