package com.example.CNWeb.service;

import com.example.CNWeb.dto.Request.UpdateProfileRequest;
import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;

    //Lấy thông tin cá nhân
    public UserResponseDTO getMyProfile(String userCode) {
        User user = userRepo.findByUserCode(userCode)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        return new UserResponseDTO(
                user.getId(),
                user.getUserCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().getName()
        );
    }

    // Cập nhật thông tin cá nhân
    @Transactional
    public UserResponseDTO updateMyProfile(String userCode, UpdateProfileRequest req) {
        User user = userRepo.findByUserCode(userCode)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Chỉ cập nhật nếu có dữ liệu gửi lên
        if (req.getFullName() != null && !req.getFullName().trim().isEmpty()) {
            user.setFullName(req.getFullName());
        }
        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
            user.setEmail(req.getEmail());
        }
        if (req.getPhoneNumber() != null && !req.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(req.getPhoneNumber());
        }
        User updatedUser = userRepo.save(user);

        return new UserResponseDTO(
                updatedUser.getId(),
                updatedUser.getUserCode(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getPhoneNumber(),
                updatedUser.getRole().getName()
        );
    }
}