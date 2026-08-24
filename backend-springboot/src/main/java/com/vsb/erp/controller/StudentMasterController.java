package com.vsb.erp.controller;

import com.vsb.erp.dto.*;
import com.vsb.erp.service.StudentMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Student Master Management", description = "REST APIs for complete Student Master Profile CRUD, Multi-Filter, Search, Photo Upload & Pagination")
public class StudentMasterController {

    @Autowired
    private StudentMasterService studentService;

    @Operation(summary = "Create Student Profile", description = "Creates a new Student Master Record with validation across 40+ fields")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Student created successfully",
                    content = @Content(schema = @Schema(implementation = StudentMasterResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data or duplicate unique key constraint")
    })
    @PostMapping
    public ResponseEntity<StudentMasterResponseDTO> createStudent(@Valid @RequestBody StudentMasterRequestDTO requestDTO) {
        StudentMasterResponseDTO createdStudent = studentService.createStudent(requestDTO);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    @Operation(summary = "Update Student Profile", description = "Updates an existing Student Master Record by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Student updated successfully"),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<StudentMasterResponseDTO> updateStudent(
            @Parameter(description = "ID of the student to update") @PathVariable Long id,
            @Valid @RequestBody StudentMasterRequestDTO requestDTO) {
        StudentMasterResponseDTO updatedStudent = studentService.updateStudent(id, requestDTO);
        return ResponseEntity.ok(updatedStudent);
    }

    @Operation(summary = "Delete Student Profile", description = "Deletes a Student Master Record by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteStudent(
            @Parameter(description = "ID of the student to delete") @PathVariable Long id) {
        studentService.deleteStudent(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Student profile with ID " + id + " deleted successfully.");
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get Student by ID", description = "Retrieves complete student profile by database primary key ID")
    @GetMapping("/{id}")
    public ResponseEntity<StudentMasterResponseDTO> getStudentById(@PathVariable Long id) {
        StudentMasterResponseDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @Operation(summary = "Get Student by Register Number", description = "Retrieves complete student profile by Register Number")
    @GetMapping("/reg/{registerNumber}")
    public ResponseEntity<StudentMasterResponseDTO> getStudentByRegisterNumber(@PathVariable String registerNumber) {
        StudentMasterResponseDTO student = studentService.getStudentByRegisterNumber(registerNumber);
        return ResponseEntity.ok(student);
    }

    @Operation(summary = "Search, Filter & Paginate Students", description = "Advanced multi-criteria filtering by Department, Year, Semester, Section, Community, Batch, Gender, Search query, and Register Number sorting with pagination")
    @GetMapping
    public ResponseEntity<PageResponseDTO<StudentMasterResponseDTO>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String community,
            @RequestParam(required = false) String batch,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String residenceType,
            @RequestParam(defaultValue = "registerNumber") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        StudentSearchCriteriaDTO criteria = StudentSearchCriteriaDTO.builder()
                .search(search)
                .department(department)
                .year(year)
                .semester(semester)
                .section(section)
                .community(community)
                .batch(batch)
                .gender(gender)
                .residenceType(residenceType)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        PageResponseDTO<StudentMasterResponseDTO> pageResult = studentService.getAllStudents(criteria, page, size);
        return ResponseEntity.ok(pageResult);
    }

    @Operation(summary = "Export Filtered Students", description = "Retrieves full list of filtered students without pagination for report exports")
    @GetMapping("/export")
    public ResponseEntity<List<StudentMasterResponseDTO>> exportStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String community,
            @RequestParam(required = false) String batch,
            @RequestParam(required = false) String gender
    ) {
        StudentSearchCriteriaDTO criteria = StudentSearchCriteriaDTO.builder()
                .search(search)
                .department(department)
                .year(year)
                .semester(semester)
                .section(section)
                .community(community)
                .batch(batch)
                .gender(gender)
                .build();

        List<StudentMasterResponseDTO> exportList = studentService.exportStudentsList(criteria);
        return ResponseEntity.ok(exportList);
    }

    @Operation(summary = "Upload Student Photo", description = "Uploads photo URL or Base64 data string for a student profile")
    @PostMapping("/{id}/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> photoPayload) {
        String photoUrl = photoPayload.get("photoUrl");
        if (photoUrl == null || photoUrl.isEmpty()) {
            photoUrl = photoPayload.get("photo");
        }
        String updatedPhotoUrl = studentService.uploadPhoto(id, photoUrl);
        Map<String, String> response = new HashMap<>();
        response.put("photoUrl", updatedPhotoUrl);
        response.put("message", "Photo uploaded successfully.");
        return ResponseEntity.ok(response);
    }
}
