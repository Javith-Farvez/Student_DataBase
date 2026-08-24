package com.vsb.erp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "academic_details", indexes = {
        @Index(name = "idx_acad_dept_year", columnList = "department_name, current_year, current_semester, section_name"),
        @Index(name = "idx_acad_batch", columnList = "batch")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private StudentMaster student;

    @Column(name = "university_reg_no", unique = true, length = 30)
    private String universityRegNo;

    @NotNull(message = "Admission Year is required")
    @Column(name = "admission_year", nullable = false)
    private Integer admissionYear;

    @NotBlank(message = "Batch is required")
    @Column(name = "batch", nullable = false, length = 20)
    private String batch;

    @NotBlank(message = "Department Name is required")
    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @NotBlank(message = "Degree is required")
    @Column(name = "degree", nullable = false, length = 50)
    private String degree;

    @NotBlank(message = "Regulation is required")
    @Column(name = "regulation", nullable = false, length = 20)
    private String regulation;

    @NotNull(message = "Current Year is required")
    @Min(value = 1, message = "Min year 1")
    @Max(value = 4, message = "Max year 4")
    @Column(name = "current_year", nullable = false)
    private Integer currentYear;

    @NotNull(message = "Current Semester is required")
    @Min(value = 1, message = "Min semester 1")
    @Max(value = 8, message = "Max semester 8")
    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @NotBlank(message = "Section Name is required")
    @Column(name = "section_name", nullable = false, length = 10)
    private String sectionName;

    @Column(name = "mentor_name", length = 100)
    private String mentorName;

    @Column(name = "class_advisor", length = 100)
    private String classAdvisor;

    @Column(name = "academic_status", length = 20)
    private String academicStatus;

    @Column(name = "last_promotion_date")
    private LocalDateTime lastPromotionDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.degree == null) this.degree = "B.E.";
        if (this.regulation == null) this.regulation = "2021";
        if (this.academicStatus == null) this.academicStatus = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
