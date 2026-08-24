package com.vsb.erp.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicDetailsDTO {

    private Long id;
    private Long studentId;
    private String registerNumber;
    private String studentName;

    private String universityRegNo;

    @NotNull(message = "Admission Year is required")
    private Integer admissionYear;

    @NotBlank(message = "Batch is required")
    private String batch;

    @NotBlank(message = "Department Name is required")
    private String departmentName;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotBlank(message = "Regulation is required")
    private String regulation;

    @NotNull(message = "Current Year is required")
    @Min(value = 1) @Max(value = 4)
    private Integer currentYear;

    @NotNull(message = "Current Semester is required")
    @Min(value = 1) @Max(value = 8)
    private Integer currentSemester;

    @NotBlank(message = "Section Name is required")
    private String sectionName;

    private String mentorName;
    private String classAdvisor;
    private String academicStatus;
    private LocalDateTime lastPromotionDate;
}
