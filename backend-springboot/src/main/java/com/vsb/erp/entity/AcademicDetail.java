package com.vsb.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Academic Detail Entity — VSB Engineering College ERP
 * <p>
 * Maintains a dedicated academic record per student, linked via OneToOne FK.
 * Supports auto-computation of current Year and Semester based on admission year
 * and the academic calendar (Aug = odd sem, Feb = even sem).
 * </p>
 */
@Entity
@Table(
    name = "academic_details",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_ad_student_id",      columnNames = "student_id"),
        @UniqueConstraint(name = "uk_ad_register_number", columnNames = "register_number")
    },
    indexes = {
        @Index(name = "idx_ad_dept_batch",  columnList = "department_name, batch"),
        @Index(name = "idx_ad_year_sem",    columnList = "current_year, current_semester"),
        @Index(name = "idx_ad_section",     columnList = "section_name"),
        @Index(name = "idx_ad_status",      columnList = "academic_status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Relationship ─────────────────────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    // ─── Denormalized Quick-Access ────────────────────────────────────────────
    /** Copied from Student — avoids joins in list queries */
    @Column(name = "register_number", nullable = false, length = 30)
    private String registerNumber;

    @Column(name = "university_reg_no", length = 30)
    private String universityRegNo;

    // ─── Academic Fields ──────────────────────────────────────────────────────
    @Column(name = "department_name", nullable = false, length = 150)
    private String departmentName;

    @Column(name = "degree", length = 50)
    private String degree;

    @Column(name = "batch", nullable = false, length = 20)
    private String batch;

    @Column(name = "admission_year", nullable = false)
    private Integer admissionYear;

    @Column(name = "regulation", length = 20)
    private String regulation;

    @Column(name = "current_year", nullable = false)
    private Integer currentYear;

    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @Column(name = "section_name", nullable = false, length = 10)
    private String sectionName;

    @Column(name = "mentor_name", length = 100)
    private String mentorName;

    @Column(name = "class_advisor", length = 100)
    private String classAdvisor;

    // ─── Auto-Update Control ─────────────────────────────────────────────────
    /**
     * When true, Year and Semester are automatically recalculated
     * by the scheduler on 1 Aug and 1 Feb each year.
     */
    @Column(name = "year_semester_auto")
    @Builder.Default
    private Boolean yearSemesterAuto = true;

    @Column(name = "last_auto_updated")
    private LocalDateTime lastAutoUpdated;

    // ─── Status & Notes ───────────────────────────────────────────────────────
    @Column(name = "academic_status", length = 20)
    @Builder.Default
    private String academicStatus = "ACTIVE";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ─── Metadata ─────────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
