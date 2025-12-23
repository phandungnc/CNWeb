package com.example.CNWeb.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Composite Key Class
@Data
@NoArgsConstructor
@AllArgsConstructor
class CourseMemberId implements Serializable {
    private Integer course;
    private Integer user;
}
