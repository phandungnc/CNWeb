package com.example.CNWeb.repository;

import com.example.CNWeb.entity.ExamSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Integer> {

    // Đếm số lần đã làm
    long countByExamIdAndStudentId(UUID examId, Integer studentId);

    // Tìm bài đang làm dở (để Re-join)
    Optional<ExamSubmission> findByStudentIdAndExamIdAndStatus(Integer studentId, UUID examId, String status);

    // Lấy tất cả bài đang IN_PROGRESS (Cho WebSocket Scheduler)
    @Query("SELECT s FROM ExamSubmission s JOIN FETCH s.student JOIN FETCH s.exam WHERE s.status = 'IN_PROGRESS'")
    List<ExamSubmission> findAllInProgressSubmissions();

    // HỌC SINH: Lấy lịch sử thi của mình (Sắp xếp mới nhất lên đầu)
    List<ExamSubmission> findByStudentIdAndExamIdOrderByStartTimeDesc(Integer studentId, UUID examId);

    // GIÁO VIÊN: Lấy bảng điểm của 1 đề thi (Chỉ lấy bài đã nộp hoặc đang làm)
    List<ExamSubmission> findByExamIdOrderByScoreDesc(UUID examId);
}