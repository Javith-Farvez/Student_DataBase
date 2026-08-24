package com.vsb.erp.repository;

import com.vsb.erp.entity.Student;
import com.vsb.erp.enums.Community;
import com.vsb.erp.enums.Gender;
import com.vsb.erp.enums.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Student Repository — provides CRUD + filtered search with pagination.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // ─── Existence Checks ────────────────────────────────────────────────────
    boolean existsByRegisterNumber(String registerNumber);
    boolean existsByAdmissionNumber(String admissionNumber);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByEmail(String email);
    boolean existsByAadhaarNumber(String aadhaarNumber);
    boolean existsByUniversityRegNo(String universityRegNo);

    // Existence checks excluding self (for update)
    boolean existsByRegisterNumberAndIdNot(String registerNumber, Long id);
    boolean existsByAdmissionNumberAndIdNot(String admissionNumber, Long id);
    boolean existsByRollNumberAndIdNot(String rollNumber, Long id);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByAadhaarNumberAndIdNot(String aadhaarNumber, Long id);

    // ─── Finders ─────────────────────────────────────────────────────────────
    Optional<Student> findByRegisterNumber(String registerNumber);
    Optional<Student> findByEmail(String email);
    Optional<Student> findByAadhaarNumber(String aadhaarNumber);

    // ─── Filtered Search with Pagination ─────────────────────────────────────
    /**
     * Dynamic multi-filter search. All parameters are optional (null = ignored).
     * Search term matches against name, register number, roll number, or email.
     */
    @Query("""
        SELECT s FROM Student s
        WHERE (:search     IS NULL OR LOWER(s.fullName)       LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(s.registerNumber)  LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(s.rollNumber)      LIKE LOWER(CONCAT('%', :search, '%'))
                                  OR LOWER(s.email)           LIKE LOWER(CONCAT('%', :search, '%')))
        AND   (:department IS NULL OR s.departmentName = :department)
        AND   (:year       IS NULL OR s.currentYear = :year)
        AND   (:semester   IS NULL OR s.currentSemester = :semester)
        AND   (:section    IS NULL OR s.sectionName = :section)
        AND   (:community  IS NULL OR s.community = :community)
        AND   (:batch      IS NULL OR s.batch = :batch)
        AND   (:gender     IS NULL OR s.gender = :gender)
        AND   (:status     IS NULL OR s.studentStatus = :status)
        """)
    Page<Student> findAllWithFilters(
            @Param("search")     String search,
            @Param("department") String department,
            @Param("year")       Integer year,
            @Param("semester")   Integer semester,
            @Param("section")    String section,
            @Param("community")  Community community,
            @Param("batch")      String batch,
            @Param("gender")     Gender gender,
            @Param("status")     StudentStatus status,
            Pageable pageable
    );

    // ─── Distinct Dropdown Values ─────────────────────────────────────────────
    @Query("SELECT DISTINCT s.departmentName FROM Student s ORDER BY s.departmentName")
    java.util.List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT s.batch FROM Student s ORDER BY s.batch DESC")
    java.util.List<String> findDistinctBatches();

    @Query("SELECT DISTINCT s.sectionName FROM Student s WHERE s.departmentName = :dept ORDER BY s.sectionName")
    java.util.List<String> findDistinctSectionsByDepartment(@Param("dept") String department);
}
