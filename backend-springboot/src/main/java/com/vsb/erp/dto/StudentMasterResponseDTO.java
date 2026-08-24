package com.vsb.erp.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentMasterResponseDTO {

    private Long id;

    // Personal Details
    private String registerNumber;
    private String universityRegNo;
    private String admissionNumber;
    private String rollNumber;
    private String fullName;
    private String photoUrl;
    private String gender;
    private LocalDate dateOfBirth;
    private String bloodGroup;
    private String aadhaarNumber;
    private String panNumber;
    private String mobileNumber;
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
    private String departmentName;
    private String degree;
    private String batch;
    private Integer admissionYear;
    private String regulation;
    private Integer currentYear;
    private Integer currentSemester;
    private String sectionName;
    private String mentorName;
    private String classAdvisor;
    private String studentStatus;

    // Transport Details
    private String residenceType;
    private String busRoute;
    private String boardingPoint;
    private String hostelBlock;
    private String roomNumber;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactMobile;

    // Academic Indicators
    private BigDecimal cgpa;
    private BigDecimal attendancePercentage;
    private BigDecimal feeBalance;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
