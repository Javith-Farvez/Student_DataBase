package com.vsb.erp.service;

import com.vsb.erp.dto.*;
import com.vsb.erp.entity.StudentMaster;
import com.vsb.erp.repository.StudentMasterRepository;
import com.vsb.erp.repository.StudentSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentMasterServiceImpl implements StudentMasterService {

    @Autowired
    private StudentMasterRepository studentRepository;

    @Override
    public StudentMasterResponseDTO createStudent(StudentMasterRequestDTO dto) {
        // Uniqueness Validations
        if (studentRepository.existsByRegisterNumber(dto.getRegisterNumber())) {
            throw new IllegalArgumentException("Register Number '" + dto.getRegisterNumber() + "' is already registered.");
        }
        if (studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new IllegalArgumentException("Roll Number '" + dto.getRollNumber() + "' is already registered.");
        }
        if (studentRepository.existsByAdmissionNumber(dto.getAdmissionNumber())) {
            throw new IllegalArgumentException("Admission Number '" + dto.getAdmissionNumber() + "' is already registered.");
        }
        if (dto.getUniversityRegNo() != null && !dto.getUniversityRegNo().trim().isEmpty() 
                && studentRepository.existsByUniversityRegNo(dto.getUniversityRegNo())) {
            throw new IllegalArgumentException("University Register Number '" + dto.getUniversityRegNo() + "' is already registered.");
        }
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already registered.");
        }

        StudentMaster student = mapToEntity(dto, new StudentMaster());
        StudentMaster savedStudent = studentRepository.save(student);
        return mapToResponseDTO(savedStudent);
    }

    @Override
    public StudentMasterResponseDTO updateStudent(Long id, StudentMasterRequestDTO dto) {
        StudentMaster existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student Profile not found with ID: " + id));

        // Validate uniqueness if key unique attributes changed
        if (!existingStudent.getRegisterNumber().equalsIgnoreCase(dto.getRegisterNumber())
                && studentRepository.existsByRegisterNumber(dto.getRegisterNumber())) {
            throw new IllegalArgumentException("Register Number '" + dto.getRegisterNumber() + "' is already registered.");
        }
        if (!existingStudent.getRollNumber().equalsIgnoreCase(dto.getRollNumber())
                && studentRepository.existsByRollNumber(dto.getRollNumber())) {
            throw new IllegalArgumentException("Roll Number '" + dto.getRollNumber() + "' is already registered.");
        }
        if (!existingStudent.getAdmissionNumber().equalsIgnoreCase(dto.getAdmissionNumber())
                && studentRepository.existsByAdmissionNumber(dto.getAdmissionNumber())) {
            throw new IllegalArgumentException("Admission Number '" + dto.getAdmissionNumber() + "' is already registered.");
        }

        StudentMaster updatedEntity = mapToEntity(dto, existingStudent);
        StudentMaster savedStudent = studentRepository.save(updatedEntity);
        return mapToResponseDTO(savedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student Profile not found with ID: " + id);
        }
        studentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentMasterResponseDTO getStudentById(Long id) {
        StudentMaster student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student Profile not found with ID: " + id));
        return mapToResponseDTO(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentMasterResponseDTO getStudentByRegisterNumber(String registerNumber) {
        StudentMaster student = studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new RuntimeException("Student Profile not found with Register Number: " + registerNumber));
        return mapToResponseDTO(student);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<StudentMasterResponseDTO> getAllStudents(StudentSearchCriteriaDTO criteria, int page, int size) {
        Specification<StudentMaster> spec = StudentSpecification.buildSpecification(criteria);

        // Sorting Logic (Default to registerNumber ASC)
        String sortBy = (criteria.getSortBy() != null && !criteria.getSortBy().isEmpty()) ? criteria.getSortBy() : "registerNumber";
        Sort.Direction direction = "DESC".equalsIgnoreCase(criteria.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<StudentMaster> studentPage = studentRepository.findAll(spec, pageable);

        List<StudentMasterResponseDTO> content = studentPage.getContent().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<StudentMasterResponseDTO>builder()
                .content(content)
                .pageNo(studentPage.getNumber())
                .pageSize(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .last(studentPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentMasterResponseDTO> exportStudentsList(StudentSearchCriteriaDTO criteria) {
        Specification<StudentMaster> spec = StudentSpecification.buildSpecification(criteria);
        Sort sort = Sort.by(Sort.Direction.ASC, "registerNumber");
        List<StudentMaster> students = studentRepository.findAll(spec, sort);
        return students.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public String uploadPhoto(Long id, String photoBase64OrUrl) {
        StudentMaster student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student Profile not found with ID: " + id));
        student.setPhotoUrl(photoBase64OrUrl);
        studentRepository.save(student);
        return photoBase64OrUrl;
    }

    private StudentMaster mapToEntity(StudentMasterRequestDTO dto, StudentMaster entity) {
        entity.setRegisterNumber(dto.getRegisterNumber());
        entity.setUniversityRegNo(dto.getUniversityRegNo());
        entity.setAdmissionNumber(dto.getAdmissionNumber());
        entity.setRollNumber(dto.getRollNumber());
        entity.setFullName(dto.getFullName());
        entity.setPhotoUrl(dto.getPhotoUrl());
        entity.setGender(dto.getGender());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setAadhaarNumber(dto.getAadhaarNumber());
        entity.setPanNumber(dto.getPanNumber());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setEmail(dto.getEmail());

        entity.setFatherName(dto.getFatherName());
        entity.setFatherOccupation(dto.getFatherOccupation());
        entity.setFatherMobile(dto.getFatherMobile());
        entity.setMotherName(dto.getMotherName());
        entity.setMotherOccupation(dto.getMotherOccupation());
        entity.setMotherMobile(dto.getMotherMobile());
        entity.setGuardianName(dto.getGuardianName());
        entity.setGuardianMobile(dto.getGuardianMobile());

        entity.setCurrentAddress(dto.getCurrentAddress());
        entity.setPermanentAddress(dto.getPermanentAddress());
        entity.setNativeDistrict(dto.getNativeDistrict());
        entity.setNativeState(dto.getNativeState() != null ? dto.getNativeState() : "Tamil Nadu");
        entity.setPincode(dto.getPincode());

        entity.setReligion(dto.getReligion());
        entity.setCommunity(dto.getCommunity());
        entity.setCaste(dto.getCaste());
        entity.setSubCaste(dto.getSubCaste());
        entity.setNationality(dto.getNationality() != null ? dto.getNationality() : "Indian");
        entity.setFirstGraduate(dto.getFirstGraduate() != null ? dto.getFirstGraduate() : false);

        entity.setDepartmentName(dto.getDepartmentName());
        entity.setDegree(dto.getDegree() != null ? dto.getDegree() : "B.E.");
        entity.setBatch(dto.getBatch());
        entity.setAdmissionYear(dto.getAdmissionYear());
        entity.setRegulation(dto.getRegulation() != null ? dto.getRegulation() : "2021");
        entity.setCurrentYear(dto.getCurrentYear());
        entity.setCurrentSemester(dto.getCurrentSemester());
        entity.setSectionName(dto.getSectionName());
        entity.setMentorName(dto.getMentorName());
        entity.setClassAdvisor(dto.getClassAdvisor());
        entity.setStudentStatus(dto.getStudentStatus() != null ? dto.getStudentStatus() : "ACTIVE");

        entity.setResidenceType(dto.getResidenceType() != null ? dto.getResidenceType() : "DAY_SCHOLAR");
        entity.setBusRoute(dto.getBusRoute());
        entity.setBoardingPoint(dto.getBoardingPoint());
        entity.setHostelBlock(dto.getHostelBlock());
        entity.setRoomNumber(dto.getRoomNumber());

        entity.setEmergencyContactName(dto.getEmergencyContactName());
        entity.setEmergencyContactRelation(dto.getEmergencyContactRelation());
        entity.setEmergencyContactMobile(dto.getEmergencyContactMobile());

        if (dto.getCgpa() != null) entity.setCgpa(dto.getCgpa());
        if (dto.getAttendancePercentage() != null) entity.setAttendancePercentage(dto.getAttendancePercentage());
        if (dto.getFeeBalance() != null) entity.setFeeBalance(dto.getFeeBalance());

        return entity;
    }

    private StudentMasterResponseDTO mapToResponseDTO(StudentMaster entity) {
        return StudentMasterResponseDTO.builder()
                .id(entity.getId())
                .registerNumber(entity.getRegisterNumber())
                .universityRegNo(entity.getUniversityRegNo())
                .admissionNumber(entity.getAdmissionNumber())
                .rollNumber(entity.getRollNumber())
                .fullName(entity.getFullName())
                .photoUrl(entity.getPhotoUrl())
                .gender(entity.getGender())
                .dateOfBirth(entity.getDateOfBirth())
                .bloodGroup(entity.getBloodGroup())
                .aadhaarNumber(entity.getAadhaarNumber())
                .panNumber(entity.getPanNumber())
                .mobileNumber(entity.getMobileNumber())
                .email(entity.getEmail())

                .fatherName(entity.getFatherName())
                .fatherOccupation(entity.getFatherOccupation())
                .fatherMobile(entity.getFatherMobile())
                .motherName(entity.getMotherName())
                .motherOccupation(entity.getMotherOccupation())
                .motherMobile(entity.getMotherMobile())
                .guardianName(entity.getGuardianName())
                .guardianMobile(entity.getGuardianMobile())

                .currentAddress(entity.getCurrentAddress())
                .permanentAddress(entity.getPermanentAddress())
                .nativeDistrict(entity.getNativeDistrict())
                .nativeState(entity.getNativeState())
                .pincode(entity.getPincode())

                .religion(entity.getReligion())
                .community(entity.getCommunity())
                .caste(entity.getCaste())
                .subCaste(entity.getSubCaste())
                .nationality(entity.getNationality())
                .firstGraduate(entity.getFirstGraduate())

                .departmentName(entity.getDepartmentName())
                .degree(entity.getDegree())
                .batch(entity.getBatch())
                .admissionYear(entity.getAdmissionYear())
                .regulation(entity.getRegulation())
                .currentYear(entity.getCurrentYear())
                .currentSemester(entity.getCurrentSemester())
                .sectionName(entity.getSectionName())
                .mentorName(entity.getMentorName())
                .classAdvisor(entity.getClassAdvisor())
                .studentStatus(entity.getStudentStatus())

                .residenceType(entity.getResidenceType())
                .busRoute(entity.getBusRoute())
                .boardingPoint(entity.getBoardingPoint())
                .hostelBlock(entity.getHostelBlock())
                .roomNumber(entity.getRoomNumber())

                .emergencyContactName(entity.getEmergencyContactName())
                .emergencyContactRelation(entity.getEmergencyContactRelation())
                .emergencyContactMobile(entity.getEmergencyContactMobile())

                .cgpa(entity.getCgpa())
                .attendancePercentage(entity.getAttendancePercentage())
                .feeBalance(entity.getFeeBalance())

                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
