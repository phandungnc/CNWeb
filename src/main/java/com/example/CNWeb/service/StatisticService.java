package com.example.CNWeb.service;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.entity.ClassEntity;
import com.example.CNWeb.entity.Exam;
import com.example.CNWeb.entity.ExamSubmission;
import com.example.CNWeb.entity.User;
import com.example.CNWeb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticService {

    private final ExamSubmissionRepository submissionRepo;
    private final ExamQuestionRepository examQuestionRepo;
    private final ClassMemberRepository classMemberRepo;
    private final UserRepository userRepo;
    private final ExamRepository examRepo;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    //Xem điểm thi hs
    public List<StudentDTO.ExamHistoryResponse> getMyExamHistory(String userCode, UUID examId) {
        User student = userRepo.findByUserCode(userCode).orElseThrow();
        List<ExamSubmission> submissions = submissionRepo.findByStudentIdAndExamIdOrderByStartTimeDesc(student.getId(), examId);

        // Lấy tổng số câu của đề thi này
        long totalQuestions = examQuestionRepo.countByExamId(examId);
        return submissions.stream().map(sub -> {
            // tính số câu đúng
            int correctCount = 0;
            if (sub.getScore() != null && totalQuestions > 0) {
                correctCount = (int) Math.round((sub.getScore().doubleValue() / 10.0) * totalQuestions);
            }


            return new StudentDTO.ExamHistoryResponse(
                    sub.getId(),
                    sub.getExam().getTitle(),
                    sub.getStartTime().format(formatter),
                    (sub.getSubmitTime() != null) ? sub.getSubmitTime().format(formatter) : "Chưa nộp",
                    correctCount,
                    (int) totalQuestions,
                    (sub.getScore() != null) ? sub.getScore().doubleValue() : 0.0,
                    sub.getInvalidAction()
            );
        }).collect(Collectors.toList());
    }

    // xem bảng điểm của một đề thi
    public List<TeacherDTO.StudentResultResponse> getExamResults(UUID examId, String teacherCode) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Đề thi không tồn tại"));
        Integer courseId = exam.getCourse().getId();

        //lấy danh sách các lớp mà Giáo viên này dạy trong môn học đó
        List<ClassEntity> teacherClasses = classMemberRepo.findClassesByUserCodeAndCourseId(teacherCode, courseId);
        Set<Integer> teacherClassIds = teacherClasses.stream()
                .map(ClassEntity::getId)
                .collect(Collectors.toSet());

        if (teacherClassIds.isEmpty()) {
            return Collections.emptyList(); // gv không dạy lớp nào trong môn này thì emty
        }

        //Lấy tất cả bài nộp
        long totalQuestions = examQuestionRepo.countByExamId(examId);
        List<ExamSubmission> submissions = submissionRepo.findByExamIdOrderByScoreDesc(examId);

        //lọc và Map sang DTO
        List<TeacherDTO.StudentResultResponse> results = new ArrayList<>();

        for (ExamSubmission sub : submissions) {
            // Tìm xem học sinh này thuộc lớp nào trong khóa học
            Optional<ClassEntity> studentClassOpt = classMemberRepo.findClassByStudentAndCourse(
                    sub.getStudent().getUserCode(), courseId);
            // Chỉ lấy nếu học sinh thuộc lớp mà giáo viên này dạy
            if (studentClassOpt.isPresent() && teacherClassIds.contains(studentClassOpt.get().getId())) {
                ClassEntity studentClass = studentClassOpt.get();
                // Tính số câu đúng
                int correctCount = 0;
                if (sub.getScore() != null && totalQuestions > 0) {
                    correctCount = (int) Math.round((sub.getScore().doubleValue() / 10.0) * totalQuestions);
                }
                results.add(new TeacherDTO.StudentResultResponse(
                        sub.getId(),
                        sub.getStudent().getUserCode(),
                        sub.getStudent().getFullName(),
                        studentClass.getClassCode(), //
                        sub.getStartTime().format(formatter),
                        (sub.getSubmitTime() != null) ? sub.getSubmitTime().format(formatter) : "Đang làm",
                        correctCount,
                        (int) totalQuestions,
                        (sub.getScore() != null) ? sub.getScore().doubleValue() : 0.0,
                        sub.getInvalidAction()
                ));
            }
        }

        // sx theo mã lớp
        results.sort(Comparator.comparing(TeacherDTO.StudentResultResponse::getClassCode));

        return results;
    }
}