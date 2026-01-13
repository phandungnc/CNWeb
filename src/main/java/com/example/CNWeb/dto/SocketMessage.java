package com.example.CNWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocketMessage {
    private String type;    // "COUNTDOWN", "FORCE_SUBMIT", "WARNING"
    private String content; // Nội dung
}