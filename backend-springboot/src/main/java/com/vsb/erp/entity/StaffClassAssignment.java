package com.vsb.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_class_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffClassAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "section_name", nullable = false, length = 10)
    private String sectionName;

    @Column(name = "academic_batch", length = 20)
    private String academicBatch;

    @Column(name = "is_class_advisor", nullable = false)
    private Boolean isClassAdvisor = false;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Active";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
