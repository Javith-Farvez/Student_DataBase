package com.vsb.erp.service;

import com.vsb.erp.dto.*;

import java.util.List;

public interface StudentMasterService {

    StudentMasterResponseDTO createStudent(StudentMasterRequestDTO requestDTO);

    StudentMasterResponseDTO updateStudent(Long id, StudentMasterRequestDTO requestDTO);

    void deleteStudent(Long id);

    StudentMasterResponseDTO getStudentById(Long id);

    StudentMasterResponseDTO getStudentByRegisterNumber(String registerNumber);

    PageResponseDTO<StudentMasterResponseDTO> getAllStudents(StudentSearchCriteriaDTO criteria, int page, int size);

    List<StudentMasterResponseDTO> exportStudentsList(StudentSearchCriteriaDTO criteria);

    String uploadPhoto(Long id, String photoBase64OrUrl);
}
