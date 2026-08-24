package com.vsb.erp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicPromotionDTO {

    private String departmentName;
    private Integer fromYear;
    private Integer fromSemester;
    private String batch;
    private String sectionName;
    
    private int promotedCount;
    private String message;
}
