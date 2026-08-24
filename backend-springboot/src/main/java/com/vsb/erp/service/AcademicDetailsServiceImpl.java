package com.vsb.erp.service;

import com.vsb.erp.dto.AcademicDetailsDTO;
import com.vsb.erp.dto.AcademicPromotionDTO;
import com.vsb.erp.entity.AcademicDetails;
import com.vsb.erp.entity.StudentMaster;
import com.vsb.erp.repository.AcademicDetailsRepository;
import com.vsb.erp.repository.StudentMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AcademicDetailsServiceImpl implements AcademicDetailsService {

    @Autowired
    private AcademicDetailsRepository academicRepository;

    @Autowired
    private StudentMasterRepository studentRepository;

    @Override
    @Transactional(readOnly = true)
    public AcademicDetailsDTO getAcademicDetailsByStudentId(Long studentId) {
        AcademicDetails academic = academicRepository.findByStudentId(studentId)
                .orElseGet(() -> createDefaultAcademicForStudent(studentId));
        return mapToDTO(academic);
    }

    @Override
    public AcademicDetailsDTO createOrUpdateAcademicDetails(Long studentId, AcademicDetailsDTO dto) {
        StudentMaster student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        AcademicDetails academic = academicRepository.findByStudentId(studentId)
                .orElseGet(() -> AcademicDetails.builder().student(student).build());

        academic.setUniversityRegNo(dto.getUniversityRegNo());
        academic.setAdmissionYear(dto.getAdmissionYear());
        academic.setBatch(dto.getBatch());
        academic.setDepartmentName(dto.getDepartmentName());
        academic.setDegree(dto.getDegree() != null ? dto.getDegree() : "B.E.");
        academic.setRegulation(dto.getRegulation() != null ? dto.getRegulation() : "2021");
        
        // Compute current year based on semester
        Integer semester = dto.getCurrentSemester();
        Integer computedYear = (int) Math.ceil(semester / 2.0);
        academic.setCurrentSemester(semester);
        academic.setCurrentYear(computedYear);
        academic.setSectionName(dto.getSectionName());
        academic.setMentorName(dto.getMentorName());
        academic.setClassAdvisor(dto.getClassAdvisor());
        academic.setAcademicStatus(dto.getAcademicStatus() != null ? dto.getAcademicStatus() : "ACTIVE");

        AcademicDetails saved = academicRepository.save(academic);

        // Synchronize with StudentMaster record
        syncStudentMaster(student, saved);

        return mapToDTO(saved);
    }

    @Override
    public AcademicDetailsDTO autoPromoteStudent(Long studentId) {
        AcademicDetails academic = academicRepository.findByStudentId(studentId)
                .orElseGet(() -> createDefaultAcademicForStudent(studentId));

        int currentSem = academic.getCurrentSemester();
        if (currentSem < 8) {
            int newSem = currentSem + 1;
            int newYear = (int) Math.ceil(newSem / 2.0);
            
            academic.setCurrentSemester(newSem);
            academic.setCurrentYear(newYear);
            academic.setLastPromotionDate(LocalDateTime.now());
            if (newSem == 8) {
                academic.setAcademicStatus("COMPLETING");
            }
            
            AcademicDetails saved = academicRepository.save(academic);
            syncStudentMaster(academic.getStudent(), saved);
            return mapToDTO(saved);
        } else {
            academic.setAcademicStatus("ALUMNI");
            AcademicDetails saved = academicRepository.save(academic);
            syncStudentMaster(academic.getStudent(), saved);
            return mapToDTO(saved);
        }
    }

    @Override
    public AcademicPromotionDTO autoPromoteBatch(AcademicPromotionDTO promotionRequest) {
        List<AcademicDetails> records = academicRepository.filterAcademicRecords(
                promotionRequest.getDepartmentName(),
                promotionRequest.getFromYear(),
                promotionRequest.getFromSemester(),
                promotionRequest.getSectionName(),
                promotionRequest.getBatch()
        );

        int count = 0;
        for (AcademicDetails academic : records) {
            int currentSem = academic.getCurrentSemester();
            if (currentSem < 8) {
                int newSem = currentSem + 1;
                int newYear = (int) Math.ceil(newSem / 2.0);
                academic.setCurrentSemester(newSem);
                academic.setCurrentYear(newYear);
                academic.setLastPromotionDate(LocalDateTime.now());
                AcademicDetails saved = academicRepository.save(academic);
                syncStudentMaster(academic.getStudent(), saved);
                count++;
            }
        }

        promotionRequest.setPromotedCount(count);
        promotionRequest.setMessage("Successfully promoted " + count + " students to the next Semester & Year.");
        return promotionRequest;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicDetailsDTO> filterAcademicRecords(String department, Integer year, Integer semester, String section, String batch) {
        List<AcademicDetails> list = academicRepository.filterAcademicRecords(department, year, semester, section, batch);
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private AcademicDetails createDefaultAcademicForStudent(Long studentId) {
        StudentMaster student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        AcademicDetails newAcademic = AcademicDetails.builder()
                .student(student)
                .universityRegNo(student.getUniversityRegNo() != null ? student.getUniversityRegNo() : student.getRegisterNumber())
                .admissionYear(student.getAdmissionYear() != null ? student.getAdmissionYear() : 2021)
                .batch(student.getBatch() != null ? student.getBatch() : "2021-2025")
                .departmentName(student.getDepartmentName() != null ? student.getDepartmentName() : "Computer Science & Engineering")
                .degree(student.getDegree() != null ? student.getDegree() : "B.E.")
                .regulation(student.getRegulation() != null ? student.getRegulation() : "2021")
                .currentYear(student.getCurrentYear() != null ? student.getCurrentYear() : 3)
                .currentSemester(student.getCurrentSemester() != null ? student.getCurrentSemester() : 6)
                .sectionName(student.getSectionName() != null ? student.getSectionName() : "A")
                .mentorName(student.getMentorName())
                .classAdvisor(student.getClassAdvisor())
                .academicStatus("ACTIVE")
                .lastPromotionDate(LocalDateTime.now())
                .build();

        return academicRepository.save(newAcademic);
    }

    private void syncStudentMaster(StudentMaster student, AcademicDetails academic) {
        if (student != null && academic != null) {
            student.setCurrentYear(academic.getCurrentYear());
            student.setCurrentSemester(academic.getCurrentSemester());
            student.setSectionName(academic.getSectionName());
            student.setDepartmentName(academic.getDepartmentName());
            student.setDegree(academic.getDegree());
            student.setBatch(academic.getBatch());
            student.setAdmissionYear(academic.getAdmissionYear());
            student.setRegulation(academic.getRegulation());
            if (academic.getMentorName() != null) student.setMentorName(academic.getMentorName());
            if (academic.getClassAdvisor() != null) student.setClassAdvisor(academic.getClassAdvisor());
            if (academic.getUniversityRegNo() != null) student.setUniversityRegNo(academic.getUniversityRegNo());
            studentRepository.save(student);
        }
    }

    private AcademicDetailsDTO mapToDTO(AcademicDetails entity) {
        return AcademicDetailsDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .registerNumber(entity.getStudent() != null ? entity.getStudent().getRegisterNumber() : null)
                .studentName(entity.getStudent() != null ? entity.getStudent().getFullName() : null)
                .universityRegNo(entity.getUniversityRegNo())
                .admissionYear(entity.getAdmissionYear())
                .batch(entity.getBatch())
                .departmentName(entity.getDepartmentName())
                .degree(entity.getDegree())
                .regulation(entity.getRegulation())
                .currentYear(entity.getCurrentYear())
                .currentSemester(entity.getCurrentSemester())
                .sectionName(entity.getSectionName())
                .mentorName(entity.getMentorName())
                .classAdvisor(entity.getClassAdvisor())
                .academicStatus(entity.getAcademicStatus())
                .lastPromotionDate(entity.getLastPromotionDate())
                .build();
    }
}
