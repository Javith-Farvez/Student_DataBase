package com.vsb.erp.service;

import com.vsb.erp.dto.*;
import com.vsb.erp.entity.*;
import com.vsb.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * SSLC & HSC Academic Service — VSB Engineering College ERP
 * Handles CRUD for both 10th and 12th details, cutoff auto-computation,
 * and report aggregations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SslcHscService {

    private final SslcDetailRepository sslcRepo;
    private final HscDetailRepository  hscRepo;
    private final StudentRepository    studentRepo;

    // ══════════════════════════════════════════════════════════════════════════
    // SSLC (10th) OPERATIONS
    // ══════════════════════════════════════════════════════════════════════════

    public SslcDetailResponseDto createSslc(SslcDetailRequestDto req) {
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + req.getStudentId()));

        if (sslcRepo.existsByStudentId(student.getId())) {
            throw new RuntimeException("SSLC record already exists for student: " + student.getRegisterNumber());
        }

        SslcDetail entity = mapToSslcEntity(req, student, new SslcDetail());
        entity = sslcRepo.save(entity);
        log.info("SSLC record created for student: {}", student.getRegisterNumber());
        return toSslcResponse(entity);
    }

    @Transactional(readOnly = true)
    public SslcDetailResponseDto getSslcById(Long id) {
        return toSslcResponse(sslcRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("SSLC record not found: " + id)));
    }

    @Transactional(readOnly = true)
    public SslcDetailResponseDto getSslcByStudentId(Long studentId) {
        return toSslcResponse(sslcRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("No SSLC record for student: " + studentId)));
    }

    public SslcDetailResponseDto updateSslc(Long id, SslcDetailRequestDto req) {
        SslcDetail entity = sslcRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("SSLC record not found: " + id));
        Student student = entity.getStudent();
        mapToSslcEntity(req, student, entity);
        return toSslcResponse(sslcRepo.save(entity));
    }

    public void deleteSslc(Long id) {
        if (!sslcRepo.existsById(id)) {
            throw new RuntimeException("SSLC record not found: " + id);
        }
        sslcRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PagedResponse<SslcDetailResponseDto> listSslc(
            String search, String board, Integer year,
            String department, String result,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SslcDetail> data = sslcRepo.findAllWithFilters(
                blankToNull(search), blankToNull(board),
                year, blankToNull(department), blankToNull(result), pageable);

        Page<SslcDetailResponseDto> dtoPage = data.map(this::toSslcResponse);
        return new PagedResponse<>(
                dtoPage.getContent(), dtoPage.getNumber(), dtoPage.getSize(),
                dtoPage.getTotalElements(), dtoPage.getTotalPages(), dtoPage.isLast());
    }

    // ── SSLC Reports ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getSslcReports() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("byBoard",      toLabelCountAvg(sslcRepo.reportByBoard()));
        report.put("byYear",       toLabelCountAvg(sslcRepo.reportByYear()));
        report.put("byResult",     toLabelCount(sslcRepo.reportByResult()));
        report.put("byDepartment", toLabelCountAvg(sslcRepo.reportByDepartment()));
        report.put("byGrade",      toLabelCount(sslcRepo.reportByGrade()));
        report.put("totalRecords", sslcRepo.count());
        return report;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HSC (12th) OPERATIONS
    // ══════════════════════════════════════════════════════════════════════════

    public HscDetailResponseDto createHsc(HscDetailRequestDto req) {
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found: " + req.getStudentId()));

        if (hscRepo.existsByStudentId(student.getId())) {
            throw new RuntimeException("HSC record already exists for student: " + student.getRegisterNumber());
        }

        HscDetail entity = mapToHscEntity(req, student, new HscDetail());
        entity = hscRepo.save(entity);
        log.info("HSC record created for student: {}", student.getRegisterNumber());
        return toHscResponse(entity);
    }

    @Transactional(readOnly = true)
    public HscDetailResponseDto getHscById(Long id) {
        return toHscResponse(hscRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("HSC record not found: " + id)));
    }

    @Transactional(readOnly = true)
    public HscDetailResponseDto getHscByStudentId(Long studentId) {
        return toHscResponse(hscRepo.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("No HSC record for student: " + studentId)));
    }

    public HscDetailResponseDto updateHsc(Long id, HscDetailRequestDto req) {
        HscDetail entity = hscRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("HSC record not found: " + id));
        mapToHscEntity(req, entity.getStudent(), entity);
        return toHscResponse(hscRepo.save(entity));
    }

    public void deleteHsc(Long id) {
        if (!hscRepo.existsById(id)) {
            throw new RuntimeException("HSC record not found: " + id);
        }
        hscRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PagedResponse<HscDetailResponseDto> listHsc(
            String search, String board, Integer year, String department,
            String groupName, String result,
            int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<HscDetail> data = hscRepo.findAllWithFilters(
                blankToNull(search), blankToNull(board), year,
                blankToNull(department), blankToNull(groupName), blankToNull(result), pageable);

        Page<HscDetailResponseDto> dtoPage = data.map(this::toHscResponse);
        return new PagedResponse<>(
                dtoPage.getContent(), dtoPage.getNumber(), dtoPage.getSize(),
                dtoPage.getTotalElements(), dtoPage.getTotalPages(), dtoPage.isLast());
    }

    // ── HSC Reports ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getHscReports() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("byBoard",      toHscBoardStats(hscRepo.reportByBoard()));
        report.put("byYear",       toHscBoardStats(hscRepo.reportByYear()));
        report.put("byGroup",      toHscBoardStats(hscRepo.reportByGroup()));
        report.put("byResult",     toLabelCount(hscRepo.reportByResult()));
        report.put("byDepartment", toDepCutoffStats(hscRepo.reportByDepartment()));
        report.put("byGrade",      toLabelCount(hscRepo.reportByGrade()));
        report.put("totalRecords", hscRepo.count());
        return report;
    }

    // ── Combined Student Academic Summary ─────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentAcademicProfile(Long studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("studentId",      student.getId());
        profile.put("registerNumber", student.getRegisterNumber());
        profile.put("fullName",       student.getFullName());
        profile.put("departmentName", student.getDepartmentName());
        profile.put("batch",          student.getBatch());

        sslcRepo.findByStudentId(studentId)
                .ifPresent(s -> profile.put("sslc", toSslcResponse(s)));
        hscRepo.findByStudentId(studentId)
                .ifPresent(h -> profile.put("hsc",  toHscResponse(h)));

        return profile;
    }

    // ── Meta / Dropdowns ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getMeta() {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("sslcBoards", sslcRepo.findDistinctBoards());
        meta.put("hscBoards",  hscRepo.findDistinctBoards());
        meta.put("hscGroups",  hscRepo.findDistinctGroups());
        meta.put("commonBoards", List.of(
                "Tamil Nadu State Board", "CBSE", "ICSE", "NIOS", "Matriculation"));
        meta.put("hscGroupOptions", List.of(
                "Bio-Maths (PCB)", "CS-Maths (PCM)", "Commerce", "Arts / Humanities",
                "Bio-Maths-CS", "Vocational"));
        return meta;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private SslcDetail mapToSslcEntity(SslcDetailRequestDto req, Student student, SslcDetail e) {
        e.setStudent(student);
        e.setRegisterNumber(student.getRegisterNumber());
        e.setSchoolName(req.getSchoolName());
        e.setBoard(req.getBoard());
        e.setPassingYear(req.getPassingYear());
        e.setExamRegisterNumber(req.getExamRegisterNumber());
        e.setTamilMarks(req.getTamilMarks());
        e.setEnglishMarks(req.getEnglishMarks());
        e.setMathematicsMarks(req.getMathematicsMarks());
        e.setScienceMarks(req.getScienceMarks());
        e.setSocialScienceMarks(req.getSocialScienceMarks());
        e.setLanguage3Subject(req.getLanguage3Subject());
        e.setLanguage3Marks(req.getLanguage3Marks());

        // Auto-compute total + percentage if not provided
        if (req.getTotalMarks() != null) {
            e.setTotalMarks(req.getTotalMarks());
        } else {
            int computed = sum(req.getTamilMarks(), req.getEnglishMarks(),
                    req.getMathematicsMarks(), req.getScienceMarks(), req.getSocialScienceMarks());
            e.setTotalMarks(computed > 0 ? computed : null);
        }
        int maxM = req.getMaxMarks() != null ? req.getMaxMarks() : 600;
        e.setMaxMarks(maxM);

        if (req.getPercentage() != null) {
            e.setPercentage(req.getPercentage());
        } else if (e.getTotalMarks() != null) {
            e.setPercentage(BigDecimal.valueOf(e.getTotalMarks() * 100.0 / maxM)
                    .setScale(2, RoundingMode.HALF_UP));
        }
        e.setGrade(req.getGrade() != null ? req.getGrade() : computeGrade(e.getPercentage()));
        e.setResult(req.getResult() != null ? req.getResult() : "PASS");
        return e;
    }

    private HscDetail mapToHscEntity(HscDetailRequestDto req, Student student, HscDetail e) {
        e.setStudent(student);
        e.setRegisterNumber(student.getRegisterNumber());
        e.setSchoolName(req.getSchoolName());
        e.setBoard(req.getBoard());
        e.setPassingYear(req.getPassingYear());
        e.setExamRegisterNumber(req.getExamRegisterNumber());
        e.setGroupName(req.getGroupName());
        e.setLanguage1Subject(req.getLanguage1Subject() != null ? req.getLanguage1Subject() : "Tamil");
        e.setLanguage1Marks(req.getLanguage1Marks());
        e.setLanguage2Subject(req.getLanguage2Subject() != null ? req.getLanguage2Subject() : "English");
        e.setLanguage2Marks(req.getLanguage2Marks());
        e.setPhysicsMarks(req.getPhysicsMarks());
        e.setChemistryMarks(req.getChemistryMarks());
        e.setMathematicsMarks(req.getMathematicsMarks());
        e.setBiologyMarks(req.getBiologyMarks());
        e.setComputerScienceMarks(req.getComputerScienceMarks());
        e.setOptionalSubject(req.getOptionalSubject());
        e.setOptionalMarks(req.getOptionalMarks());

        // Auto-compute total
        if (req.getTotalMarks() != null) {
            e.setTotalMarks(req.getTotalMarks());
        } else {
            int computed = sum(req.getLanguage1Marks(), req.getLanguage2Marks(),
                    req.getPhysicsMarks(), req.getChemistryMarks(),
                    req.getMathematicsMarks() != null ? req.getMathematicsMarks() :
                    (req.getBiologyMarks() != null ? req.getBiologyMarks() :
                     (req.getComputerScienceMarks() != null ? req.getComputerScienceMarks() : 0)));
            e.setTotalMarks(computed > 0 ? computed : null);
        }
        int maxM = req.getMaxMarks() != null ? req.getMaxMarks() : 600;
        e.setMaxMarks(maxM);

        if (req.getPercentage() != null) {
            e.setPercentage(req.getPercentage());
        } else if (e.getTotalMarks() != null) {
            e.setPercentage(BigDecimal.valueOf(e.getTotalMarks() * 100.0 / maxM)
                    .setScale(2, RoundingMode.HALF_UP));
        }

        // Auto-compute TN cutoff: Physics/2 + Chemistry/4 + Best(Maths|Bio|CS)/4
        if (req.getCutoff() != null) {
            e.setCutoff(req.getCutoff());
        } else {
            e.setCutoff(computeCutoff(req.getPhysicsMarks(), req.getChemistryMarks(),
                    req.getMathematicsMarks(), req.getBiologyMarks(), req.getComputerScienceMarks()));
        }
        e.setGrade(req.getGrade() != null ? req.getGrade() : computeGrade(e.getPercentage()));
        e.setResult(req.getResult() != null ? req.getResult() : "PASS");
        return e;
    }

    /**
     * TN Engineering Cutoff Formula (out of 200):
     * = (Physics / 2) + (Chemistry / 4) + (Best of Maths/Bio/CS) / 4
     */
    private BigDecimal computeCutoff(Integer phy, Integer che, Integer mat, Integer bio, Integer cs) {
        if (phy == null || che == null) return null;
        Integer thirdSubject = mat != null ? mat : (bio != null ? bio : cs);
        if (thirdSubject == null) return null;
        double cutoff = (phy / 2.0) + (che / 4.0) + (thirdSubject / 4.0);
        return BigDecimal.valueOf(cutoff).setScale(2, RoundingMode.HALF_UP);
    }

    private String computeGrade(BigDecimal pct) {
        if (pct == null) return null;
        double p = pct.doubleValue();
        if (p >= 90) return "A+";
        if (p >= 80) return "A";
        if (p >= 70) return "B+";
        if (p >= 60) return "B";
        if (p >= 50) return "C";
        return "D";
    }

    private int sum(Integer... vals) {
        int total = 0;
        for (Integer v : vals) if (v != null) total += v;
        return total;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    // ── Response Mappers ──────────────────────────────────────────────────────

    private SslcDetailResponseDto toSslcResponse(SslcDetail e) {
        Student s = e.getStudent();
        return SslcDetailResponseDto.builder()
                .id(e.getId())
                .studentId(s.getId())
                .registerNumber(e.getRegisterNumber())
                .fullName(s.getFullName())
                .departmentName(s.getDepartmentName())
                .batch(s.getBatch())
                .schoolName(e.getSchoolName())
                .board(e.getBoard())
                .passingYear(e.getPassingYear())
                .examRegisterNumber(e.getExamRegisterNumber())
                .totalMarks(e.getTotalMarks())
                .maxMarks(e.getMaxMarks())
                .percentage(e.getPercentage())
                .grade(e.getGrade())
                .result(e.getResult())
                .tamilMarks(e.getTamilMarks())
                .englishMarks(e.getEnglishMarks())
                .mathematicsMarks(e.getMathematicsMarks())
                .scienceMarks(e.getScienceMarks())
                .socialScienceMarks(e.getSocialScienceMarks())
                .language3Subject(e.getLanguage3Subject())
                .language3Marks(e.getLanguage3Marks())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private HscDetailResponseDto toHscResponse(HscDetail e) {
        Student s = e.getStudent();
        return HscDetailResponseDto.builder()
                .id(e.getId())
                .studentId(s.getId())
                .registerNumber(e.getRegisterNumber())
                .fullName(s.getFullName())
                .departmentName(s.getDepartmentName())
                .batch(s.getBatch())
                .schoolName(e.getSchoolName())
                .board(e.getBoard())
                .passingYear(e.getPassingYear())
                .examRegisterNumber(e.getExamRegisterNumber())
                .groupName(e.getGroupName())
                .totalMarks(e.getTotalMarks())
                .maxMarks(e.getMaxMarks())
                .percentage(e.getPercentage())
                .cutoff(e.getCutoff())
                .grade(e.getGrade())
                .result(e.getResult())
                .language1Subject(e.getLanguage1Subject())
                .language1Marks(e.getLanguage1Marks())
                .language2Subject(e.getLanguage2Subject())
                .language2Marks(e.getLanguage2Marks())
                .physicsMarks(e.getPhysicsMarks())
                .chemistryMarks(e.getChemistryMarks())
                .mathematicsMarks(e.getMathematicsMarks())
                .biologyMarks(e.getBiologyMarks())
                .computerScienceMarks(e.getComputerScienceMarks())
                .optionalSubject(e.getOptionalSubject())
                .optionalMarks(e.getOptionalMarks())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    // ── Report Helpers ────────────────────────────────────────────────────────

    private List<Map<String, Object>> toHscBoardStats(List<Object[]> rows) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label",   r[0]);
            m.put("count",   r[1]);
            m.put("avgPct",  r[2] != null ? ((Number) r[2]).doubleValue() : null);
            m.put("avgCutoff", r.length > 3 && r[3] != null ? ((Number) r[3]).doubleValue() : null);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> toDepCutoffStats(List<Object[]> rows) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label",     r[0]);
            m.put("count",     r[1]);
            m.put("avgCutoff", r[2] != null ? ((Number) r[2]).doubleValue() : null);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> toHscGroupStats(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toDepAvgStats(List<Object[]> rows) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label",  r[0]);
            m.put("count",  r[1]);
            m.put("avgPct", r[2] != null ? ((Number) r[2]).doubleValue() : null);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> toHscDepStats(List<Object[]> rows) {
        return toDepAvgStats(rows);
    }

    private List<Map<String, Object>> toHscYearStats(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toHscGroupReport(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toLabelCount(List<Object[]> rows) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", r[0]);
            m.put("count", r[1]);
            list.add(m);
        }
        return list;
    }

    private List<Map<String, Object>> toHscGroupStats2(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toHscDepReport(List<Object[]> rows) {
        return toDepCutoffStats(rows);
    }

    private List<Map<String, Object>> toHscByGroup(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toHscBoardReport(List<Object[]> rows) {
        return toHscBoardStats(rows);
    }

    private List<Map<String, Object>> toLabelCountAvg(List<Object[]> rows) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label",  r[0]);
            m.put("count",  r[1]);
            m.put("avgPct", r.length > 2 && r[2] != null ? ((Number) r[2]).doubleValue() : null);
            list.add(m);
        }
        return list;
    }
}
