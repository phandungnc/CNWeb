package com.example.CNWeb.controller;

import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.service.TeacherExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher/exams")
@RequiredArgsConstructor
public class TeacherExamController {

    private final TeacherExamService examService;

    // ds đề thi
    // GET /api/teacher/exams?courseId=1
    @GetMapping
    public ResponseEntity<?> getExamsByCourse(@RequestParam Integer courseId) {
        return ResponseEntity.ok(examService.getExamsByCourse(courseId));
    }

    @PostMapping
    public ResponseEntity<?> createExam(@RequestBody TeacherDTO.ExamRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userCode = auth.getName();
        return ResponseEntity.ok(examService.createExam(req, userCode));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExam(@PathVariable UUID id, @RequestBody TeacherDTO.ExamRequest req) {
        return ResponseEntity.ok(examService.updateExam(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExam(@PathVariable UUID id) {
        examService.deleteExam(id);
        return ResponseEntity.ok("Đã xóa đề thi thành công");
    }
    // xem danh sách câu hỏi trong đề
    // GET /api/teacher/exams/{id}/questions
    @GetMapping("/{id}/questions")
    public ResponseEntity<?> getQuestionsInExam(@PathVariable UUID id) {
        return ResponseEntity.ok(examService.getQuestionsInExam(id));
    }

    // Tìm câu hỏi để thêm
    // GET /api/teacher/exams/{id}/available-questions?keyword=abc
    @GetMapping("/{id}/available-questions")
    public ResponseEntity<?> getAvailableQuestions(@PathVariable UUID id,
                                                   @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(examService.getAvailableQuestions(id, keyword));
    }
    // thêm câu hỏi thủ công checkbox
    // POST /api/teacher/exams/{id}/questions
    @PostMapping("/{id}/questions")
    public ResponseEntity<?> addQuestionsManual(@PathVariable UUID id,
                                                @RequestBody TeacherDTO.AddExamQuestionRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        examService.addQuestionsToExam(id, req.getQuestionIds(), auth.getName());
        return ResponseEntity.ok("Đã thêm câu hỏi vào đề thi");
    }
    // Xóa câu hỏi khỏi đề
    // DELETE /api/teacher/exams/{id}/questions/{questionId}
    @DeleteMapping("/{id}/questions/{questionId}")
    public ResponseEntity<?> removeQuestion(@PathVariable UUID id, @PathVariable Integer questionId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        examService.removeQuestionFromExam(id, questionId, auth.getName());
        return ResponseEntity.ok("Đã xóa câu hỏi khỏi đề thi");
    }

    // Tạo đề tự động
    // POST /api/teacher/exams/{id}/auto-generate
    @PostMapping("/{id}/auto-generate")
    public ResponseEntity<?> autoGenerateQuestions(@PathVariable UUID id,
                                                   @RequestBody TeacherDTO.AutoGenerateExamRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        examService.autoGenerateExamQuestions(id, req, auth.getName());
        return ResponseEntity.ok("Đã tạo câu hỏi ngẫu nhiên thành công");
    }
}