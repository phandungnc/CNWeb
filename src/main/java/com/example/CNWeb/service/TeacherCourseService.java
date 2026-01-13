package com.example.CNWeb.service;

import com.example.CNWeb.entity.Course;
import com.example.CNWeb.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherCourseService {

    private final CourseRepository courseRepo;

    //lấy ds theo mã số gv
    public List<Course> getMyCourses(String userCode) {
        return courseRepo.findCoursesByTeacher(userCode);
    }
}
