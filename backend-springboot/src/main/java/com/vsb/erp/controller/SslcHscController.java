package com.vsb.erp.controller;

import com.vsb.erp.dto.*;
import com.vsb.erp.service.SslcHscService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for SSLC (10th) & HSC (12th) Academic Module
 * Base URL: /api/v1/academic
 */
@RestController
@RequestMapping("/api/v1/academic")
@RequiredArgsConstructor
@Tag(name = "SSLC & HSC Academic", description = "Manage 10th and 12th academic records integrated with Student Master")
@SecurityRequirement(name = "bearerAuth")
public class SslcHscController {

    private final SslcHscService service;

    // ══════════════════════════════════════════════════════════════════════════
    // SSLC (10th) ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping("/sslc")
    @Operation(summary = "Create SSLC record for a student")
    public ResponseEntity<ApiResponse<SslcDetailResponseDto>> createSslc(
            @Valid @RequestBody SslcDetailRequestDto req) {
        SslcDetailResponseDto dto = service.createSslc(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "SSLC record created successfully"));
    }

    @GetMapping("/sslc/{id}")
    @Operation(summary = "Get SSLC record by ID")
    public ResponseEntity<ApiResponse<SslcDetailResponseDto>> getSslcById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getSslcById(id)));
    }

    @GetMapping("/sslc/student/{studentId}")
    @Operation(summary = "Get SSLC record by student ID")
    public ResponseEntity<ApiResponse<SslcDetailResponseDto>> getSslcByStudentId(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getSslcByStudentId(studentId)));
    }

    @PutMapping("/sslc/{id}")
    @Operation(summary = "Update SSLC record")
    public ResponseEntity<ApiResponse<SslcDetailResponseDto>> updateSslc(
            @PathVariable Long id,
            @Valid @RequestBody SslcDetailRequestDto req) {
        return ResponseEntity.ok(ApiResponse.success(service.updateSslc(id, req), "SSLC record updated"));
    }

    @DeleteMapping("/sslc/{id}")
    @Operation(summary = "Delete SSLC record")
    public ResponseEntity<ApiResponse<Void>> deleteSslc(@PathVariable Long id) {
        service.deleteSslc(id);
        return ResponseEntity.ok(ApiResponse.success(null, "SSLC record deleted"));
    }

    @GetMapping("/sslc")
    @Operation(summary = "List SSLC records with filters and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<SslcDetailResponseDto>>> listSslc(
            @Parameter(description = "Search by name or register number") @RequestParam(required = false) String search,
            @RequestParam(required = false) String board,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String result,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "id")   String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                service.listSslc(search, board, year, department, result, page, size, sortBy, sortDir)));
    }

    @GetMapping("/sslc/reports")
    @Operation(summary = "Get SSLC reports — board-wise, year-wise, department-wise stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSslcReports() {
        return ResponseEntity.ok(ApiResponse.success(service.getSslcReports(), "SSLC report data"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HSC (12th) ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @PostMapping("/hsc")
    @Operation(summary = "Create HSC record for a student")
    public ResponseEntity<ApiResponse<HscDetailResponseDto>> createHsc(
            @Valid @RequestBody HscDetailRequestDto req) {
        HscDetailResponseDto dto = service.createHsc(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(dto, "HSC record created successfully"));
    }

    @GetMapping("/hsc/{id}")
    @Operation(summary = "Get HSC record by ID")
    public ResponseEntity<ApiResponse<HscDetailResponseDto>> getHscById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.getHscById(id)));
    }

    @GetMapping("/hsc/student/{studentId}")
    @Operation(summary = "Get HSC record by student ID")
    public ResponseEntity<ApiResponse<HscDetailResponseDto>> getHscByStudentId(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getHscByStudentId(studentId)));
    }

    @PutMapping("/hsc/{id}")
    @Operation(summary = "Update HSC record")
    public ResponseEntity<ApiResponse<HscDetailResponseDto>> updateHsc(
            @PathVariable Long id,
            @Valid @RequestBody HscDetailRequestDto req) {
        return ResponseEntity.ok(ApiResponse.success(service.updateHsc(id, req), "HSC record updated"));
    }

    @DeleteMapping("/hsc/{id}")
    @Operation(summary = "Delete HSC record")
    public ResponseEntity<ApiResponse<Void>> deleteHsc(@PathVariable Long id) {
        service.deleteHsc(id);
        return ResponseEntity.ok(ApiResponse.success(null, "HSC record deleted"));
    }

    @GetMapping("/hsc")
    @Operation(summary = "List HSC records with filters and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<HscDetailResponseDto>>> listHsc(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String board,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String groupName,
            @RequestParam(required = false) String result,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "10")   int size,
            @RequestParam(defaultValue = "id")   String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                service.listHsc(search, board, year, department, groupName, result, page, size, sortBy, sortDir)));
    }

    @GetMapping("/hsc/reports")
    @Operation(summary = "Get HSC reports — board-wise, group-wise, cutoff stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHscReports() {
        return ResponseEntity.ok(ApiResponse.success(service.getHscReports(), "HSC report data"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // COMBINED ENDPOINTS
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/student/{studentId}")
    @Operation(summary = "Get combined SSLC + HSC academic profile for a student")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentAcademicProfile(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(
                service.getStudentAcademicProfile(studentId),
                "Academic profile for student " + studentId));
    }

    @GetMapping("/meta")
    @Operation(summary = "Get dropdown meta: boards, groups, etc.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMeta() {
        return ResponseEntity.ok(ApiResponse.success(service.getMeta()));
    }
}
