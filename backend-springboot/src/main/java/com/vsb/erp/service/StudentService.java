package com.vsb.erp.service;

import com.vsb.erp.dto.*;
import com.vsb.erp.entity.Student;
import com.vsb.erp.enums.*;
import com.vsb.erp.repository.StudentRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

/**
 * Student Service — all CRUD business logic for the Student Master Module.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;

    // ─── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public StudentResponseDto createStudent(StudentRequestDto dto) {
        validateUniqueFields(dto, null);
        Student student = mapToEntity(dto, new Student());
        Student saved = studentRepository.save(student);
        log.info("Created student: {} ({})", saved.getFullName(), saved.getRegisterNumber());
        return mapToResponseDto(saved);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    public StudentResponseDto getStudentById(Long id) {
        return mapToResponseDto(findOrThrow(id));
    }

    public StudentResponseDto getStudentByRegisterNumber(String registerNumber) {
        return studentRepository.findByRegisterNumber(registerNumber)
                .map(this::mapToResponseDto)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Student not found with register number: " + registerNumber));
    }

    public PagedResponse<StudentSummaryDto> getStudents(
            String search, String department, Integer year, Integer semester,
            String section, String communityStr, String batch, String genderStr,
            String statusStr, int page, int size, String sortBy, String sortDir) {

        Community community = parseSafely(communityStr, Community.class);
        Gender gender       = parseSafely(genderStr,    Gender.class);
        StudentStatus status = parseSafely(statusStr,   StudentStatus.class);

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Student> studentPage = studentRepository.findAllWithFilters(
                blankToNull(search), blankToNull(department), year, semester,
                blankToNull(section), community, blankToNull(batch), gender, status, pageable);

        List<StudentSummaryDto> summaries = studentPage.getContent()
                .stream().map(this::mapToSummaryDto).toList();

        return PagedResponse.<StudentSummaryDto>builder()
                .content(summaries)
                .page(studentPage.getNumber())
                .size(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .first(studentPage.isFirst())
                .last(studentPage.isLast())
                .build();
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @Transactional
    public StudentResponseDto updateStudent(Long id, StudentRequestDto dto) {
        Student existing = findOrThrow(id);
        validateUniqueFields(dto, id);
        mapToEntity(dto, existing);
        Student saved = studentRepository.save(existing);
        log.info("Updated student: {} ({})", saved.getFullName(), saved.getRegisterNumber());
        return mapToResponseDto(saved);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    @Transactional
    public void deleteStudent(Long id) {
        Student student = findOrThrow(id);
        studentRepository.delete(student);
        log.info("Deleted student ID: {}", id);
    }

    // ─── Photo Upload ─────────────────────────────────────────────────────────

    @Transactional
    public StudentResponseDto uploadPhoto(Long id, MultipartFile file) throws IOException {
        Student student = findOrThrow(id);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Photo file is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Photo file size must be ≤ 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Store as base64 data URI
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        student.setPhotoUrl("data:" + contentType + ";base64," + base64);
        Student saved = studentRepository.save(student);
        log.info("Photo uploaded for student ID: {}", id);
        return mapToResponseDto(saved);
    }

    // ─── Meta / Dropdowns ─────────────────────────────────────────────────────

    public List<String> getDistinctDepartments() {
        return studentRepository.findDistinctDepartments();
    }

    public List<String> getDistinctBatches() {
        return studentRepository.findDistinctBatches();
    }

    public List<String> getSectionsByDepartment(String department) {
        return studentRepository.findDistinctSectionsByDepartment(department);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private Student findOrThrow(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + id));
    }

    private void validateUniqueFields(StudentRequestDto dto, Long excludeId) {
        if (excludeId == null) {
            if (studentRepository.existsByRegisterNumber(dto.getRegisterNumber()))
                throw new IllegalArgumentException("Register number already exists: " + dto.getRegisterNumber());
            if (studentRepository.existsByAdmissionNumber(dto.getAdmissionNumber()))
                throw new IllegalArgumentException("Admission number already exists: " + dto.getAdmissionNumber());
            if (studentRepository.existsByRollNumber(dto.getRollNumber()))
                throw new IllegalArgumentException("Roll number already exists: " + dto.getRollNumber());
            if (studentRepository.existsByEmail(dto.getEmail()))
                throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
            if (dto.getAadhaarNumber() != null && !dto.getAadhaarNumber().isBlank()
                    && studentRepository.existsByAadhaarNumber(dto.getAadhaarNumber()))
                throw new IllegalArgumentException("Aadhaar number already exists");
        } else {
            if (studentRepository.existsByRegisterNumberAndIdNot(dto.getRegisterNumber(), excludeId))
                throw new IllegalArgumentException("Register number already exists: " + dto.getRegisterNumber());
            if (studentRepository.existsByAdmissionNumberAndIdNot(dto.getAdmissionNumber(), excludeId))
                throw new IllegalArgumentException("Admission number already exists: " + dto.getAdmissionNumber());
            if (studentRepository.existsByRollNumberAndIdNot(dto.getRollNumber(), excludeId))
                throw new IllegalArgumentException("Roll number already exists: " + dto.getRollNumber());
            if (studentRepository.existsByEmailAndIdNot(dto.getEmail(), excludeId))
                throw new IllegalArgumentException("Email already exists: " + dto.getEmail());
            if (dto.getAadhaarNumber() != null && !dto.getAadhaarNumber().isBlank()
                    && studentRepository.existsByAadhaarNumberAndIdNot(dto.getAadhaarNumber(), excludeId))
                throw new IllegalArgumentException("Aadhaar number already exists");
        }
    }

    private Student mapToEntity(StudentRequestDto dto, Student s) {
        s.setRegisterNumber(dto.getRegisterNumber());
        s.setUniversityRegNo(dto.getUniversityRegNo());
        s.setAdmissionNumber(dto.getAdmissionNumber());
        s.setRollNumber(dto.getRollNumber());
        s.setFullName(dto.getFullName());
        s.setGender(dto.getGender());
        s.setDateOfBirth(dto.getDateOfBirth());
        s.setBloodGroup(dto.getBloodGroup());
        s.setAadhaarNumber(blankToNull(dto.getAadhaarNumber()));
        s.setMobileNumber(dto.getMobileNumber());
        s.setEmail(dto.getEmail());

        s.setFatherName(dto.getFatherName());
        s.setFatherOccupation(dto.getFatherOccupation());
        s.setFatherMobile(blankToNull(dto.getFatherMobile()));
        s.setMotherName(dto.getMotherName());
        s.setMotherOccupation(dto.getMotherOccupation());
        s.setMotherMobile(blankToNull(dto.getMotherMobile()));
        s.setGuardianName(dto.getGuardianName());
        s.setGuardianMobile(blankToNull(dto.getGuardianMobile()));

        s.setCurrentAddress(dto.getCurrentAddress());
        s.setPermanentAddress(dto.getPermanentAddress());
        s.setDistrict(dto.getDistrict());
        s.setState(dto.getState());
        s.setPincode(blankToNull(dto.getPincode()));

        s.setReligion(dto.getReligion());
        s.setCommunity(dto.getCommunity());
        s.setCaste(dto.getCaste());
        s.setSubCaste(dto.getSubCaste());
        s.setNationality(dto.getNationality() != null ? dto.getNationality() : "Indian");
        s.setNativeDistrict(dto.getNativeDistrict());
        s.setFirstGraduate(dto.getFirstGraduate() != null ? dto.getFirstGraduate() : false);

        s.setDepartmentName(dto.getDepartmentName());
        s.setDegree(dto.getDegree() != null ? dto.getDegree() : "B.E.");
        s.setBatch(dto.getBatch());
        s.setAdmissionYear(dto.getAdmissionYear());
        s.setRegulation(dto.getRegulation());
        s.setCurrentYear(dto.getCurrentYear());
        s.setCurrentSemester(dto.getCurrentSemester());
        s.setSectionName(dto.getSectionName());
        s.setMentorName(dto.getMentorName());
        s.setClassAdvisor(dto.getClassAdvisor());
        s.setStudentStatus(dto.getStudentStatus() != null ? dto.getStudentStatus() : StudentStatus.ACTIVE);

        s.setResidenceType(dto.getResidenceType() != null ? dto.getResidenceType() : ResidenceType.DAY_SCHOLAR);
        s.setBusRoute(dto.getBusRoute());
        s.setBoardingPoint(dto.getBoardingPoint());
        s.setHostelBlock(dto.getHostelBlock());
        s.setRoomNumber(dto.getRoomNumber());

        s.setEmergencyContactName(dto.getEmergencyContactName());
        s.setEmergencyContactRelation(dto.getEmergencyContactRelation());
        s.setEmergencyContactMobile(blankToNull(dto.getEmergencyContactMobile()));

        return s;
    }

    public StudentResponseDto mapToResponseDto(Student s) {
        return StudentResponseDto.builder()
                .id(s.getId())
                .registerNumber(s.getRegisterNumber())
                .universityRegNo(s.getUniversityRegNo())
                .admissionNumber(s.getAdmissionNumber())
                .rollNumber(s.getRollNumber())
                .fullName(s.getFullName())
                .photoUrl(s.getPhotoUrl())
                .gender(s.getGender())
                .dateOfBirth(s.getDateOfBirth())
                .bloodGroup(s.getBloodGroup())
                .aadhaarNumber(s.getAadhaarNumber())
                .mobileNumber(s.getMobileNumber())
                .email(s.getEmail())
                .fatherName(s.getFatherName())
                .fatherOccupation(s.getFatherOccupation())
                .fatherMobile(s.getFatherMobile())
                .motherName(s.getMotherName())
                .motherOccupation(s.getMotherOccupation())
                .motherMobile(s.getMotherMobile())
                .guardianName(s.getGuardianName())
                .guardianMobile(s.getGuardianMobile())
                .currentAddress(s.getCurrentAddress())
                .permanentAddress(s.getPermanentAddress())
                .district(s.getDistrict())
                .state(s.getState())
                .pincode(s.getPincode())
                .religion(s.getReligion())
                .community(s.getCommunity())
                .caste(s.getCaste())
                .subCaste(s.getSubCaste())
                .nationality(s.getNationality())
                .nativeDistrict(s.getNativeDistrict())
                .firstGraduate(s.getFirstGraduate())
                .departmentName(s.getDepartmentName())
                .degree(s.getDegree())
                .batch(s.getBatch())
                .admissionYear(s.getAdmissionYear())
                .regulation(s.getRegulation())
                .currentYear(s.getCurrentYear())
                .currentSemester(s.getCurrentSemester())
                .sectionName(s.getSectionName())
                .mentorName(s.getMentorName())
                .classAdvisor(s.getClassAdvisor())
                .studentStatus(s.getStudentStatus())
                .residenceType(s.getResidenceType())
                .busRoute(s.getBusRoute())
                .boardingPoint(s.getBoardingPoint())
                .hostelBlock(s.getHostelBlock())
                .roomNumber(s.getRoomNumber())
                .emergencyContactName(s.getEmergencyContactName())
                .emergencyContactRelation(s.getEmergencyContactRelation())
                .emergencyContactMobile(s.getEmergencyContactMobile())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private StudentSummaryDto mapToSummaryDto(Student s) {
        return StudentSummaryDto.builder()
                .id(s.getId())
                .registerNumber(s.getRegisterNumber())
                .rollNumber(s.getRollNumber())
                .fullName(s.getFullName())
                .photoUrl(s.getPhotoUrl())
                .gender(s.getGender())
                .departmentName(s.getDepartmentName())
                .batch(s.getBatch())
                .currentYear(s.getCurrentYear())
                .currentSemester(s.getCurrentSemester())
                .sectionName(s.getSectionName())
                .studentStatus(s.getStudentStatus())
                .residenceType(s.getResidenceType())
                .community(s.getCommunity())
                .mobileNumber(s.getMobileNumber())
                .email(s.getEmail())
                .build();
    }

    private String blankToNull(String val) {
        return (val == null || val.isBlank()) ? null : val;
    }

    private <E extends Enum<E>> E parseSafely(String value, Class<E> enumType) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(enumType, value.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}
