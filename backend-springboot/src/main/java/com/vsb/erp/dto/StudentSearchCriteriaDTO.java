package com.vsb.erp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSearchCriteriaDTO {

    private String search;         // Search by Register No, Name, Roll No, Admission No
    private String department;     // Filter by Department Name
    private Integer year;          // Filter by Current Year (1, 2, 3, 4)
    private Integer semester;      // Filter by Current Semester (1 to 8)
    private String section;        // Filter by Section (A, B, C)
    private String community;      // Filter by Community (OC, BC, MBC, SC, ST)
    private String batch;          // Filter by Batch (e.g. 2021-2025)
    private String gender;         // Filter by Gender (Male, Female)
    private String residenceType;  // Filter by Residence Type (DAY_SCHOLAR, HOSTELLER)

    private String sortBy = "registerNumber"; // Sort by Register Number default
    private String sortDirection = "ASC";      // ASC or DESC
}
