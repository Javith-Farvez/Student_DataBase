package com.vsb.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class HscDetailResponseDto {

    private Long id;

    // Student Info
    private Long   studentId;
    private String registerNumber;
    private String fullName;
    private String departmentName;
    private String batch;

    // School Info
    private String  schoolName;
    private String  board;
    private Integer passingYear;
    private String  examRegisterNumber;
    private String  groupName;

    // Marks Summary
    private Integer    totalMarks;
    private Integer    maxMarks;
    private BigDecimal percentage;
    private BigDecimal cutoff;
    private String     grade;
    private String     result;

    // Language Subjects
    private String  language1Subject;
    private Integer language1Marks;
    private String  language2Subject;
    private Integer language2Marks;

    // Core Subjects
    private Integer physicsMarks;
    private Integer chemistryMarks;
    private Integer mathematicsMarks;
    private Integer biologyMarks;
    private Integer computerScienceMarks;

    // Optional
    private String  optionalSubject;
    private Integer optionalMarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
