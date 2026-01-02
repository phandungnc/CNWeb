package com.example.CNWeb.exception;

import com.example.CNWeb.dto.Response.RestResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //xử lý lỗi Validation
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RestResponse<?> handleValidationExceptions(MethodArgumentNotValidException e) {
        String errorMessage = "Lỗi dữ liệu đầu vào";
        if (e.getBindingResult().getFieldError() != null) {
            errorMessage = e.getBindingResult().getFieldError().getDefaultMessage();
        }
        return new RestResponse<>(false, errorMessage, null);
    }

    // lỗi login sai
    @ExceptionHandler({BadCredentialsException.class, InternalAuthenticationServiceException.class})
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public RestResponse<?> handleBadCredentials(Exception e) {
        //yêu cầu "tài khoản hoặc mật khẩu không đúng"
        return new RestResponse<>(false, "Tài khoản hoặc mật khẩu không đúng", null);
    }

    // xử lý các lỗi RuntimeException do mình tự throw
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public RestResponse<?> handleRuntimeException(RuntimeException e) {
        return new RestResponse<>(false, e.getMessage(), null);
    }

    // lỗi hệ thống
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public RestResponse<?> handleException(Exception e) {
        e.printStackTrace(); // in log lỗi ra console để debug
        return new RestResponse<>(false, "Lỗi hệ thống: " + e.getMessage(), null);
    }
}