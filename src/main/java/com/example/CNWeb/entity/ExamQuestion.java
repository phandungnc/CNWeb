package com.example.CNWeb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exam_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ExamQuestionId.class)
public class ExamQuestion {

    @Id
    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    @Id
    @ManyToOne
    @JoinColumn(name = "question_id")
    private BankQuestion question;
}

