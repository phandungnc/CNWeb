package com.example.CNWeb.service;

import com.example.CNWeb.dto.Response.UserResponseDTO;
import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.entity.ClassEntity;
import com.example.CNWeb.entity.ClassMember;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.repository.ClassMemberRepository;
import com.example.CNWeb.repository.ClassRepository;
import com.example.CNWeb.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherClassService {

    private final ClassRepository classRepo;
    private final UserRepository userRepo;
    private final ClassMemberRepository classMemberRepo;

    //ds lớp của gv dạy
    public List<ClassEntity> getMyClassesInCourse(Integer courseId, String userCode) {
        return classMemberRepo.findClassesByUserCodeAndCourseId(userCode, courseId);
    }

    //lấy ds học sinh của lớp
    public List<UserResponseDTO> getStudentsInClass(Integer classId) {
        return userRepo.findMembersByClassId(classId, "STUDENT", null);
    }

    // ds hs thỏa mãn điều kiện để thêm vào lớp
    public List<UserResponseDTO> getAvailableStudentsForClass(Integer classId, String keyword) {
        ClassEntity clazz = classRepo.findById(classId)
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));
        return userRepo.findStudentsAvailableForCourse(clazz.getCourse().getId(), keyword);
    }

    @Transactional
    public void addStudentsToClass(TeacherDTO.AddStudentRequest req, String teacherCode) {
        ClassEntity clazz = classRepo.findById(req.getClassId())
                .orElseThrow(() -> new RuntimeException("Lớp học không tồn tại"));

        User teacher = userRepo.findByUserCode(teacherCode)
                .orElseThrow(() -> new RuntimeException("Giáo viên không tồn tại"));

        boolean isTeacherInClass = classMemberRepo.existsByClassEntityIdAndUserId(clazz.getId(), teacher.getId());
        if (!isTeacherInClass) {
            throw new RuntimeException("Bạn không có quyền thêm học sinh vào lớp này!");
        }

        Integer courseId = clazz.getCourse().getId();

        for (String studentCode : req.getUserCodes()) {
            User student = userRepo.findByUserCode(studentCode)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy học sinh: " + studentCode));

            if (classMemberRepo.existsByUserIdAndCourseId(student.getId(), courseId)) {
                throw new RuntimeException("Học sinh " + studentCode + " đã tham gia khóa học này ở lớp khác!");
            }
            ClassMember member = new ClassMember(clazz, student);
            classMemberRepo.save(member);
        }
    }

    //xóa hs khỏi lp đó
    @Transactional
    public void removeStudentFromClass(Integer classId, Integer studentId, String teacherCode) {
        User teacher = userRepo.findByUserCode(teacherCode)
                .orElseThrow(() -> new RuntimeException("Giáo viên không tồn tại"));

        if (!classMemberRepo.existsByClassEntityIdAndUserId(classId, teacher.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa học sinh khỏi lớp này!");
        }
        classMemberRepo.deleteByClassEntityIdAndUserId(classId, studentId);
    }
}