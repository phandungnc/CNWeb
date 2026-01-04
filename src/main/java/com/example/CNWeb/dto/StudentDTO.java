package com.example.CNWeb.dto;

import com.example.CNWeb.dto.Response.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class StudentDTO {
    // Response chi tiết Lớp học dành cho học sinh
    @Data
    public static class ClassDetailResponse {
        private Integer classId;
        private String classCode;
        private String courseName;      // Tên môn học
        private List<UserResponseDTO> teachers; // Danh sách giáo viên
        private List<UserResponseDTO> students; // Danh sách hs

        public ClassDetailResponse(Integer classId, String classCode, String courseName,
                                   List<UserResponseDTO> teachers, List<UserResponseDTO> students) {
            this.classId = classId;
            this.classCode = classCode;
            this.courseName = courseName;
            this.teachers = teachers;
            this.students = students;
        }
    }


    // Response cho danh sách đề thi
    @Data
    public static class ExamResponse {
        // Thông tin hiển thị bên ngoài (Header)
        private UUID id;
        private String title;           // Tên đề
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;          // UPCOMING, HAPPENING, ENDED

        // Thông tin hiển thị bên trong
        private Integer durationMinutes; // Thời gian làm bài
        private Integer maxAttempts;     // Số lần làm tối đa
        private String createdBy;        // Người tạo
        private Long totalQuestions;     // Tổng số câu hỏi

        public ExamResponse(UUID id, String title, LocalDateTime startTime, LocalDateTime endTime,
                            Integer durationMinutes, Integer maxAttempts, String createdBy, Long totalQuestions) {
            this.id = id;
            this.title = title;
            this.startTime = startTime;
            this.endTime = endTime;
            this.durationMinutes = durationMinutes;
            this.maxAttempts = maxAttempts;
            this.createdBy = createdBy;
            this.totalQuestions = totalQuestions;
            this.status = calculateStatus(startTime, endTime);
        }

        private String calculateStatus(LocalDateTime start, LocalDateTime end) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(start)) return "UPCOMING"; // Sắp diễn ra
            if (now.isAfter(end)) return "ENDED";       // Đã kết thúc
            return "HAPPENING";                         // Đang diễn ra
        }
    }

    // bắt đầu lam bài
    @Data
    @AllArgsConstructor
    public static class StartExamResponse {
        private Integer submissionId;    // ID lượt làm bài
        private Integer durationMinutes; // Thời gian làm bài
        private String endTime;          // Thời gian phải nộp bài
    }
    // câu hỏi dề thi
    @Data
    @AllArgsConstructor
    public static class ExamContentResponse {
        private Integer questionId;
        private String content;
        private String questionType;     // SINGLE, MULTIPLE
        private List<OptionView> options; // Danh sách đáp án (Đã ẩn isCorrect)
    }
    //các lựa chọn của câu hỏi trg đề
    @Data
    @AllArgsConstructor
    public static class OptionView {
        private Integer id;
        private String optionText;
    }

    // gửi đáp án
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAnswerRequest {
        private Integer submissionId;
        private Integer questionId;

        // Danh sách ID các đáp án được chọn
        private List<Integer> selectedOptionIds;
    }

    @Data
    @AllArgsConstructor
    public static class ExamHistoryResponse {
        private Integer submissionId;
        private String examTitle;
        private String startTime;
        private String submitTime;
        private Integer correctCount;
        private Integer totalQuestions;
        private Double score;
        private Integer invalidAction;
    }
}