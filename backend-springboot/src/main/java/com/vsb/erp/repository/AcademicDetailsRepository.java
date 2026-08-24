package com.vsb.erp.repository;

import com.vsb.erp.entity.AcademicDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicDetailsRepository extends JpaRepository<AcademicDetails, Long> {

    Optional<AcademicDetails> findByStudentId(Long studentId);

    Optional<AcademicDetails> findByUniversityRegNo(String universityRegNo);

    List<AcademicDetails> findByDepartmentName(String departmentName);

    List<AcademicDetails> findByDepartmentNameAndCurrentYearAndCurrentSemester(
            String departmentName, Integer currentYear, Integer currentSemester);

    @Query("SELECT a FROM AcademicDetails a WHERE " +
           "(:department IS NULL OR LOWER(a.departmentName) = LOWER(:department)) AND " +
           "(:year IS NULL OR a.currentYear = :year) AND " +
           "(:semester IS NULL OR a.currentSemester = :semester) AND " +
           "(:section IS NULL OR LOWER(a.sectionName) = LOWER(:section)) AND " +
           "(:batch IS NULL OR a.batch = :batch)")
    List<AcademicDetails> filterAcademicRecords(
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("semester") Integer semester,
            @Param("section") String section,
            @Param("batch") String batch
    );
}
