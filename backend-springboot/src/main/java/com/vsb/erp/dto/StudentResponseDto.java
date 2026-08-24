package com.vsb.erp.dto;

import com.vsb.erp.enums.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Full student profile response DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponseDto {

    private Long id;

    // Personal
    private String registerNumber;
    private String universityRegNo;
    private String admissionNumber;
    private String rollNumber;
    private String fullName;
    private String photoUrl;
    private Gender gender;
    private LocalDate dateOfBirth;
    private BloodGroup bloodGroup;
    private String aadhaarNumber;
    private String mobileNumber;
    private String email;

    // Parent
    private String fatherName;
    private String fatherOccupation;
    private String fatherMobile;
    private String motherName;
    private String motherOccupation;
    private String motherMobile;
    private String guardianName;
    private String guardianMobile;

    // Address
    private String currentAddress;
    private String permanentAddress;
    private String district;
    private String state;
    private String pincode;

    // Community
    private String religion;
    private Community community;
    private String caste;
    private String subCaste;
    private String nationality;
    private String nativeDistrict;
    private Boolean firstGraduate;

    // Academic
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
    private StudentStatus studentStatus;

    // Transport
    private ResidenceType residenceType;
    private String busRoute;
    private String boardingPoint;
    private String hostelBlock;
    private String roomNumber;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactRelation;
    private String emergencyContactMobile;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
