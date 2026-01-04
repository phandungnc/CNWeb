package com.example.CNWeb.service;

import com.example.CNWeb.dto.StudentDTO;
import com.example.CNWeb.entity.*;
import com.example.CNWeb.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentExamService {

    private final ExamRepository examRepo;
    private final ExamQuestionRepository examQuestionRepo;
    private final ExamSubmissionRepository submissionRepo;
    private final BankQuestionRepository questionRepo;
    private final StudentAnswerRepository answerRepo;
    private final QuestionOptionRepository optionRepo;
    private final UserRepository userRepo;

    // Lấy danh sách đề thi của môn học kèm số câu
    public List<StudentDTO.ExamResponse> getExamsByCourse(Integer courseId) {
        //lấy tất cả đề thi của môn này
        List<Exam> exams = examRepo.findByCourseIdOrderByStartTimeDesc(courseId);
        return exams.stream().map(exam -> {
            long questionCount = examQuestionRepo.countByExamId(exam.getId());

            return new StudentDTO.ExamResponse(
                    exam.getId(),
                    exam.getTitle(),
                    exam.getStartTime(),
                    exam.getEndTime(),
                    exam.getDurationMinutes(),
                    exam.getMaxAttempts(),
                    exam.getCreatedBy().getFullName(),
                    questionCount
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public StudentDTO.StartExamResponse startExam(UUID examId, String userCode) {
        User student = userRepo.findByUserCode(userCode).orElseThrow();
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Đề thi không tồn tại"));

        // ktra tgian
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) throw new RuntimeException("Chưa đến giờ làm bài!");
        if (now.isAfter(exam.getEndTime())) throw new RuntimeException("Đề thi đã kết thúc!");

        // ktra bài hs đang làm
        Optional<ExamSubmission> existing = submissionRepo.findByStudentIdAndExamIdAndStatus(
                student.getId(), examId, "IN_PROGRESS");

        if (existing.isPresent()) {
            return new StudentDTO.StartExamResponse(
                    existing.get().getId(),
                    exam.getDurationMinutes(),
                    calculateEndTime(existing.get(), exam).toString()
            );
        }

        // ktra số lần làm
        long attempts = submissionRepo.countByExamIdAndStudentId(examId, student.getId());
        if (attempts >= exam.getMaxAttempts()) {
            throw new RuntimeException("Bạn đã hết lượt làm bài!");
        }

        //tạo Submission mới
        ExamSubmission submission = new ExamSubmission();
        submission.setExam(exam);
        submission.setStudent(student);
        submission.setStartTime(now);
        submission.setStatus("IN_PROGRESS");
        submission.setAttemptNumber((int) attempts + 1);

        submissionRepo.save(submission);

        return new StudentDTO.StartExamResponse(
                submission.getId(),
                exam.getDurationMinutes(),
                calculateEndTime(submission, exam).toString()
        );
    }

    // lấy nd đề thi
    public List<StudentDTO.ExamContentResponse> getExamContent(UUID examId) {
        //lấy câu hỏi từ bảng ExamQuestion
        List<BankQuestion> questions = questionRepo.findQuestionsInExam(examId);

        return questions.stream().map(q -> {
            List<StudentDTO.OptionView> options = q.getOptions().stream()
                    .map(o -> new StudentDTO.OptionView(o.getId(), o.getOptionText()))
                    .collect(Collectors.toList());

            Collections.shuffle(options); // random thứ tự đáp án khi mở đề

            return new StudentDTO.ExamContentResponse(
                    q.getId(), q.getContent(), q.getQuestionType(), options
            );
        }).collect(Collectors.toList());
    }

    //gửi đáp án
    @Transactional
    public void submitAnswer(StudentDTO.SubmitAnswerRequest req, String userCode) {
        ExamSubmission submission = submissionRepo.findById(req.getSubmissionId())
                .orElseThrow(() -> new RuntimeException("Bài làm không tồn tại"));
        if (!"IN_PROGRESS".equals(submission.getStatus())) {
            throw new RuntimeException("Bài thi đã đóng, không thể lưu đáp án!");
        }
        BankQuestion question = questionRepo.findById(req.getQuestionId())
                .orElseThrow();

        // xóa lựa chọn cũ của câu hỏi này
        answerRepo.deleteBySubmissionIdAndQuestionId(submission.getId(), question.getId());

        //Lưu các lựa chọn mới
        if (req.getSelectedOptionIds() != null && !req.getSelectedOptionIds().isEmpty()) {
            List<StudentAnswer> newAnswers = new ArrayList<>();
            for (Integer optId : req.getSelectedOptionIds()) {
                QuestionOption option = optionRepo.findById(optId).orElse(null);

                // Chỉ lưu nếu option thuộc đúng câu hỏi đó
                if (option != null && option.getQuestion().getId().equals(question.getId())) {
                    StudentAnswer ans = new StudentAnswer();
                    ans.setSubmission(submission);
                    ans.setQuestion(question);
                    ans.setOption(option);
                    newAnswers.add(ans);
                }
            }
            answerRepo.saveAll(newAnswers);
        }
    }

    //nộp bài và tính điểm
    @Transactional
    public void finishExam(Integer submissionId) {
        ExamSubmission submission = submissionRepo.findById(submissionId).orElseThrow();
        if (!"IN_PROGRESS".equals(submission.getStatus())) return;
        submission.setSubmitTime(LocalDateTime.now());
        submission.setStatus("SUBMITTED");

        //tính điểm
        BigDecimal score = calculateScore(submission);
        submission.setScore(score);

        submissionRepo.save(submission);
    }

    private BigDecimal calculateScore(ExamSubmission submission) {
        List<BankQuestion> questions = questionRepo.findQuestionsInExam(submission.getExam().getId());
        List<StudentAnswer> answers = answerRepo.findBySubmissionId(submission.getId());

        int correctCount = 0;
        for (BankQuestion q : questions) {
            Set<Integer> correctOptionIds = q.getOptions().stream()
                    .filter(QuestionOption::getIsCorrect)
                    .map(QuestionOption::getId)
                    .collect(Collectors.toSet());

            // lấy set id đáp án hs chọn
            Set<Integer> selectedOptionIds = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId()))
                    .map(a -> a.getOption().getId()) // StudentAnswer.getOption()
                    .collect(Collectors.toSet());

            // giống thì đc điểm
            if (correctOptionIds.equals(selectedOptionIds)) {
                correctCount++;
            }
        }

        if (questions.isEmpty()) return BigDecimal.ZERO;
        //   thang điểm 10
        double finalScore = (double) correctCount / questions.size() * 10;
        return BigDecimal.valueOf(finalScore);
    }

    private LocalDateTime calculateEndTime(ExamSubmission sub, Exam exam) {
        LocalDateTime end = sub.getStartTime().plusMinutes(exam.getDurationMinutes());
        //k được vượt quá thời gian đóng đề
        return end.isAfter(exam.getEndTime()) ? exam.getEndTime() : end;
    }

    // đếm vi phạm
    @Transactional
    public void reportInvalidAction(Integer submissionId) {
        ExamSubmission submission = submissionRepo.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Bài làm không tồn tại"));
        if (!"IN_PROGRESS".equals(submission.getStatus())) {
            return; // nộp r thì k tính
        }
        // Tăng biến đếm
        int currentCount = (submission.getInvalidAction() == null) ? 0 : submission.getInvalidAction();
        submission.setInvalidAction(currentCount + 1);

        submissionRepo.save(submission);
    }

}