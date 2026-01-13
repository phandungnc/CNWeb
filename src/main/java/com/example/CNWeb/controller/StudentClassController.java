package com.example.CNWeb.controller;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.service.StudentClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/classes")
@RequiredArgsConstructor
public class StudentClassController {

    private final StudentClassService studentClassService;

    // lấy thông tin lớp học của hs trong khóa này
    // GET /api/student/classes/details?courseId=10
    @GetMapping("/details")
    public ResponseEntity<StudentDTO.ClassDetailResponse> getClassDetail(@RequestParam Integer courseId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userCode = auth.getName();

        return ResponseEntity.ok(studentClassService.getClassDetail(courseId, userCode));
    }
}