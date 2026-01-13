package com.example.CNWeb.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Mã số không được để trống")
    @Size(min = 8, message = "Mã số phải có tối thiểu 8 ký tự")
    private String userCode;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có tối thiểu 8 ký tự")
    private String password;
}
