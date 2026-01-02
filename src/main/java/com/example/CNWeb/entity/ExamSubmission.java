package com.example.CNWeb.entity;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "exam_submissions",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"exam_id", "student_id", "attempt_number"}
        )
)
@Data
public class ExamSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @Column(name = "start_time")
    private LocalDateTime startTime = LocalDateTime.now();

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    @Column(name = "attempt_number")
    private Integer attemptNumber = 1;

    @Column(precision = 5, scale = 2)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(length = 20)
    private String status = "IN_PROGRESS";

    @Column(name = "invalid_action")
    private Integer invalidAction = 0;
}
