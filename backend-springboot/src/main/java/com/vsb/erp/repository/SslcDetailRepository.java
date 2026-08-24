package com.vsb.erp.repository;

import com.vsb.erp.entity.SslcDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SslcDetailRepository extends JpaRepository<SslcDetail, Long> {

    Optional<SslcDetail> findByStudentId(Long studentId);
    Optional<SslcDetail> findByRegisterNumber(String registerNumber);
    boolean existsByStudentId(Long studentId);
    boolean existsByRegisterNumberAndIdNot(String registerNumber, Long id);

    @Query("""
        SELECT s FROM SslcDetail s
        JOIN s.student st
        WHERE (:search  IS NULL OR LOWER(st.fullName) LIKE LOWER(CONCAT('%',:search,'%'))
                               OR LOWER(s.registerNumber) LIKE LOWER(CONCAT('%',:search,'%')))
        AND   (:board   IS NULL OR s.board = :board)
        AND   (:year    IS NULL OR s.passingYear = :year)
        AND   (:dept    IS NULL OR st.departmentName = :dept)
        AND   (:result  IS NULL OR s.result = :result)
        """)
    Page<SslcDetail> findAllWithFilters(
            @Param("search") String search,
            @Param("board")  String board,
            @Param("year")   Integer year,
            @Param("dept")   String department,
            @Param("result") String result,
            Pageable pageable
    );

    // ─── Report Aggregations ──────────────────────────────────────────────────
    @Query("SELECT s.board, COUNT(s), AVG(s.percentage) FROM SslcDetail s GROUP BY s.board ORDER BY s.board")
    List<Object[]> reportByBoard();

    @Query("SELECT s.passingYear, COUNT(s), AVG(s.percentage) FROM SslcDetail s GROUP BY s.passingYear ORDER BY s.passingYear DESC")
    List<Object[]> reportByYear();

    @Query("SELECT s.result, COUNT(s) FROM SslcDetail s GROUP BY s.result")
    List<Object[]> reportByResult();

    @Query("SELECT st.departmentName, COUNT(s), AVG(s.percentage) FROM SslcDetail s JOIN s.student st GROUP BY st.departmentName ORDER BY st.departmentName")
    List<Object[]> reportByDepartment();

    @Query("SELECT s.grade, COUNT(s) FROM SslcDetail s WHERE s.grade IS NOT NULL GROUP BY s.grade ORDER BY s.grade")
    List<Object[]> reportByGrade();

    @Query("SELECT DISTINCT s.board FROM SslcDetail s WHERE s.board IS NOT NULL ORDER BY s.board")
    List<String> findDistinctBoards();
}
