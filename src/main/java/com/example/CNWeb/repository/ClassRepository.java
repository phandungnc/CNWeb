package com.example.CNWeb.repository;

import com.example.CNWeb.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<ClassEntity, Integer> {
    List<ClassEntity> findByCourseId(Integer courseId); // lấy danh sách lớp theo khóa học
    boolean existsByClassCode(String classCode);
}