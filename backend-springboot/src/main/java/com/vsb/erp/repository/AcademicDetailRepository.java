package com.vsb.erp.repository;

import com.vsb.erp.entity.AcademicDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Academic Details — filtered search + bulk-update operations.
 */
@Repository
public interface AcademicDetailRepository extends JpaRepository<AcademicDetail, Long> {

    // ─── Single-Record Lookups ────────────────────────────────────────────────
    Optional<AcademicDetail> findByStudentId(Long studentId);
    Optional<AcademicDetail> findByRegisterNumber(String registerNumber);
    boolean existsByStudentId(Long studentId);
    boolean existsByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumberAndIdNot(String registerNumber, Long id);

    // ─── Filtered Paginated List ──────────────────────────────────────────────
    /**
     * Dynamic multi-filter query for the Academic list view.
     * All params are optional (null = ignored).
     */
    @Query("""
        SELECT a FROM AcademicDetail a
        JOIN a.student s
        WHERE (:search      IS NULL
               OR LOWER(s.fullName)      LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.registerNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.rollNumber)    LIKE LOWER(CONCAT('%', :search, '%')))
        AND   (:department  IS NULL OR a.departmentName   = :department)
        AND   (:batch       IS NULL OR a.batch            = :batch)
        AND   (:year        IS NULL OR a.currentYear      = :year)
        AND   (:semester    IS NULL OR a.currentSemester  = :semester)
        AND   (:section     IS NULL OR a.sectionName      = :section)
        AND   (:status      IS NULL OR a.academicStatus   = :status)
        """)
    Page<AcademicDetail> findAllWithFilters(
            @Param("search")     String search,
            @Param("department") String department,
            @Param("batch")      String batch,
            @Param("year")       Integer year,
            @Param("semester")   Integer semester,
            @Param("section")    String section,
            @Param("status")     String status,
            Pageable pageable
    );

    // ─── Bulk Auto-Update Candidates ─────────────────────────────────────────
    /** Fetch all ACTIVE records that have auto-update enabled. */
    @Query("""
        SELECT a FROM AcademicDetail a
        WHERE a.yearSemesterAuto = true
          AND a.academicStatus   = 'ACTIVE'
        """)
    List<AcademicDetail> findAllAutoUpdateEligible();

    // ─── Bulk Sync Back to Students Table ────────────────────────────────────
    @Modifying
    @Query("""
        UPDATE Student s SET
          s.currentYear      = :year,
          s.currentSemester  = :semester
        WHERE s.id = :studentId
        """)
    void syncYearSemToStudent(
            @Param("studentId") Long studentId,
            @Param("year")      int year,
            @Param("semester")  int semester
    );

    // ─── Dropdown / Stats Helpers ─────────────────────────────────────────────
    @Query("SELECT DISTINCT a.departmentName FROM AcademicDetail a ORDER BY a.departmentName")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT a.batch FROM AcademicDetail a ORDER BY a.batch DESC")
    List<String> findDistinctBatches();

    @Query("SELECT DISTINCT a.sectionName FROM AcademicDetail a WHERE a.departmentName = :dept ORDER BY a.sectionName")
    List<String> findSectionsByDepartment(@Param("dept") String department);

    // ─── Dashboard Statistics ─────────────────────────────────────────────────
    @Query("""
        SELECT a.departmentName, COUNT(a)
        FROM AcademicDetail a
        WHERE a.academicStatus = 'ACTIVE'
        GROUP BY a.departmentName
        ORDER BY a.departmentName
        """)
    List<Object[]> countByDepartment();

    @Query("""
        SELECT a.currentYear, COUNT(a)
        FROM AcademicDetail a
        WHERE a.academicStatus = 'ACTIVE'
        GROUP BY a.currentYear
        ORDER BY a.currentYear
        """)
    List<Object[]> countByYear();

    @Query("""
        SELECT a.batch, COUNT(a)
        FROM AcademicDetail a
        WHERE a.academicStatus = 'ACTIVE'
        GROUP BY a.batch
        ORDER BY a.batch DESC
        """)
    List<Object[]> countByBatch();
}
