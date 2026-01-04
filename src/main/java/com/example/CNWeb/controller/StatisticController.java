package com.example.CNWeb.controller;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StatisticController {

    private final StatisticService statisticService;

    // hs xem kết quả bài thi
    @GetMapping("/student/exams/{examId}/history")
    public ResponseEntity<List<StudentDTO.ExamHistoryResponse>> getMyExamHistory(@PathVariable UUID examId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(statisticService.getMyExamHistory(auth.getName(), examId));
    }


    // gv xem kết quả của đề thi
    @GetMapping("/teacher/exams/{examId}/results")
    public ResponseEntity<List<TeacherDTO.StudentResultResponse>> getExamResults(@PathVariable UUID examId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // Truyền thêm teacherCode để lọc lớp
        return ResponseEntity.ok(statisticService.getExamResults(examId, auth.getName()));
    }
}