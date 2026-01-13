package com.example.CNWeb.dto.Request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
}