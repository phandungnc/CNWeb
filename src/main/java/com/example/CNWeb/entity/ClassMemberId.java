package com.example.CNWeb.entity;

import lombok.Data;
import java.io.Serializable;

@Data
public class ClassMemberId implements Serializable {
    private Integer classEntity;
    private Integer user;
}

