package com.vsb.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * HSC Detail Entity — 12th Standard academic record per student.
 * Cutoff is auto-computed from Physics, Chemistry and Maths/Bio/CS marks.
 */
@Entity
@Table(
    name = "hsc_details",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_hsc_student_id", columnNames = "student_id"),
        @UniqueConstraint(name = "uk_hsc_register",   columnNames = "register_number")
    },
    indexes = {
        @Index(name = "idx_hsc_board",  columnList = "board"),
        @Index(name = "idx_hsc_year",   columnList = "passing_year"),
        @Index(name = "idx_hsc_group",  columnList = "group_name")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class HscDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Relationship ─────────────────────────────────────────────────────────
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "register_number", nullable = false, length = 30)
    private String registerNumber;

    // ─── School Info ──────────────────────────────────────────────────────────
    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "board", length = 60)
    private String board;

    @Column(name = "passing_year")
    private Integer passingYear;

    @Column(name = "exam_register_number", length = 40)
    private String examRegisterNumber;

    @Column(name = "group_name", length = 60)
    private String groupName;           // Bio-Maths, CS-Maths, Commerce, Arts

    // ─── Marks Summary ────────────────────────────────────────────────────────
    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "max_marks")
    @Builder.Default
    private Integer maxMarks = 600;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    /**
     * TN Engineering Cutoff = (Physics/2) + (Chemistry/4) + (Maths or Bio or CS)/4
     * Each subject out of 200, cutoff out of 200.
     */
    @Column(name = "cutoff", precision = 6, scale = 2)
    private BigDecimal cutoff;

    @Column(name = "grade", length = 5)
    private String grade;

    @Column(name = "result", length = 10)
    @Builder.Default
    private String result = "PASS";

    // ─── Subject-Wise Marks ───────────────────────────────────────────────────
    @Column(name = "language1_subject", length = 60)
    @Builder.Default
    private String language1Subject = "Tamil";

    @Column(name = "language1_marks")
    private Integer language1Marks;

    @Column(name = "language2_subject", length = 60)
    @Builder.Default
    private String language2Subject = "English";

    @Column(name = "language2_marks")
    private Integer language2Marks;

    @Column(name = "physics_marks")
    private Integer physicsMarks;

    @Column(name = "chemistry_marks")
    private Integer chemistryMarks;

    @Column(name = "mathematics_marks")
    private Integer mathematicsMarks;

    @Column(name = "biology_marks")
    private Integer biologyMarks;       // Biology/Botany+Zoology group

    @Column(name = "computer_science_marks")
    private Integer computerScienceMarks;

    @Column(name = "optional_subject", length = 60)
    private String optionalSubject;

    @Column(name = "optional_marks")
    private Integer optionalMarks;

    // ─── Metadata ─────────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
