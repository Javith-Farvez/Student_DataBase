package com.vsb.erp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for creating/updating SSLC (10th) details.
 */
@Data
public class SslcDetailRequestDto {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    // School Info
    @Size(max = 200) private String schoolName;
    @Size(max = 60)  private String board;
    @Min(1990) @Max(2100) private Integer passingYear;
    @Size(max = 40)  private String examRegisterNumber;

    // Marks Summary
    @Min(0) @Max(600) private Integer totalMarks;
    @Min(0) @Max(600) private Integer maxMarks;
    @DecimalMin("0.0") @DecimalMax("100.0") private BigDecimal percentage;
    @Size(max = 5)   private String grade;
    @Pattern(regexp = "PASS|FAIL") private String result;

    // Subject-Wise Marks (each out of 100 for State Board)
    @Min(0) @Max(200) private Integer tamilMarks;
    @Min(0) @Max(200) private Integer englishMarks;
    @Min(0) @Max(200) private Integer mathematicsMarks;
    @Min(0) @Max(200) private Integer scienceMarks;
    @Min(0) @Max(200) private Integer socialScienceMarks;
    @Size(max = 60)  private String language3Subject;
    @Min(0) @Max(200) private Integer language3Marks;
}
