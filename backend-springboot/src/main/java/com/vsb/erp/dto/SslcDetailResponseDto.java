package com.vsb.erp.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SslcDetailResponseDto {

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

    // Marks Summary
    private Integer    totalMarks;
    private Integer    maxMarks;
    private BigDecimal percentage;
    private String     grade;
    private String     result;

    // Subject-Wise Marks
    private Integer tamilMarks;
    private Integer englishMarks;
    private Integer mathematicsMarks;
    private Integer scienceMarks;
    private Integer socialScienceMarks;
    private String  language3Subject;
    private Integer language3Marks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
