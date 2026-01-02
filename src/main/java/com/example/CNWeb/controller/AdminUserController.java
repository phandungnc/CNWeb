package com.example.CNWeb.controller;

import com.example.CNWeb.dto.Admin.AdminDTO;
import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService userService;

    // gv GET /users?role=TEACHER
    // hs GET /users?role=STUDENT
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getUsers(keyword, role));
    }

    // sửa
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody AdminDTO.UpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    //xóa
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa người dùng thành công");
    }


    // cấp tk gv hoặc hs
    @PostMapping("/accounts")
    public ResponseEntity<?> createAccount(@RequestBody AdminDTO.CreateUserRequest req) {
        return ResponseEntity.ok(userService.createUser(req));
    }

    // cấp lại mk
    @PutMapping("/accounts/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody AdminDTO.ResetPasswordRequest req) {
        userService.resetPassword(req);
        return ResponseEntity.ok("Đã cấp lại mật khẩu thành công");
    }
}