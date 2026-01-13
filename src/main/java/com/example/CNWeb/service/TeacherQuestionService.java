package com.example.CNWeb.service;

import com.example.CNWeb.dto.TeacherDTO;
import com.example.CNWeb.entity.*;
import com.example.CNWeb.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherQuestionService {

    private final BankQuestionRepository questionRepo;
    private final QuestionOptionRepository optionRepo;
    private final CourseRepository courseRepo;
    private final UserRepository userRepo;
    private final ExamQuestionRepository examQuestionRepo;

    // lấy danh sách câu hỏi
    public List<TeacherDTO.QuestionListResponse> getQuestionsByCourse(Integer courseId) {
        List<BankQuestion> questions = questionRepo.findByCourseId(courseId);

        return questions.stream().map(q -> new TeacherDTO.QuestionListResponse(
                q.getId(),
                q.getContent(),
                q.getQuestionType(),
                q.getCreatedBy().getFullName(),
                q.getCreatedAt()
        )).collect(Collectors.toList());
    }

    // xem chi tiết 1 câu hỏi (xem sửa)
    public TeacherDTO.QuestionDetailResponse getQuestionDetail(Integer questionId) {
        BankQuestion q = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
        List<TeacherDTO.OptionResponse> options = q.getOptions().stream()
                .map(o -> new TeacherDTO.OptionResponse(o.getId(), o.getOptionText(), o.getIsCorrect()))
                .collect(Collectors.toList());
        return new TeacherDTO.QuestionDetailResponse(
                q.getId(), q.getContent(), q.getQuestionType(), options
        );
    }

    // tạo mới câu hỏi
    @Transactional
    public void createQuestion(TeacherDTO.QuestionRequest req, String userCode) {
        User teacher = userRepo.findByUserCode(userCode)
                .orElseThrow(() -> new RuntimeException("Giáo viên không tồn tại"));
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));
        validateQuestionLogic(req.getQuestionType(), req.getOptions());
        BankQuestion question = new BankQuestion();
        question.setContent(req.getContent());
        question.setQuestionType(req.getQuestionType());
        question.setCourse(course);
        question.setCreatedBy(teacher);
        //lưu câu hỏi
        BankQuestion savedQuestion = questionRepo.save(question);
        // Lưu lựa chọn của câu hỏi
        saveOptions(savedQuestion, req.getOptions());
    }

    // update câu hỏi
    @Transactional
    public void updateQuestion(Integer questionId, TeacherDTO.QuestionRequest req, String userCode) {
        BankQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));

        if (!question.getCreatedBy().getUserCode().equals(userCode)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa câu hỏi của người khác!");
        }
        if (examQuestionRepo.existsByQuestionId(questionId)) {
            throw new RuntimeException("Câu hỏi này đang nằm trong đề thi, không được phép chỉnh sửa!");
        }
        validateQuestionLogic(req.getQuestionType(), req.getOptions());
        question.setContent(req.getContent());
        question.setQuestionType(req.getQuestionType());

        //ds đáp án
        List<QuestionOption> currentOptions = question.getOptions();
        List<TeacherDTO.OptionRequest> requestOptions = req.getOptions();
        if (requestOptions == null) requestOptions = new ArrayList<>();
        // Những option nào có trong DB nhưng KHÔNG có trong request gửi lên -> Xóa
        List<Integer> reqIds = requestOptions.stream()
                .filter(o -> o.getId() != null)
                .map(TeacherDTO.OptionRequest::getId)
                .toList();

        // Xóa những cái cũ không còn nằm trong list mới
        currentOptions.removeIf(opt -> !reqIds.contains(opt.getId()));

        // thêm mới or sửa
        for (TeacherDTO.OptionRequest optReq : requestOptions) {
            if (optReq.getId() == null) {
                // ko có id mới thì là thêm mới
                QuestionOption newOption = new QuestionOption();
                newOption.setQuestion(question);
                newOption.setOptionText(optReq.getOptionText());
                newOption.setIsCorrect(optReq.getIsCorrect());

                currentOptions.add(newOption);
            } else {
                //id cũ thì là sửa
                QuestionOption existingOption = currentOptions.stream()
                        .filter(o -> o.getId().equals(optReq.getId()))
                        .findFirst()
                        .orElse(null); // Thực tế chắc chắn tìm thấy vì đã filter ở bước A

                if (existingOption != null) {
                    existingOption.setOptionText(optReq.getOptionText());
                    existingOption.setIsCorrect(optReq.getIsCorrect());
                }
            }
        }
        questionRepo.save(question);
    }
    @Transactional
    public void deleteQuestion(Integer questionId, String userCode) {
        BankQuestion question = questionRepo.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));

        // check ng tạo
        if (!question.getCreatedBy().getUserCode().equals(userCode)) {
            throw new RuntimeException("Bạn không có quyền xóa câu hỏi của người khác!");
        }
        if (examQuestionRepo.existsByQuestionId(questionId)) {
            throw new RuntimeException("Câu hỏi này đang nằm trong đề thi, không được phép xóa!");
        }
        questionRepo.delete(question);
    }

    // hàm lưu đáp án
    private void saveOptions(BankQuestion question, List<TeacherDTO.OptionRequest> optionRequests) {
        if (optionRequests != null) {
            List<QuestionOption> options = new ArrayList<>();
            for (TeacherDTO.OptionRequest optReq : optionRequests) {
                QuestionOption option = new QuestionOption();
                option.setQuestion(question);
                option.setOptionText(optReq.getOptionText());
                option.setIsCorrect(optReq.getIsCorrect());
                options.add(option);
            }
            optionRepo.saveAll(options);
        }
    }

    private void validateQuestionLogic(String type, List<TeacherDTO.OptionRequest> options) {
        // Check có đáp án đúng không
        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();
        if (correctCount == 0) {
            throw new RuntimeException("Vui lòng chọn ít nhất một đáp án đúng!");
        }

        // Check logic câu 1 chọn
        if ("SINGLE".equals(type) && correctCount > 1) {
            throw new RuntimeException("Loại câu hỏi 'Một đáp án' chỉ được phép chọn duy nhất 1 đáp án đúng!");
        }
    }
}