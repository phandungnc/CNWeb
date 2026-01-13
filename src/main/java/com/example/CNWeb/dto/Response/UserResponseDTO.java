package com.example.CNWeb.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {
    private Integer id;
    private String userCode;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String roleName; // Chỉ cần tên Role
}