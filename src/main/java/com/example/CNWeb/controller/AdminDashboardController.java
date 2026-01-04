package com.example.CNWeb.controller;

import com.example.CNWeb.repository.ClassRepository;
import com.example.CNWeb.repository.CourseRepository;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final ClassRepository classRepo;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();

        // Đếm số lượng từ DB
        stats.put("totalTeachers", userRepo.countByRole_Name("TEACHER"));
        stats.put("totalStudents", userRepo.countByRole_Name("STUDENT"));
        stats.put("totalCourses", courseRepo.count());
        stats.put("totalClasses", classRepo.count());

        return ResponseEntity.ok(stats);
    }
}