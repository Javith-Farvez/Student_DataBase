package com.vsb.erp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating HSC (12th) details.
 * Cutoff is auto-computed from Physics, Chemistry, Maths/Bio/CS.
 */
@Data
public class HscDetailRequestDto {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    // School Info
    @Size(max = 200) private String schoolName;
    @Size(max = 60)  private String board;
    @Min(1990) @Max(2100) private Integer passingYear;
    @Size(max = 40)  private String examRegisterNumber;
    @Size(max = 60)  private String groupName;     // Bio-Maths, CS-Maths, Commerce, Arts

    // Marks Summary
    @Min(0) @Max(1200) private Integer totalMarks;
    @Min(0) @Max(1200) private Integer maxMarks;
    @DecimalMin("0.0") @DecimalMax("100.0") private BigDecimal percentage;
    @DecimalMin("0.0") @DecimalMax("200.0") private BigDecimal cutoff; // null = auto-compute
    @Size(max = 5)   private String grade;
    @Pattern(regexp = "PASS|FAIL") private String result;

    // Language Subjects
    @Size(max = 60)  private String language1Subject;
    @Min(0) @Max(200) private Integer language1Marks;
    @Size(max = 60)  private String language2Subject;
    @Min(0) @Max(200) private Integer language2Marks;

    // Core Subjects (each out of 200 for TN State Board)
    @Min(0) @Max(200) private Integer physicsMarks;
    @Min(0) @Max(200) private Integer chemistryMarks;
    @Min(0) @Max(200) private Integer mathematicsMarks;
    @Min(0) @Max(200) private Integer biologyMarks;
    @Min(0) @Max(200) private Integer computerScienceMarks;

    // Optional
    @Size(max = 60)  private String optionalSubject;
    @Min(0) @Max(200) private Integer optionalMarks;
}
