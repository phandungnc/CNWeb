package com.example.CNWeb.service;

import com.example.CNWeb.entity.Course;
import com.example.CNWeb.repository.CourseRepository;
import com.example.CNWeb.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentCourseService {
    private final CourseRepository courseRepo;
    // lấy danh sách khóa học của học sinh đang đăng nhập
    public List<Course> getMyCourses(String userCode, String keyword) {
        return courseRepo.findCoursesByStudent(userCode, keyword);
    }
}