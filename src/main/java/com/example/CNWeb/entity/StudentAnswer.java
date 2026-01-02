package com.example.CNWeb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "student_answers")
@Data
public class StudentAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "submission_id")
    private ExamSubmission submission;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private BankQuestion question;

    @ManyToOne
    @JoinColumn(name = "option_id")
    private QuestionOption option;
}

