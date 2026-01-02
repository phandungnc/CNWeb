package com.example.CNWeb.repository;

import com.example.CNWeb.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
//tiện cho tìm kiếm
@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    @Query("SELECT c FROM Course c WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "cast(function('unaccent', lower(c.name)) as string) LIKE " +
            "cast(function('unaccent', lower(concat('%', :keyword, '%'))) as string))")
    List<Course> searchCourses(@Param("keyword") String keyword);
}
