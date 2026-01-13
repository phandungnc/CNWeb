package com.example.CNWeb.dto;

import lombok.Data;
import java.util.List;

public class AdminDTO {

    // thêm ng dùng
    @Data
    public static class CreateUserRequest {
        private String userCode;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String password;
        private String roleName; // 2 role gv/hs
    }

    // cấp mk
    @Data
    public static class ResetPasswordRequest {
        private String userCode;
        private String newPassword;
    }

    @Data
    public static class UpdateUserRequest { // Form sửa thông tin
        private String fullName;
        private String email;
        private String phoneNumber;
    }

    // sửa khóa học
    @Data
    public static class CourseRequest {
        private String name;
        private String note;
        private String startTime; //yyyy-MM-dd HH:mm:ss
        private String endTime;
    }

    // thêm sửa lớp
    @Data
    public static class ClassRequest {
        private String classCode;
        private Integer courseId;
    }

    // thêm thành viên vào lớp
    @Data
    public static class AddMemberRequest {
        private Integer classId;
        private List<String> userCodes; // ds mã SV/GV cần thêm
    }

    @Data
    public static class UpdateClassRequest {
        private String classCode; // mã lớp
    }
}
