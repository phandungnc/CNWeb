package com.example.CNWeb.repository;

import com.example.CNWeb.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Integer> {
    // Tìm các lựa chọn của 1 câu hỏi
    List<QuestionOption> findByQuestionId(Integer questionId);

    // Xóa tất cả option của 1 câu hỏi
    void deleteByQuestionId(Integer questionId);
}