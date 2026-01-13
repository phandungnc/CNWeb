package com.example.CNWeb.service;

import com.example.CNWeb.dto.AdminDTO;
import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.entity.Role;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.repository.RoleRepository;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    // yeu cau ve mk
    private static final String PASSWORD_PATTERN =
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.*?])(?=\\S+$).{8,}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    // check pass
    private void validatePassword(String password) {
        if (password == null || !pattern.matcher(password).matches()) {
            throw new RuntimeException("Mật khẩu phải tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
        }
    }

    // lấy ds user
    public List<UserResponseDTO> getUsers(String keyword, String roleFilter) {
        return userRepo.searchUsersCustom(keyword, roleFilter);
    }

    // cấp tk cho hs gv
    @Transactional
    public User createUser(AdminDTO.CreateUserRequest req) {
        // xac minh ms, email, sdt
        if (userRepo.existsByUserCode(req.getUserCode())) {
            throw new RuntimeException("Mã số '" + req.getUserCode() + "' đã tồn tại!");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email '" + req.getEmail() + "' đã được sử dụng!");
        }
        if (userRepo.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại '" + req.getPhoneNumber() + "' đã được sử dụng!");
        }

        // xác minh mk
        validatePassword(req.getPassword());

        Role role = roleRepo.findByName(req.getRoleName())
                .orElseThrow(() -> new RuntimeException("Role không hợp lệ!"));

        User user = new User();
        user.setUserCode(req.getUserCode());
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword())); //mã hóa mk
        user.setRole(role);

        return userRepo.save(user);
    }

    // update tt ng dùng
    @Transactional
    public User updateUser(Integer id, AdminDTO.UpdateUserRequest req) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Check trùng lặp khi sửa đổi
        if (!user.getEmail().equals(req.getEmail()) && userRepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email mới đã được sử dụng!");
        }
        if (!user.getPhoneNumber().equals(req.getPhoneNumber()) && userRepo.existsByPhoneNumber(req.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại mới đã được sử dụng!");
        }

        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPhoneNumber(req.getPhoneNumber());

        return userRepo.save(user);
    }

    // cấp lại mk
    @Transactional
    public void resetPassword(AdminDTO.ResetPasswordRequest req) {
        User user = userRepo.findByUserCode(req.getUserCode())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với mã số: " + req.getUserCode()));

        validatePassword(req.getNewPassword());

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
    }

    // xóa ng dùng
    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepo.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        userRepo.deleteById(id);
    }
}