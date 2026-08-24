package com.vsb.erp.dto;

import com.vsb.erp.enums.*;
import lombok.*;

/**
 * Lightweight student summary used in paginated list views.
 * Does NOT include photo or long text fields to keep response size small.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSummaryDto {
    private Long id;
    private String registerNumber;
    private String rollNumber;
    private String fullName;
    private String photoUrl;        // thumbnail base64 or URL
    private Gender gender;
    private String departmentName;
    private String batch;
    private Integer currentYear;
    private Integer currentSemester;
    private String sectionName;
    private StudentStatus studentStatus;
    private ResidenceType residenceType;
    private Community community;
    private String mobileNumber;
    private String email;
}
