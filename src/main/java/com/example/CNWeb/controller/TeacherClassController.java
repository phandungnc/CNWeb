package com.example.CNWeb.controller;

import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.entity.ClassEntity;
import com.example.CNWeb.service.TeacherClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/classes")
@RequiredArgsConstructor
public class TeacherClassController {

    private final TeacherClassService classService;

    //ds lớp trong khóa học
    @GetMapping
    public ResponseEntity<List<ClassEntity>> getClassesByCourse(@RequestParam Integer courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(classService.getMyClassesInCourse(courseId, auth.getName()));
    }

    //ds học sinh của 1 lớp
    // GET /api/teacher/classes/5/students
    @GetMapping("/{classId}/students")
    public ResponseEntity<List<UserResponseDTO>> getStudentsInClass(@PathVariable Integer classId) {
        return ResponseEntity.ok(classService.getStudentsInClass(classId));
    }

    // tìm hs để thêm
    // GET /api/teacher/classes/5/available-students?keyword=Nguyen Van A
    @GetMapping("/{classId}/available-students")
    public ResponseEntity<List<UserResponseDTO>> getAvailableStudents(
            @PathVariable Integer classId,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(classService.getAvailableStudentsForClass(classId, keyword));
    }

    // POST /api/teacher/classes/students
    @PostMapping("/students")
    public ResponseEntity<?> addStudents(@RequestBody TeacherDTO.AddStudentRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        classService.addStudentsToClass(req, auth.getName());
        return ResponseEntity.ok("Thêm học sinh thành công");
    }

    // DELETE /api/teacher/classes/5/students/101
    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable Integer classId, @PathVariable Integer studentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        classService.removeStudentFromClass(classId, studentId, auth.getName());
        return ResponseEntity.ok("Đã xóa học sinh khỏi lớp");
    }
}