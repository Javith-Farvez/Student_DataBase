package com.vsb.erp.controller;

import com.vsb.erp.dto.AcademicDetailsDTO;
import com.vsb.erp.dto.AcademicPromotionDTO;
import com.vsb.erp.service.AcademicDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic")
@CrossOrigin(origins = "*", maxAge = 3600)
@Tag(name = "Academic Details Management", description = "REST APIs for Student Academic Profile Management & Automated Year/Semester Progression")
public class AcademicDetailsController {

    @Autowired
    private AcademicDetailsService academicService;

    @Operation(summary = "Get Academic Details by Student ID", description = "Retrieves student's academic record including Degree, Regulation, Year, Semester, Section, Mentor, Class Advisor")
    @GetMapping("/student/{studentId}")
    public ResponseEntity<AcademicDetailsDTO> getAcademicDetails(@PathVariable Long studentId) {
        AcademicDetailsDTO dto = academicService.getAcademicDetailsByStudentId(studentId);
        return ResponseEntity.ok(dto);
    }

    @Operation(summary = "Create or Update Academic Details", description = "Saves or modifies student academic details and synchronizes with Student Master Profile")
    @PutMapping("/student/{studentId}")
    public ResponseEntity<AcademicDetailsDTO> updateAcademicDetails(
            @PathVariable Long studentId,
            @Valid @RequestBody AcademicDetailsDTO dto) {
        AcademicDetailsDTO updated = academicService.createOrUpdateAcademicDetails(studentId, dto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Auto-Promote Student Year & Semester", description = "Automatically increments student semester (+1) and recalculates Year (1 to 4) automatically")
    @PostMapping("/promote/{studentId}")
    public ResponseEntity<AcademicDetailsDTO> autoPromoteStudent(@PathVariable Long studentId) {
        AcademicDetailsDTO promoted = academicService.autoPromoteStudent(studentId);
        return ResponseEntity.ok(promoted);
    }

    @Operation(summary = "Bulk Auto-Promote Class Batch", description = "Bulk promotes all students in a specified Department/Year/Semester/Batch")
    @PostMapping("/promote-batch")
    public ResponseEntity<AcademicPromotionDTO> autoPromoteBatch(@RequestBody AcademicPromotionDTO promotionDTO) {
        AcademicPromotionDTO result = academicService.autoPromoteBatch(promotionDTO);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Filter Academic Records", description = "Filters academic roster by Department, Year, Semester, Section, or Batch")
    @GetMapping
    public ResponseEntity<List<AcademicDetailsDTO>> filterAcademicRecords(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String batch
    ) {
        List<AcademicDetailsDTO> list = academicService.filterAcademicRecords(department, year, semester, section, batch);
        return ResponseEntity.ok(list);
    }
}
