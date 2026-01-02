package com.example.CNWeb.service;

import com.example.CNWeb.dto.Admin.AdminDTO;
import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.entity.*;
import com.example.CNWeb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminCourseService {

    private final CourseRepository courseRepo;
    private final ClassRepository classRepo;
    private final UserRepository userRepo;
    private final ClassMemberRepository classMemberRepo;

    //định dạng ngày tháng
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    //tìm kiếm khóa học
    public List<Course> searchCourses(String keyword) {
        return courseRepo.searchCourses(keyword);
    }

    // Hàm lấy danh sách User hợp lệ để thêm vào lớp
    public List<UserResponseDTO> getAvailableUsersForClass(Integer classId, String roleName, String keyword) {

        // Lấy thông tin lớp trong course nào
        ClassEntity clazz = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        if ("TEACHER".equalsIgnoreCase(roleName)) {
            // gv chỉ cần chưa vào lớp này
            return userRepo.findTeachersAvailableForClass(classId, keyword);

        } else if ("STUDENT".equalsIgnoreCase(roleName)) {
            // hs chưa trong course này
            Integer courseId = clazz.getCourse().getId();
            return userRepo.findStudentsAvailableForCourse(courseId, keyword);

        } else {
            throw new RuntimeException("Role không hợp lệ (Phải là TEACHER hoặc STUDENT)");
        }
    }

    // thêm khóa học
    public Course createCourse(AdminDTO.CourseRequest req) {
        Course course = new Course();
        course.setName(req.getName());
        course.setNote(req.getNote());

        //ddngày tháng
        if (req.getStartTime() != null)
            course.setStartTime(LocalDateTime.parse(req.getStartTime(), formatter));
        if (req.getEndTime() != null)
            course.setEndTime(LocalDateTime.parse(req.getEndTime(), formatter));

        return courseRepo.save(course);
    }

    // Lấy chi tiết Khóa học kèm ds Lớp học bên trong
    public Map<String, Object> getCourseDetail(Integer courseId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        List<ClassEntity> classes = classRepo.findByCourseId(courseId);

        Map<String, Object> response = new HashMap<>();
        response.put("info", course);    // Thông tin chung
        response.put("classes", classes); // Danh sách các lớp
        return response;
    }

    // Sửa khóa học
    public Course updateCourse(Integer id, AdminDTO.CourseRequest req) {
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        course.setName(req.getName());
        course.setNote(req.getNote());
        if (req.getStartTime() != null && !req.getStartTime().isEmpty())
            course.setStartTime(LocalDateTime.parse(req.getStartTime(), formatter));

        if (req.getEndTime() != null && !req.getEndTime().isEmpty())
            course.setEndTime(LocalDateTime.parse(req.getEndTime(), formatter));

        return courseRepo.save(course);
    }

    // xóa khóa học
    public void deleteCourse(Integer id) {
        if (!courseRepo.existsById(id)) {
            throw new RuntimeException("Khóa học không tồn tại");
        }
        courseRepo.deleteById(id);
    }

    // Tạo lớp học mới trong khóa
    public ClassEntity createClass(AdminDTO.ClassRequest req) {
        if (classRepo.existsByClassCode(req.getClassCode())) {
            throw new RuntimeException("Mã lớp này đã tồn tại!");
        }
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        ClassEntity clazz = new ClassEntity();
        clazz.setClassCode(req.getClassCode());
        clazz.setCourse(course);

        return classRepo.save(clazz);
    }

    //sửa code lớp
    public ClassEntity updateClass(Integer id, AdminDTO.UpdateClassRequest req) {
        ClassEntity clazz = classRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        // check trùng
        if (!clazz.getClassCode().equals(req.getClassCode())
                && classRepo.existsByClassCode(req.getClassCode())) {
            throw new RuntimeException("Mã lớp '" + req.getClassCode() + "' đã tồn tại!");
        }

        clazz.setClassCode(req.getClassCode());
        return classRepo.save(clazz);
    }

    //Xóa lớp học
    public void deleteClass(Integer classId) {
        if (!classRepo.existsById(classId)) {
            throw new RuntimeException("Lớp học không tồn tại");
        }
        classRepo.deleteById(classId);
    }
    // lấy tt lớp và thành viên gv hs
    public Map<String, Object> getClassDetail(Integer classId, String keyword) {
        // lớp
        ClassEntity clazz = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        //tìm gv
        List<UserResponseDTO> teachers = userRepo.findMembersByClassId(classId, "TEACHER", keyword);
        //timg hs
        List<UserResponseDTO> students = userRepo.findMembersByClassId(classId, "STUDENT", keyword);
        Map<String, Object> response = new HashMap<>();
        response.put("info", clazz);
        response.put("teachers", teachers);
        response.put("students", students);

        return response;
    }

    //thêm tv
    @Transactional
    public void addMembers(AdminDTO.AddMemberRequest req) {
        ClassEntity clazz = classRepo.findById(req.getClassId())
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        Integer courseId = clazz.getCourse().getId();

        for (String userCode : req.getUserCodes()) {
            User user = userRepo.findByUserCode(userCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + userCode));

            //hs thì k dc vào khóa này r
            if ("STUDENT".equals(user.getRole().getName())) {
                boolean alreadyJoinedCourse = classMemberRepo.existsByUserIdAndCourseId(user.getId(), courseId);
                if (alreadyJoinedCourse) {
                    throw new RuntimeException("Học sinh " + userCode + " đã tham gia môn học này ở lớp khác rồi!");
                }
            }

            // gv thì cần chưa vào lp
            if (classMemberRepo.existsByClassEntityIdAndUserId(clazz.getId(), user.getId())) {
                continue;
            }
            ClassMember member = new ClassMember(clazz, user);
            classMemberRepo.save(member);
        }
    }

    // Xóa thành viên khỏi lớp
    @Transactional
    public void removeMember(Integer classId, Integer userId) {
        classMemberRepo.deleteByClassEntityIdAndUserId(classId, userId);
    }
}