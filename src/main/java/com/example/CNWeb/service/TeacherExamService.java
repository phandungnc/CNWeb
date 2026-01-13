package com.example.CNWeb.service;

import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.entity.*;
import com.example.CNWeb.repository.*;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherExamService {
    private final BankQuestionRepository questionRepo;
    private final ExamQuestionRepository examQuestionRepo;
    private final ExamRepository examRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final ExamSubmissionRepository submissionRepo;
    private final StudentAnswerRepository answerRepo;
    private final ClassMemberRepository classMemberRepo;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    //ds đề thi theo khóa
    public List<TeacherDTO.ExamResponse> getExamsByCourse(Integer courseId) {
        List<Exam> exams = examRepo.findByCourseIdOrderByStartTimeDesc(courseId);
        return exams.stream()
                .map(e -> new TeacherDTO.ExamResponse(
                        e.getId(), e.getTitle(), e.getDurationMinutes(),
                        e.getStartTime(), e.getEndTime(), e.getMaxAttempts()))
                .collect(Collectors.toList());
    }

    //tạo đề thi mới
    @Transactional
    public TeacherDTO.ExamResponse createExam(TeacherDTO.ExamRequest req, String userCode) {
        User teacher = userRepo.findByUserCode(userCode)
                .orElseThrow(() -> new RuntimeException("Giáo viên không tồn tại"));

        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        Exam exam = new Exam();
        exam.setCourse(course);
        exam.setTitle(req.getTitle());
        exam.setDurationMinutes(req.getDurationMinutes());
        exam.setMaxAttempts(req.getMaxAttempts());
        exam.setCreatedBy(teacher);

        LocalDateTime examStart = LocalDateTime.parse(req.getStartTime(), formatter);
        LocalDateTime examEnd = LocalDateTime.parse(req.getEndTime(), formatter);

        // đảm bảo thời gian hợp lệ
        if (examEnd.isBefore(examStart)) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        //đảm bảo thời gian trong thời gian khóa học
        validateExamTimeInCourse(examStart, examEnd, course);

        exam.setStartTime(examStart);
        exam.setEndTime(examEnd);

        Exam saved = examRepo.save(exam);

        return new TeacherDTO.ExamResponse(
                saved.getId(), saved.getTitle(), saved.getDurationMinutes(),
                saved.getStartTime(), saved.getEndTime(), saved.getMaxAttempts()
        );
    }

    //sửa đề thi
    @Transactional
    public TeacherDTO.ExamResponse updateExam(UUID examId, TeacherDTO.ExamRequest req) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Đề thi không tồn tại"));

        Course course = exam.getCourse();
        exam.setTitle(req.getTitle());
        exam.setDurationMinutes(req.getDurationMinutes());
        exam.setMaxAttempts(req.getMaxAttempts());

        LocalDateTime newStart = exam.getStartTime();
        LocalDateTime newEnd = exam.getEndTime();

        if (req.getStartTime() != null)
            newStart = LocalDateTime.parse(req.getStartTime(), formatter);

        if (req.getEndTime() != null)
            newEnd = LocalDateTime.parse(req.getEndTime(), formatter);

        // check time
        if (newEnd.isBefore(newStart)) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        validateExamTimeInCourse(newStart, newEnd, course);
        exam.setStartTime(newStart);
        exam.setEndTime(newEnd);

        Exam saved = examRepo.save(exam);
        return new TeacherDTO.ExamResponse(
                saved.getId(), saved.getTitle(), saved.getDurationMinutes(),
                saved.getStartTime(), saved.getEndTime(), saved.getMaxAttempts()
        );
    }

    @Transactional
    public void deleteExam(UUID examId) {
        if (!examRepo.existsById(examId)) {
            throw new RuntimeException("Đề thi không tồn tại");
        }
        examRepo.deleteById(examId);
    }


    //lấy danh sách câu hỏi đang có trong đề
    public List<TeacherDTO.QuestionListResponse> getQuestionsInExam(UUID examId) {
        List<BankQuestion> questions = questionRepo.findQuestionsInExam(examId);
        return mapToQuestionResponse(questions);
    }

    //lấy danh sách câu hỏi để thêm
    public List<TeacherDTO.QuestionListResponse> getAvailableQuestions(UUID examId, String keyword) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Đề thi không tồn tại"));
        List<BankQuestion> questions = questionRepo.findAvailableQuestionsForExam(
                exam.getCourse().getId(), examId, keyword);
        return mapToQuestionResponse(questions);
    }

    //thêm tay bằng checkboxx
    @Transactional
    public void addQuestionsToExam(UUID examId, List<Integer> questionIds, String userCode) {
        Exam exam = validateExamOwner(examId, userCode);
        for (Integer qId : questionIds) {
            BankQuestion question = questionRepo.findById(qId)
                    .orElseThrow(() -> new RuntimeException("Câu hỏi ID " + qId + " không tồn tại"));
            // Check xem đã có chưa
            if (!examQuestionRepo.existsByExamIdAndQuestionId(examId, qId)) {
                ExamQuestion eq = new ExamQuestion(exam, question);
                examQuestionRepo.save(eq);
            }
        }
    }

    // Xóa câu hỏi khỏi đề
    @Transactional
    public void removeQuestionFromExam(UUID examId, Integer questionId, String userCode) {
        validateExamOwner(examId, userCode);
        examQuestionRepo.deleteByExamIdAndQuestionId(examId, questionId);
    }

    //tạo đề tự động
    @Transactional
    public void autoGenerateExamQuestions(UUID examId, TeacherDTO.AutoGenerateExamRequest req, String userCode) {
        Exam exam = validateExamOwner(examId, userCode);
        Integer courseId = exam.getCourse().getId();
        // lấy ngẫu nhiên 1 chọn
        if (req.getNumberOfSingleChoice() != null && req.getNumberOfSingleChoice() > 0) {
            List<BankQuestion> randomSingles = questionRepo.findRandomQuestions(
                    courseId, examId, "SINGLE", req.getNumberOfSingleChoice());
            if (randomSingles.size() < req.getNumberOfSingleChoice()) {
                throw new RuntimeException("Ngân hàng câu hỏi không đủ số lượng câu 'Một đáp án' yêu cầu!");
            }
            saveListToExam(exam, randomSingles);
        }

        // lấy ngẫu nhiên nhiều chọn
        if (req.getNumberOfMultipleChoice() != null && req.getNumberOfMultipleChoice() > 0) {
            List<BankQuestion> randomMultiples = questionRepo.findRandomQuestions(
                    courseId, examId, "MULTIPLE", req.getNumberOfMultipleChoice());

            if (randomMultiples.size() < req.getNumberOfMultipleChoice()) {
                throw new RuntimeException("Ngân hàng câu hỏi không đủ số lượng câu 'Nhiều đáp án' yêu cầu!");
            }
            saveListToExam(exam, randomMultiples);
        }
    }

    private Exam validateExamOwner(UUID examId, String userCode) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Đề thi không tồn tại"));
        User user = userRepo.findByUserCode(userCode).orElseThrow();
        return exam;
    }

    private void saveListToExam(Exam exam, List<BankQuestion> questions) {
        for (BankQuestion q : questions) {
            ExamQuestion eq = new ExamQuestion(exam, q);
            examQuestionRepo.save(eq);
        }
    }

    private List<TeacherDTO.QuestionListResponse> mapToQuestionResponse(List<BankQuestion> questions) {
        return questions.stream().map(q -> new TeacherDTO.QuestionListResponse(
                q.getId(), q.getContent(), q.getQuestionType(),
                q.getCreatedBy().getFullName(), q.getCreatedAt()
        )).collect(Collectors.toList());
    }

    private void validateExamTimeInCourse(LocalDateTime examStart, LocalDateTime examEnd, Course course) {
        // kiểm tra tg bắt đầu của khóa
        if (course.getStartTime() != null && examStart.isBefore(course.getStartTime())) {
            throw new RuntimeException("Ngày thi không được sớm hơn ngày bắt đầu khóa học (" +
                    course.getStartTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")");
        }
        // tg kết thúc của khóa
        if (course.getEndTime() != null && examEnd.isAfter(course.getEndTime())) {
            throw new RuntimeException("Ngày thi không được trễ hơn ngày kết thúc khóa học (" +
                    course.getEndTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")");
        }
    }

    //xuat file kq
    public List<TeacherDTO.ExamResultResponse> getExamResults(UUID examId) {
        List<ExamSubmission> submissions = submissionRepo.findByExamIdOrderByScoreDesc(examId);
        long totalQuestions = examQuestionRepo.countByExamId(examId);

        List<TeacherDTO.ExamResultResponse> results = submissions.stream().map(sub -> {
            int correctCount = countCorrectAnswers(sub);
            String classCode = getStudentClassCode(sub.getStudent().getUserCode(), sub.getExam().getCourse().getId());

            return new TeacherDTO.ExamResultResponse(
                    sub.getId(),
                    sub.getStudent().getUserCode(),
                    sub.getStudent().getFullName(),
                    classCode,
                    sub.getStartTime() != null ? sub.getStartTime().format(formatter) : "",
                    sub.getSubmitTime() != null ? sub.getSubmitTime().format(formatter) : "Chưa nộp",
                    correctCount,
                    (int) totalQuestions,
                    sub.getScore(),
                    sub.getInvalidAction()
            );
        }).collect(Collectors.toList());

        // sắp xếp theo mã lớp
        results.sort(Comparator.comparing(TeacherDTO.ExamResultResponse::getClassCode));
        return results;
    }

    //tính số câu đúng
    private int countCorrectAnswers(ExamSubmission submission) {
        List<StudentAnswer> answers = answerRepo.findBySubmissionId(submission.getId());
        List<BankQuestion> questions = questionRepo.findQuestionsInExam(submission.getExam().getId());
        int correct = 0;

        for (BankQuestion q : questions) {
            Set<Integer> correctOptionIds = q.getOptions().stream()
                    .filter(QuestionOption::getIsCorrect)
                    .map(QuestionOption::getId)
                    .collect(Collectors.toSet());

            Set<Integer> selectedOptionIds = answers.stream()
                    .filter(a -> a.getQuestion().getId().equals(q.getId()))
                    .map(a -> a.getOption().getId())
                    .collect(Collectors.toSet());

            if (correctOptionIds.equals(selectedOptionIds) && !correctOptionIds.isEmpty()) {
                correct++;
            }
        }
        return correct;
    }

    // lấy code lớp
    private String getStudentClassCode(String userCode, Integer courseId) {
        return classMemberRepo.findClassByStudentAndCourse(userCode, courseId)
                .map(ClassEntity::getClassCode)
                .orElse("---");
    }


    // xuat file kq
    public void exportExamResultToExcel(UUID examId, HttpServletResponse response) throws IOException {
        //Lấy dữ liệu (Dữ liệu đã được sắp xếp trong getExamResults)
        List<TeacherDTO.ExamResultResponse> results = getExamResults(examId);
        Exam exam = examRepo.findById(examId).orElseThrow();

        //Tạo file Excel
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("KetQua");

        //header
        Row headerRow = sheet.createRow(0);
        String[] columns = {"STT", "Mã SV", "Họ và tên", "Lớp", "Số câu đúng", "Thời gian làm", "Thời gian nộp", "Điểm số", "Vi phạm"};

        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // Body
        int rowNum = 1;
        for (TeacherDTO.ExamResultResponse res : results) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(rowNum - 1);
            row.createCell(1).setCellValue(res.getStudentCode());
            row.createCell(2).setCellValue(res.getFullName());
            row.createCell(3).setCellValue(res.getClassCode());
            row.createCell(4).setCellValue(res.getCorrectCount() + "/" + res.getTotalQuestions());
            row.createCell(5).setCellValue(res.getStartTime());
            row.createCell(6).setCellValue(res.getSubmitTime());

            // Điểm số
            Cell scoreCell = row.createCell(7);
            scoreCell.setCellValue(res.getScore() != null ? res.getScore().doubleValue() : 0);

            // Vi phạm
            row.createCell(8).setCellValue(res.getInvalidAction() != null ? res.getInvalidAction() : 0);
        }

        // Auto size cột
        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        // Gửi về Client
        response.setContentType("application/octet-stream");
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=KetQua_" + examId + ".xlsx";
        response.setHeader(headerKey, headerValue);

        ServletOutputStream outputStream = response.getOutputStream();
        workbook.write(outputStream);
        workbook.close();
        outputStream.close();
    }
}