package com.vsb.erp.entity;

import com.vsb.erp.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Student Master Entity — VSB Engineering College ERP
 * Maps all student profile fields across 7 sections.
 */
@Entity
@Table(
    name = "students",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_register_number",    columnNames = "register_number"),
        @UniqueConstraint(name = "uk_university_reg_no",  columnNames = "university_reg_no"),
        @UniqueConstraint(name = "uk_admission_number",   columnNames = "admission_number"),
        @UniqueConstraint(name = "uk_roll_number",        columnNames = "roll_number"),
        @UniqueConstraint(name = "uk_email",              columnNames = "email"),
        @UniqueConstraint(name = "uk_aadhaar",            columnNames = "aadhaar_number")
    },
    indexes = {
        @Index(name = "idx_dept_year_sec",  columnList = "department_name, current_year, section_name"),
        @Index(name = "idx_community",      columnList = "community"),
        @Index(name = "idx_batch",          columnList = "batch"),
        @Index(name = "idx_gender",         columnList = "gender"),
        @Index(name = "idx_status",         columnList = "student_status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Personal Details ────────────────────────────────────────────────────
    @Column(name = "register_number", nullable = false, length = 30)
    private String registerNumber;

    @Column(name = "university_reg_no", length = 30)
    private String universityRegNo;

    @Column(name = "admission_number", nullable = false, length = 30)
    private String admissionNumber;

    @Column(name = "roll_number", nullable = false, length = 30)
    private String rollNumber;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Lob
    @Column(name = "photo_url", columnDefinition = "LONGTEXT")
    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 10)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", length = 10)
    private BloodGroup bloodGroup;

    @Column(name = "aadhaar_number", length = 20)
    private String aadhaarNumber;

    @Column(name = "mobile_number", nullable = false, length = 15)
    private String mobileNumber;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    // ─── Parent Details ──────────────────────────────────────────────────────
    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "father_occupation", length = 100)
    private String fatherOccupation;

    @Column(name = "father_mobile", length = 15)
    private String fatherMobile;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "mother_occupation", length = 100)
    private String motherOccupation;

    @Column(name = "mother_mobile", length = 15)
    private String motherMobile;

    @Column(name = "guardian_name", length = 100)
    private String guardianName;

    @Column(name = "guardian_mobile", length = 15)
    private String guardianMobile;

    // ─── Address Details ─────────────────────────────────────────────────────
    @Column(name = "current_address", columnDefinition = "TEXT")
    private String currentAddress;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(name = "district", length = 60)
    private String district;

    @Column(name = "state", length = 60)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    // ─── Community Details ───────────────────────────────────────────────────
    @Column(name = "religion", length = 50)
    private String religion;

    @Enumerated(EnumType.STRING)
    @Column(name = "community", length = 10)
    private Community community;

    @Column(name = "caste", length = 60)
    private String caste;

    @Column(name = "sub_caste", length = 60)
    private String subCaste;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "native_district", length = 60)
    private String nativeDistrict;

    @Column(name = "first_graduate")
    private Boolean firstGraduate;

    // ─── Academic Details ────────────────────────────────────────────────────
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

    @Enumerated(EnumType.STRING)
    @Column(name = "student_status", length = 20)
    @Builder.Default
    private StudentStatus studentStatus = StudentStatus.ACTIVE;

    // ─── Transport & Accommodation ───────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "residence_type", length = 20)
    @Builder.Default
    private ResidenceType residenceType = ResidenceType.DAY_SCHOLAR;

    @Column(name = "bus_route", length = 100)
    private String busRoute;

    @Column(name = "boarding_point", length = 100)
    private String boardingPoint;

    @Column(name = "hostel_block", length = 50)
    private String hostelBlock;

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    // ─── Emergency Contact ───────────────────────────────────────────────────
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_mobile", length = 15)
    private String emergencyContactMobile;

    // ─── System Metadata ─────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
