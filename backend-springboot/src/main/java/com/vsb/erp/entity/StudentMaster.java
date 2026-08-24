package com.vsb.erp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_reg_no", columnList = "register_number", unique = true),
        @Index(name = "idx_dept_year_sec", columnList = "department_name, current_year, section_name"),
        @Index(name = "idx_community", columnList = "community"),
        @Index(name = "idx_batch", columnList = "batch")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Details
    @NotBlank(message = "Register Number is required")
    @Column(name = "register_number", nullable = false, unique = true, length = 30)
    private String registerNumber;

    @Column(name = "university_reg_no", unique = true, length = 30)
    private String universityRegNo;

    @NotBlank(message = "Admission Number is required")
    @Column(name = "admission_number", nullable = false, unique = true, length = 30)
    private String admissionNumber;

    @NotBlank(message = "Roll Number is required")
    @Column(name = "roll_number", nullable = false, unique = true, length = 30)
    private String rollNumber;

    @NotBlank(message = "Student Name is required")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Lob
    @Column(name = "photo_url", columnDefinition = "LONGTEXT")
    private String photoUrl;

    @NotBlank(message = "Gender is required")
    @Column(name = "gender", nullable = false, length = 15)
    private String gender;

    @NotNull(message = "Date of Birth is required")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "aadhaar_number", unique = true, length = 20)
    private String aadhaarNumber;

    @Column(name = "pan_number", unique = true, length = 20)
    private String panNumber;

    @NotBlank(message = "Mobile Number is required")
    @Column(name = "mobile_number", nullable = false, length = 20)
    private String mobileNumber;

    @Email(message = "Invalid Email Address")
    @NotBlank(message = "Email is required")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // Parent Details
    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "father_occupation", length = 100)
    private String fatherOccupation;

    @Column(name = "father_mobile", length = 20)
    private String fatherMobile;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "mother_occupation", length = 100)
    private String motherOccupation;

    @Column(name = "mother_mobile", length = 20)
    private String motherMobile;

    @Column(name = "guardian_name", length = 100)
    private String guardianName;

    @Column(name = "guardian_mobile", length = 20)
    private String guardianMobile;

    // Address & Community Details
    @Column(name = "current_address", columnDefinition = "TEXT")
    private String currentAddress;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(name = "native_district", length = 50)
    private String nativeDistrict;

    @Column(name = "native_state", length = 50)
    private String nativeState;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "religion", length = 50)
    private String religion;

    @Column(name = "community", length = 20)
    private String community;

    @Column(name = "caste", length = 50)
    private String caste;

    @Column(name = "sub_caste", length = 50)
    private String subCaste;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "first_graduate")
    private Boolean firstGraduate;

    // Academic Details
    @NotBlank(message = "Department Name is required")
    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "degree", length = 50)
    private String degree;

    @NotBlank(message = "Batch is required")
    @Column(name = "batch", nullable = false, length = 20)
    private String batch;

    @NotNull(message = "Admission Year is required")
    @Column(name = "admission_year", nullable = false)
    private Integer admissionYear;

    @Column(name = "regulation", length = 20)
    private String regulation;

    @NotNull(message = "Current Year is required")
    @Column(name = "current_year", nullable = false)
    private Integer currentYear;

    @NotNull(message = "Current Semester is required")
    @Column(name = "current_semester", nullable = false)
    private Integer currentSemester;

    @NotBlank(message = "Section Name is required")
    @Column(name = "section_name", nullable = false, length = 10)
    private String sectionName;

    @Column(name = "mentor_name", length = 100)
    private String mentorName;

    @Column(name = "class_advisor", length = 100)
    private String classAdvisor;

    @Column(name = "student_status", length = 20)
    private String studentStatus;

    // Transport Details
    @Column(name = "residence_type", length = 20)
    private String residenceType; // DAY_SCHOLAR, HOSTELLER

    @Column(name = "bus_route", length = 50)
    private String busRoute;

    @Column(name = "boarding_point", length = 100)
    private String boardingPoint;

    @Column(name = "hostel_block", length = 50)
    private String hostelBlock;

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    // Emergency Contact
    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_relation", length = 50)
    private String emergencyContactRelation;

    @Column(name = "emergency_contact_mobile", length = 20)
    private String emergencyContactMobile;

    // Performance & Fee Indicators
    @Column(name = "cgpa", precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Column(name = "attendance_percentage", precision = 5, scale = 2)
    private BigDecimal attendancePercentage;

    @Column(name = "fee_balance", precision = 10, scale = 2)
    private BigDecimal feeBalance;

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
        if (this.studentStatus == null) this.studentStatus = "ACTIVE";
        if (this.residenceType == null) this.residenceType = "DAY_SCHOLAR";
        if (this.nationality == null) this.nationality = "Indian";
        if (this.nativeState == null) this.nativeState = "Tamil Nadu";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
