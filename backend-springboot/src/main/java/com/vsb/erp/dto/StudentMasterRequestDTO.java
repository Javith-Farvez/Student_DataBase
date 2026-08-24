package com.vsb.erp.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMasterRequestDTO {

    // Personal Details
    @NotBlank(message = "Register Number is required")
    @Size(max = 30, message = "Register Number max 30 chars")
    private String registerNumber;

    private String universityRegNo;

    @NotBlank(message = "Admission Number is required")
    private String admissionNumber;

    @NotBlank(message = "Roll Number is required")
    private String rollNumber;

    @NotBlank(message = "Student Name is required")
    @Size(max = 100, message = "Student Name max 100 chars")
    private String fullName;

    private String photoUrl;

    @NotBlank(message = "Gender is required")
    private String gender;

    @NotNull(message = "Date of Birth is required")
    private LocalDate dateOfBirth;

    private String bloodGroup;
    private String aadhaarNumber;
    private String panNumber;

    @NotBlank(message = "Mobile Number is required")
    private String mobileNumber;

    @NotBlank(message = "Email Address is required")
    @Email(message = "Invalid Email Address format")
    private String email;

    // Parent Details
    private String fatherName;
    private String fatherOccupation;
    private String fatherMobile;
    private String motherName;
    private String motherOccupation;
    private String motherMobile;
    private String guardianName;
    private String guardianMobile;

    // Address Details
    private String currentAddress;
    private String permanentAddress;
    private String nativeDistrict;
    private String nativeState;
    private String pincode;

    // Community Details
    private String religion;
    private String community;
    private String caste;
    private String subCaste;
    private String nationality;
    private Boolean firstGraduate;

    // Academic Details
    @NotBlank(message = "Department Name is required")
    private String departmentName;

    private String degree;

    @NotBlank(message = "Batch is required")
    private String batch;

    @NotNull(message = "Admission Year is required")
    private Integer admissionYear;

    private String regulation;

    @NotNull(message = "Current Year is required")
    @Min(value = 1, message = "Current Year min 1")
    @Max(value = 4, message = "Current Year max 4")
    private Integer currentYear;

    @NotNull(message = "Current Semester is required")
    @Min(value = 1, message = "Current Semester min 1")
    @Max(value = 8, message = "Current Semester max 8")
    private Integer currentSemester;

    @NotBlank(message = "Section Name is required")
    private String sectionName;

    private String mentorName;
    private String classAdvisor;
    private String studentStatus;

    // Transport Details
    private String residenceType; // DAY_SCHOLAR, HOSTELLER
    private String busRoute;
    private String boardingPoint;
    private String hostelBlock;
    private String roomNumber;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactMobile;

    // Performance Indicators
    private BigDecimal cgpa;
    private BigDecimal attendancePercentage;
    private BigDecimal feeBalance;
}
