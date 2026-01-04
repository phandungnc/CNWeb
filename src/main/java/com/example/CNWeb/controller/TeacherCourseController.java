package com.example.CNWeb.controller;

import com.example.CNWeb.entity.Course;
import com.example.CNWeb.service.TeacherCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherCourseController {

    private final TeacherCourseService teacherCourseService;

    // GET /api/teacher/courses
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses() {

        //Lấy UserCode từ Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserCode = auth.getName();

        //Lấy toàn bộ danh sách khóa học
        List<Course> courses = teacherCourseService.getMyCourses(currentUserCode);

        return ResponseEntity.ok(courses);
    }
}