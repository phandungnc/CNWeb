package com.example.CNWeb.entity;

import lombok.Data;

import java.io.Serializable;
import java.util.UUID;

@Data
public class ExamQuestionId implements Serializable {
    private UUID exam;
    private Integer question;
}
