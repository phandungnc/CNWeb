package com.example.CNWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TeacherDTO {
    //                             ĐỀ THI
    // tạo, sửa đề thi
    @Data
    public static class ExamRequest {
        private Integer courseId;
        private String title;
        private Integer durationMinutes; // tg làm bài
        private String startTime;      // yyyy-MM-dd HH:mm:ss
        private String endTime;        // yyyy-MM-dd HH:mm:ss
        private Integer maxAttempts;   // số lần làm
    }

    // ds đề thi
    @Data
    public static class ExamResponse {
        private UUID id;
        private String title;
        private Integer durationMinutes;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer maxAttempts;
        private String status; //trạng thái theo thời gian

        //map
        public ExamResponse(UUID id, String title, Integer durationMinutes,
                            LocalDateTime startTime, LocalDateTime endTime,
                            Integer maxAttempts) {
            this.id = id;
            this.title = title;
            this.durationMinutes = durationMinutes;
            this.startTime = startTime;
            this.endTime = endTime;
            this.maxAttempts = maxAttempts;
            this.status = calculateStatus(startTime, endTime);
        }
        //hàm lấy trạng thái
        private String calculateStatus(LocalDateTime start, LocalDateTime end) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(start)) return "UPCOMING";
            if (now.isAfter(end)) return "ENDED";
            return "HAPPENING";
        }
    }

    //                               LỚP
    //thêm hs vào lớp
    @Data
    public static class AddStudentRequest {
        private Integer classId;
        private List<String> userCodes; // Danh sách mã SV cần thêm
    }

    //                                NGÂN HÀNG CÂU HOIR

    //yc tạo mới or chỉnh sửa
    @Data
    public static class QuestionRequest {
        private Integer courseId;       // Chỉ cần khi tạo mới
        private String content;         // Nội dung câu hỏi
        private String questionType;    // "SINGLE" hoặc "MULTIPLE"
        private List<OptionRequest> options; // Danh sách đáp án
    }
    @Data
    public static class OptionRequest {//theo kèm câu hỏi
        private Integer id;
        private String optionText;
        private Boolean isCorrect;
    }

    //danh sách câu hỏi trong bank
    @Data
    public static class QuestionListResponse {
        private Integer id;
        private String content;
        private String questionType;
        private String createdBy;   // Tên giáo viên
        private LocalDateTime createdAt;
        public QuestionListResponse(Integer id, String content, String questionType, String createdBy, LocalDateTime createdAt) {
            this.id = id;
            this.content = content;
            this.questionType = questionType;
            this.createdBy = createdBy;
            this.createdAt = createdAt;
        }
    }

    //xem câu hỏi
    @Data
    public static class QuestionDetailResponse {
        private Integer id;
        private String content;
        private String questionType;
        private List<OptionResponse> options;
        public QuestionDetailResponse(Integer id, String content, String questionType, List<OptionResponse> options) {
            this.id = id;
            this.content = content;
            this.questionType = questionType;
            this.options = options;
        }
    }

    //form khi sửa
    @Data
    public static class OptionResponse {
        private Integer id;
        private String optionText;
        private Boolean isCorrect;
        public OptionResponse(Integer id, String optionText, Boolean isCorrect) {
            this.id = id;
            this.optionText = optionText;
            this.isCorrect = isCorrect;
        }
    }

    // Request thêm câu hỏi thủ công checkbox
    @Data
    public static class AddExamQuestionRequest {
        private List<Integer> questionIds;
    }

    // Request tạo đề tự động
    @Data
    public static class AutoGenerateExamRequest {
        private Integer numberOfSingleChoice;   // Số câu 1 đáp án
        private Integer numberOfMultipleChoice; // Số câu nhiều đáp án
    }

    @Data
    @AllArgsConstructor
    public static class StudentResultResponse {
        private Integer submissionId;
        private String studentCode;
        private String fullName;
        private String classCode;
        private String startTime;
        private String submitTime;
        private Integer correctCount;
        private Integer totalQuestions;
        private Double score;
        private Integer invalidAction;
    }
}