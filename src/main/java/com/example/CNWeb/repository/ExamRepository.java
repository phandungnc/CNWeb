package com.example.CNWeb.repository;

import com.example.CNWeb.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExamRepository extends JpaRepository<Exam, UUID> {
    // ds đề thi, xếp theo mới nhất
    // Lấy ds đề thi theo môn
    List<Exam> findByCourseIdOrderByStartTimeDesc(Integer courseId);
}