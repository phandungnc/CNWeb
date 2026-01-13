package com.example.CNWeb.dto.Response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestResponse<T> {
    private boolean success;
    private String message;
    private T data;
}