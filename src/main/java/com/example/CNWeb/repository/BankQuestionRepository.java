package com.example.CNWeb.repository;

import com.example.CNWeb.entity.BankQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BankQuestionRepository extends JpaRepository<BankQuestion, Integer> {
    // lấy danh sách câu hỏi của một môn học
    List<BankQuestion> findByCourseIdOrderByCreatedAtDesc(Integer courseId);

    // Nếu chỉ cần tìm theo ID môn đơn giản
    List<BankQuestion> findByCourseId(Integer courseId);

    // tìmm câu hỏi trong cùng Course và chưa nằm trong Exam này
    @Query("SELECT q FROM BankQuestion q " +
            "WHERE q.course.id = :courseId " +
            "AND q.id NOT IN (SELECT eq.question.id FROM ExamQuestion eq WHERE eq.exam.id = :examId) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "lower(q.content) LIKE lower(concat('%', :keyword, '%')))")
    List<BankQuestion> findAvailableQuestionsForExam(@Param("courseId") Integer courseId,
                                                     @Param("examId") UUID examId,
                                                     @Param("keyword") String keyword);

    // lấy ngẫu nhiên các câu hoirtheo loại
    @Query(value = "SELECT * FROM bank_questions q " +
            "WHERE q.course_id = :courseId " +
            "AND q.question_type = :type " +
            "AND q.id NOT IN (SELECT question_id FROM exam_questions WHERE exam_id = :examId) " +
            "ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<BankQuestion> findRandomQuestions(@Param("courseId") Integer courseId,
                                           @Param("examId") UUID examId,
                                           @Param("type") String type,
                                           @Param("limit") Integer limit);

    // ds câu hỏi trong đề
    @Query("SELECT q FROM BankQuestion q JOIN ExamQuestion eq ON q.id = eq.question.id " +
            "WHERE eq.exam.id = :examId")
    List<BankQuestion> findQuestionsInExam(@Param("examId") UUID examId);
}