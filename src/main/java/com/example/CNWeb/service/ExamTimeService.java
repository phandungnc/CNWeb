package com.example.CNWeb.service;

import com.example.CNWeb.dto.SocketMessage;
import com.example.CNWeb.entity.ExamSubmission;
import com.example.CNWeb.repository.ExamSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamTimeService {

    private final ExamSubmissionRepository submissionRepo;
    private final SimpMessagingTemplate messagingTemplate; // Dùng để bắn socket
    private final StudentExamService studentExamService; // Để gọi nộp bài


    @Scheduled(fixedRate = 2000) // Quét mỗi 2-5 giây
    @Transactional
    public void processExamTimer() {
        // Lấy các bài đang làm
        List<ExamSubmission> activeSubmissions = submissionRepo.findAllInProgressSubmissions();
        LocalDateTime now = LocalDateTime.now();

        for (ExamSubmission sub : activeSubmissions) {
            LocalDateTime endTime = calculateRealEndTime(sub);

            // Chỉ xử lý khi hết giờ
            if (now.isAfter(endTime.plusSeconds(5))) { // cho phép chậm 5s

                // thhu bài phía Server
                studentExamService.finishExam(sub.getId());

                // gửi tbao thu bài
                SocketMessage msg = new SocketMessage("FORCE_SUBMIT", "Hết giờ!");
                messagingTemplate.convertAndSendToUser(
                        sub.getStudent().getUserCode(),
                        "/queue/exam-status",
                        msg
                );
            }
        }
    }

    // tính thời gian kết thúc từ sv
    private LocalDateTime calculateRealEndTime(ExamSubmission sub) {
        // Thời gian làm bài theo duration
        LocalDateTime durationEndTime = sub.getStartTime().plusMinutes(sub.getExam().getDurationMinutes());
        // Thời gian hết giờ theo hạn đềthi
        LocalDateTime examCloseTime = sub.getExam().getEndTime();

        //đang làm dở mà đề đóng thì cũng phải nộp
        if (durationEndTime.isAfter(examCloseTime)) {
            return examCloseTime;
        }
        return durationEndTime;
    }
}