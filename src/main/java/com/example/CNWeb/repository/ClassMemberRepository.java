package com.example.CNWeb.repository;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.entity.ClassEntity;
import com.example.CNWeb.entity.ClassMember;
import com.example.CNWeb.entity.ClassMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, ClassMemberId> {
    //lấy danh sách thành viên của một lớp cụ thể
    List<ClassMember> findByClassEntityId(Integer classId);

    //kiểm tra xem user đã ở trong lớp chưa
    boolean existsByClassEntityIdAndUserId(Integer classId, Integer userId);

    //xóa thành viên khỏi lớp
    void deleteByClassEntityIdAndUserId(Integer classId, Integer userId);

    //check xem User đã tham gia bất kỳ lớp nào thuộc Course này chưa
    @Query("SELECT COUNT(cm) > 0 FROM ClassMember cm WHERE cm.user.id = :userId AND cm.classEntity.course.id = :courseId")
    boolean existsByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    //ds lớp của gv trong khóa học
    @Query("SELECT cm.classEntity FROM ClassMember cm " +
            "WHERE cm.user.userCode = :userCode " +
            "AND cm.classEntity.course.id = :courseId")
    List<ClassEntity> findClassesByUserCodeAndCourseId(@Param("userCode") String userCode,
                                                       @Param("courseId") Integer courseId);

    //  Tìm lớp học của Student trong một khóa
    @Query("SELECT cm.classEntity FROM ClassMember cm " +
            "WHERE cm.user.userCode = :userCode " +
            "AND cm.classEntity.course.id = :courseId")
    Optional<ClassEntity> findClassByStudentAndCourse(@Param("userCode") String userCode,
                                                      @Param("courseId") Integer courseId);
}