package com.example.CNWeb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@IdClass(ClassMemberId.class)
@Entity
@Table(name = "class_members")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class ClassMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}