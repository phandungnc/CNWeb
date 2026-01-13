package com.example.CNWeb.repository;

import com.example.CNWeb.entity.ExamQuestion;
import com.example.CNWeb.entity.ExamQuestionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, ExamQuestionId> {
    // Xóa một câu hỏi khỏi đề thi
    void deleteByExamIdAndQuestionId(UUID examId, Integer questionId);

    // Kiểm tra xem câu hỏi đã có trong đề chưa
    boolean existsByExamIdAndQuestionId(UUID examId, Integer questionId);

    // Đếm số câu hỏi hiện có trong đề
    long countByExamId(UUID examId);
    // đã có trong đề thi chưa để k sửa xóa dc
    boolean existsByQuestionId(Integer questionId);


}