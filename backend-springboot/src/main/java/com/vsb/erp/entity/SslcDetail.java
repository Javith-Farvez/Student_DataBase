package com.vsb.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SSLC Detail Entity — 10th Standard academic record per student.
 * Linked to Student Master via OneToOne FK.
 */
@Entity
@Table(
    name = "sslc_details",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_sslc_student_id", columnNames = "student_id"),
        @UniqueConstraint(name = "uk_sslc_register",   columnNames = "register_number")
    },
    indexes = {
        @Index(name = "idx_sslc_board", columnList = "board"),
        @Index(name = "idx_sslc_year",  columnList = "passing_year")
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SslcDetail {

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
    private String board;              // TN State Board, CBSE, ICSE, NIOS

    @Column(name = "passing_year")
    private Integer passingYear;

    @Column(name = "exam_register_number", length = 40)
    private String examRegisterNumber; // Board exam hall-ticket / register number

    // ─── Marks Summary ────────────────────────────────────────────────────────
    @Column(name = "total_marks")
    private Integer totalMarks;

    @Column(name = "max_marks")
    @Builder.Default
    private Integer maxMarks = 600;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "grade", length = 5)
    private String grade;

    @Column(name = "result", length = 10)
    @Builder.Default
    private String result = "PASS";

    // ─── Subject-Wise Marks ───────────────────────────────────────────────────
    @Column(name = "tamil_marks")
    private Integer tamilMarks;

    @Column(name = "english_marks")
    private Integer englishMarks;

    @Column(name = "mathematics_marks")
    private Integer mathematicsMarks;

    @Column(name = "science_marks")
    private Integer scienceMarks;

    @Column(name = "social_science_marks")
    private Integer socialScienceMarks;

    @Column(name = "language3_subject", length = 60)
    private String language3Subject;   // 3rd language (Sanskrit, Hindi, French...)

    @Column(name = "language3_marks")
    private Integer language3Marks;

    // ─── Metadata ─────────────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
