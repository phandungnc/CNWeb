package com.example.CNWeb.controller;

import com.example.CNWeb.dto.Admin.AdminDTO;
import com.example.CNWeb.service.AdminCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCourseController {

    private final AdminCourseService courseService;


    //lấy ds có tìm kiếm
    @GetMapping("/courses")
    public ResponseEntity<?> getCourses(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(courseService.searchCourses(keyword));
    }

    // tạo khóa mới
    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody AdminDTO.CourseRequest req) {
        return ResponseEntity.ok(courseService.createCourse(req));
    }

    //xem chi tiết 1khóa học
    @GetMapping("/courses/{id}")
    public ResponseEntity<?> getCourseDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(courseService.getCourseDetail(id));
    }

    //sửa khóa học
    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Integer id, @RequestBody AdminDTO.CourseRequest req) {
        return ResponseEntity.ok(courseService.updateCourse(id, req));
    }

    // xóa course
    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("Đã xóa khóa học thành công");
    }


    // thêm lp trong course
    @PostMapping("/classes")
    public ResponseEntity<?> createClass(@RequestBody AdminDTO.ClassRequest req) {
        return ResponseEntity.ok(courseService.createClass(req));
    }

    // xóa lớp
    @DeleteMapping("/classes/{id}")
    public ResponseEntity<?> deleteClass(@PathVariable Integer id) {
        courseService.deleteClass(id);
        return ResponseEntity.ok("Đã xóa lớp học");
    }

    // sửa mã lp
    @PutMapping("/classes/{id}")
    public ResponseEntity<?> updateClass(@PathVariable Integer id, @RequestBody AdminDTO.UpdateClassRequest req) {
        return ResponseEntity.ok(courseService.updateClass(id, req));
    }


    //xem chi tiết lớp có tìm kiếm tv
    @GetMapping("/classes/{id}/details")
    public ResponseEntity<?> getClassDetails(
            @PathVariable Integer id,
            @RequestParam(required = false) String keyword) { //tìm kiế

        return ResponseEntity.ok(courseService.getClassDetail(id, keyword));
    }

    // lấy danh sách user chưa vào lớp
    @GetMapping("/classes/{id}/available-users")
    public ResponseEntity<?> getAvailableUsers(
            @PathVariable Integer id,
            @RequestParam String role,
            @RequestParam(required = false) String keyword) {

        return ResponseEntity.ok(courseService.getAvailableUsersForClass(id, role, keyword));
    }

    // thêm thành viên vào lớp
    @PostMapping("/classes/members")
    public ResponseEntity<?> addMembers(@RequestBody AdminDTO.AddMemberRequest req) {
        courseService.addMembers(req);
        return ResponseEntity.ok("Thêm thành viên thành công");
    }

    // xóa tv
    @DeleteMapping("/classes/{classId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Integer classId, @PathVariable Integer userId) {
        courseService.removeMember(classId, userId);
        return ResponseEntity.ok("Đã xóa thành viên khỏi lớp");
    }
}