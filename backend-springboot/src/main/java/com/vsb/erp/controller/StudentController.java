package com.vsb.erp.controller;

import com.vsb.erp.dto.*;
import com.vsb.erp.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Student Master REST Controller — VSB Engineering College ERP
 * Base URL: /api/v1/students
 */
@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Student Master", description = "Complete CRUD operations for Student Master Module")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentController {

    private final StudentService studentService;

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new student", description = "Creates a new student profile with all details")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Student created successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error or duplicate field")
    public ResponseEntity<ApiResponse<StudentResponseDto>> createStudent(
            @Valid @RequestBody StudentRequestDto dto) {
        StudentResponseDto created = studentService.createStudent(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Student created successfully", created));
    }

    // ─── READ — List ─────────────────────────────────────────────────────────

    @GetMapping
    @Operation(
        summary = "Get paginated student list",
        description = "Returns paginated students with optional search, filter, and sort"
    )
    public ResponseEntity<ApiResponse<PagedResponse<StudentSummaryDto>>> getStudents(
            @Parameter(description = "Search by name, register no, roll no, or email")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by department name")
            @RequestParam(required = false) String department,

            @Parameter(description = "Filter by current year (1-5)")
            @RequestParam(required = false) Integer year,

            @Parameter(description = "Filter by current semester (1-10)")
            @RequestParam(required = false) Integer semester,

            @Parameter(description = "Filter by section (A, B, C...)")
            @RequestParam(required = false) String section,

            @Parameter(description = "Filter by community (OC, BC, MBC, SC, ST...)")
            @RequestParam(required = false) String community,

            @Parameter(description = "Filter by batch (e.g. 2021-2025)")
            @RequestParam(required = false) String batch,

            @Parameter(description = "Filter by gender (MALE, FEMALE, OTHER)")
            @RequestParam(required = false) String gender,

            @Parameter(description = "Filter by student status (ACTIVE, ALUMNI...)")
            @RequestParam(required = false) String status,

            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registerNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PagedResponse<StudentSummaryDto> result = studentService.getStudents(
                search, department, year, semester, section,
                community, batch, gender, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok("Students fetched successfully", result));
    }

    // ─── READ — Single ────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get student by ID")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Student fetched", studentService.getStudentById(id)));
    }

    @GetMapping("/register/{registerNumber}")
    @Operation(summary = "Get student by register number")
    public ResponseEntity<ApiResponse<StudentResponseDto>> getByRegisterNumber(
            @PathVariable String registerNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Student fetched",
                studentService.getStudentByRegisterNumber(registerNumber)));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update student profile")
    public ResponseEntity<ApiResponse<StudentResponseDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequestDto dto) {
        StudentResponseDto updated = studentService.updateStudent(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Student updated successfully", updated));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete student")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok("Student deleted successfully", null));
    }

    // ─── PHOTO UPLOAD ─────────────────────────────────────────────────────────

    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload student passport photo",
               description = "Accepts JPEG/PNG image ≤ 5MB. Stored as base64.")
    public ResponseEntity<ApiResponse<StudentResponseDto>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        StudentResponseDto updated = studentService.uploadPhoto(id, file);
        return ResponseEntity.ok(ApiResponse.ok("Photo uploaded successfully", updated));
    }

    // ─── META / DROPDOWNS ─────────────────────────────────────────────────────

    @GetMapping("/meta/departments")
    @Operation(summary = "Get distinct department names for dropdown")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.ok("Departments fetched", studentService.getDistinctDepartments()));
    }

    @GetMapping("/meta/batches")
    @Operation(summary = "Get distinct batches for dropdown")
    public ResponseEntity<ApiResponse<List<String>>> getBatches() {
        return ResponseEntity.ok(ApiResponse.ok("Batches fetched", studentService.getDistinctBatches()));
    }

    @GetMapping("/meta/sections")
    @Operation(summary = "Get sections by department")
    public ResponseEntity<ApiResponse<List<String>>> getSections(
            @RequestParam String department) {
        return ResponseEntity.ok(ApiResponse.ok("Sections fetched",
                studentService.getSectionsByDepartment(department)));
    }
}
