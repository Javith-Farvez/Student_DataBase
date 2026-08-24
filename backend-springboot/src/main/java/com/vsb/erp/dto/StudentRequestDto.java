package com.vsb.erp.dto;

import com.vsb.erp.enums.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Request DTO for creating or updating a student.
 * All Bean Validation annotations are applied here.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequestDto {

    // ─── Personal Details ─────────────────────────────────────────────────────
    @NotBlank(message = "Register number is required")
    @Size(max = 30, message = "Register number must be ≤ 30 characters")
    private String registerNumber;

    @Size(max = 30, message = "University register number must be ≤ 30 characters")
    private String universityRegNo;

    @NotBlank(message = "Admission number is required")
    @Size(max = 30)
    private String admissionNumber;

    @NotBlank(message = "Roll number is required")
    @Size(max = 30)
    private String rollNumber;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Name must be ≤ 100 characters")
    private String fullName;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private BloodGroup bloodGroup;

    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    private String aadhaarNumber;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    private String mobileNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 100)
    private String email;

    // ─── Parent Details ───────────────────────────────────────────────────────
    @Size(max = 100)
    private String fatherName;

    @Size(max = 100)
    private String fatherOccupation;

    @Pattern(regexp = "^[6-9]\\d{9}$|^$", message = "Enter a valid mobile number or leave blank")
    private String fatherMobile;

    @Size(max = 100)
    private String motherName;

    @Size(max = 100)
    private String motherOccupation;

    @Pattern(regexp = "^[6-9]\\d{9}$|^$", message = "Enter a valid mobile number or leave blank")
    private String motherMobile;

    @Size(max = 100)
    private String guardianName;

    @Pattern(regexp = "^[6-9]\\d{9}$|^$", message = "Enter a valid mobile number or leave blank")
    private String guardianMobile;

    // ─── Address Details ──────────────────────────────────────────────────────
    private String currentAddress;
    private String permanentAddress;

    @Size(max = 60)
    private String district;

    @Size(max = 60)
    private String state;

    @Pattern(regexp = "^\\d{6}$|^$", message = "Pincode must be 6 digits")
    private String pincode;

    // ─── Community Details ────────────────────────────────────────────────────
    @Size(max = 50)
    private String religion;

    private Community community;

    @Size(max = 60)
    private String caste;

    @Size(max = 60)
    private String subCaste;

    @Size(max = 50)
    private String nationality;

    @Size(max = 60)
    private String nativeDistrict;

    private Boolean firstGraduate;

    // ─── Academic Details ─────────────────────────────────────────────────────
    @NotBlank(message = "Department is required")
    @Size(max = 150)
    private String departmentName;

    @Size(max = 50)
    private String degree;

    @NotBlank(message = "Batch is required")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Batch must be in YYYY-YYYY format")
    private String batch;

    @NotNull(message = "Admission year is required")
    @Min(value = 2000, message = "Admission year must be >= 2000")
    @Max(value = 2100, message = "Admission year must be realistic")
    private Integer admissionYear;

    @Size(max = 20)
    private String regulation;

    @NotNull(message = "Current year is required")
    @Min(1) @Max(5)
    private Integer currentYear;

    @NotNull(message = "Current semester is required")
    @Min(1) @Max(10)
    private Integer currentSemester;

    @NotBlank(message = "Section is required")
    @Size(max = 10)
    private String sectionName;

    @Size(max = 100)
    private String mentorName;

    @Size(max = 100)
    private String classAdvisor;

    private StudentStatus studentStatus;

    // ─── Transport & Accommodation ────────────────────────────────────────────
    private ResidenceType residenceType;

    @Size(max = 100)
    private String busRoute;

    @Size(max = 100)
    private String boardingPoint;

    @Size(max = 50)
    private String hostelBlock;

    @Size(max = 20)
    private String roomNumber;

    // ─── Emergency Contact ────────────────────────────────────────────────────
    @Size(max = 100)
    private String emergencyContactName;

    @Size(max = 50)
    private String emergencyContactRelation;

    @Pattern(regexp = "^[6-9]\\d{9}$|^$", message = "Enter a valid mobile number or leave blank")
    private String emergencyContactMobile;
}
