package com.example.CNWeb.controller;

import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.service.TeacherQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/questions")
@RequiredArgsConstructor
public class TeacherQuestionController {

    private final TeacherQuestionService questionService;

    // Lấy danh sách câu hỏi theo Course ID
    // GET /api/teacher/questions/course/10
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getQuestionsByCourse(@PathVariable Integer courseId) {
        return ResponseEntity.ok(questionService.getQuestionsByCourse(courseId));
    }

    //Xem chi tiết 1 câu hỏi( form xem sửa)
    // GET /api/teacher/questions/5
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(questionService.getQuestionDetail(id));
    }
    //tạo câu hỏi mới
    // POST /api/teacher/questions
    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody TeacherDTO.QuestionRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        questionService.createQuestion(req, auth.getName());
        return ResponseEntity.ok("Tạo câu hỏi thành công");
    }
    //sửa câu hỏi
    // PUT /api/teacher/questions/5
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Integer id, @RequestBody TeacherDTO.QuestionRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        questionService.updateQuestion(id, req, auth.getName());
        return ResponseEntity.ok("Cập nhật câu hỏi thành công");
    }

    // DELETE /api/teacher/questions/5
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Integer id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        questionService.deleteQuestion(id, auth.getName());
        return ResponseEntity.ok("Đã xóa câu hỏi");
    }
}