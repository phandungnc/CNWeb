package com.example.CNWeb.service;

import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.entity.ClassEntity;
import com.example.CNWeb.repository.ClassMemberRepository;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentClassService {

    private final ClassMemberRepository classMemberRepo;
    private final UserRepository userRepo;

    public StudentDTO.ClassDetailResponse getClassDetail(Integer courseId, String userCode) {
        ClassEntity clazz = classMemberRepo.findClassByStudentAndCourse(userCode, courseId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa được xếp vào lớp nào trong khóa học này!"));

        // Lấy danh sách Giáo viên của lớp
        List<UserResponseDTO> teachers = userRepo.findMembersByClassId(clazz.getId(), "TEACHER", null);
        // Lấy danh sách Học sinh của lớp
        List<UserResponseDTO> students = userRepo.findMembersByClassId(clazz.getId(), "STUDENT", null);
        return new StudentDTO.ClassDetailResponse(
                clazz.getId(),
                clazz.getClassCode(),
                clazz.getCourse().getName(),
                teachers,
                students
        );
    }
}