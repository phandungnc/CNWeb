package com.example.CNWeb.repository;

import com.example.CNWeb.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Integer> {

    // Tìm tất cả câu trả lời của 1 bài thi
    List<StudentAnswer> findBySubmissionId(Integer submissionId);

    // Xóa các lựa chọn cũ của câu hỏi (khi hs update câu trl)
    void deleteBySubmissionIdAndQuestionId(Integer submissionId, Integer questionId);

    @Query("SELECT COUNT(sa) FROM StudentAnswer sa WHERE sa.submission.id = :submissionId AND sa.option.isCorrect = true")
    long countCorrectOptions(@Param("submissionId") Integer submissionId);
}