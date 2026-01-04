package com.example.CNWeb.controller;

import com.example.CNWeb.entity.Course;
import com.example.CNWeb.service.StudentCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentCourseController {

    private final StudentCourseService studentCourseService;

    // lấy danh sách khóa học của hs
    // GET /api/student/courses?keyword=Lap trinh
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses(
            @RequestParam(required = false) String keyword) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(studentCourseService.getMyCourses(auth.getName(), keyword));
    }
}