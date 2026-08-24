package com.vsb.erp.service;

import com.vsb.erp.dto.AcademicDetailsDTO;
import com.vsb.erp.dto.AcademicPromotionDTO;

import java.util.List;

public interface AcademicDetailsService {

    AcademicDetailsDTO getAcademicDetailsByStudentId(Long studentId);

    AcademicDetailsDTO createOrUpdateAcademicDetails(Long studentId, AcademicDetailsDTO dto);

    AcademicDetailsDTO autoPromoteStudent(Long studentId);

    AcademicPromotionDTO autoPromoteBatch(AcademicPromotionDTO promotionRequest);

    List<AcademicDetailsDTO> filterAcademicRecords(String department, Integer year, Integer semester, String section, String batch);
}
