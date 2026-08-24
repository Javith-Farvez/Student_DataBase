package com.vsb.erp.repository;

import com.vsb.erp.entity.StudentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentMasterRepository extends JpaRepository<StudentMaster, Long>, JpaSpecificationExecutor<StudentMaster> {

    Optional<StudentMaster> findByRegisterNumber(String registerNumber);

    Optional<StudentMaster> findByRollNumber(String rollNumber);

    Optional<StudentMaster> findByAdmissionNumber(String admissionNumber);

    boolean existsByRegisterNumber(String registerNumber);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByAdmissionNumber(String admissionNumber);

    boolean existsByUniversityRegNo(String universityRegNo);

    boolean existsByEmail(String email);

    boolean existsByAadhaarNumber(String aadhaarNumber);
}
