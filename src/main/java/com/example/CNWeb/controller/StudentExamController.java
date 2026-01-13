package com.example.CNWeb.controller;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.service.StudentExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/student/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final StudentExamService studentExamService;

    // lấy danh sách đề thi theo Course ID
    // GET /api/student/exams?courseId=10
    @GetMapping
    public ResponseEntity<List<StudentDTO.ExamResponse>> getExamsByCourse(@RequestParam Integer courseId) {
        return ResponseEntity.ok(studentExamService.getExamsByCourse(courseId));
    }

    // Bắt đầu làm bài
    // POST /api/student/exams/{examId}/start
    @PostMapping("/{examId}/start")
    public ResponseEntity<?> startExam(@PathVariable UUID examId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(studentExamService.startExam(examId, auth.getName()));
    }

    // Lấy nội dung đề thi
    // GET /api/student/exams/{examId}/content
    @GetMapping("/{examId}/content")
    public ResponseEntity<?> getExamContent(@PathVariable UUID examId) {
        return ResponseEntity.ok(studentExamService.getExamContent(examId));
    }

    // gửi đáp án từng câu
    // POST /api/student/exams/submit-answer
    @PostMapping("/submit-answer")
    public ResponseEntity<?> submitAnswer(@RequestBody StudentDTO.SubmitAnswerRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        studentExamService.submitAnswer(req, auth.getName());
        return ResponseEntity.ok("Đã lưu đáp án");
    }

    // nộp bài hoặc hết giờ
    // POST /api/student/exams/{submissionId}/finish
    @PostMapping("/{submissionId}/finish")
    public ResponseEntity<?> finishExam(@PathVariable Integer submissionId) {
        studentExamService.finishExam(submissionId);
        return ResponseEntity.ok("Nộp bài thành công");
    }

    //đếm vi phạm
    @PostMapping("/{submissionId}/report-violation")
    public ResponseEntity<?> reportViolation(@PathVariable Integer submissionId) {
        studentExamService.reportInvalidAction(submissionId);
        return ResponseEntity.ok("Đã ghi nhận cảnh báo");
    }
}