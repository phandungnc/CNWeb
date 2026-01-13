package com.example.CNWeb.repository;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
//tiện cho tìm kiếm
@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    //admin
    @Query("SELECT c FROM Course c WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(c.name)) as string) LIKE " +
            "cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string))")
    List<Course> searchCourses(@Param("keyword") String keyword);

    //khóa học của gv
    @Query("SELECT DISTINCT c FROM ClassMember cm " +
            "JOIN cm.classEntity cl " +
            "JOIN cl.course c " +
            "JOIN cm.user u " +
            "WHERE u.userCode = :userCode")
    List<Course> findCoursesByTeacher(@Param("userCode") String userCode);

    @Query("SELECT DISTINCT c FROM ClassMember cm " +
            "JOIN cm.classEntity cl " +
            "JOIN cl.course c " +
            "JOIN cm.user u " +
            "WHERE u.userCode = :userCode " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(c.name)) as string) LIKE " +
            "cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string))")
    List<Course> findCoursesByStudent(@Param("userCode") String userCode,
                                      @Param("keyword") String keyword);
}
