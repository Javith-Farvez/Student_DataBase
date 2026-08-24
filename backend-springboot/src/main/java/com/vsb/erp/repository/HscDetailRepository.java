package com.vsb.erp.repository;

import com.vsb.erp.entity.HscDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HscDetailRepository extends JpaRepository<HscDetail, Long> {

    Optional<HscDetail> findByStudentId(Long studentId);
    Optional<HscDetail> findByRegisterNumber(String registerNumber);
    boolean existsByStudentId(Long studentId);
    boolean existsByRegisterNumberAndIdNot(String registerNumber, Long id);

    @Query("""
        SELECT h FROM HscDetail h
        JOIN h.student st
        WHERE (:search  IS NULL OR LOWER(st.fullName) LIKE LOWER(CONCAT('%',:search,'%'))
                               OR LOWER(h.registerNumber) LIKE LOWER(CONCAT('%',:search,'%')))
        AND   (:board   IS NULL OR h.board = :board)
        AND   (:year    IS NULL OR h.passingYear = :year)
        AND   (:dept    IS NULL OR st.departmentName = :dept)
        AND   (:grp     IS NULL OR h.groupName = :grp)
        AND   (:result  IS NULL OR h.result = :result)
        """)
    Page<HscDetail> findAllWithFilters(
            @Param("search") String search,
            @Param("board")  String board,
            @Param("year")   Integer year,
            @Param("dept")   String department,
            @Param("grp")    String groupName,
            @Param("result") String result,
            Pageable pageable
    );

    // ─── Report Aggregations ──────────────────────────────────────────────────
    @Query("SELECT h.board, COUNT(h), AVG(h.percentage), AVG(h.cutoff) FROM HscDetail h GROUP BY h.board ORDER BY h.board")
    List<Object[]> reportByBoard();

    @Query("SELECT h.passingYear, COUNT(h), AVG(h.percentage), AVG(h.cutoff) FROM HscDetail h GROUP BY h.passingYear ORDER BY h.passingYear DESC")
    List<Object[]> reportByYear();

    @Query("SELECT h.groupName, COUNT(h), AVG(h.percentage), AVG(h.cutoff) FROM HscDetail h GROUP BY h.groupName ORDER BY h.groupName")
    List<Object[]> reportByGroup();

    @Query("SELECT h.result, COUNT(h) FROM HscDetail h GROUP BY h.result")
    List<Object[]> reportByResult();

    @Query("SELECT st.departmentName, COUNT(h), AVG(h.cutoff) FROM HscDetail h JOIN h.student st GROUP BY st.departmentName ORDER BY st.departmentName")
    List<Object[]> reportByDepartment();

    @Query("SELECT h.grade, COUNT(h) FROM HscDetail h WHERE h.grade IS NOT NULL GROUP BY h.grade ORDER BY h.grade")
    List<Object[]> reportByGrade();

    @Query("SELECT DISTINCT h.board FROM HscDetail h WHERE h.board IS NOT NULL ORDER BY h.board")
    List<String> findDistinctBoards();

    @Query("SELECT DISTINCT h.groupName FROM HscDetail h WHERE h.groupName IS NOT NULL ORDER BY h.groupName")
    List<String> findDistinctGroups();
}
