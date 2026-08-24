package com.vsb.erp.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Role-Based Protected Dashboards", description = "Endpoints restricted by Spring Security Role-Based Access Control")
public class DashboardController {

    @GetMapping("/principal/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    @Operation(summary = "Principal Executive Dashboard Data", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getPrincipalSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "PRINCIPAL");
        data.put("totalDepartments", 7);
        data.put("totalStudents", 2840);
        data.put("totalStaff", 148);
        data.put("totalHods", 7);
        
        Map<String, Integer> deptCounts = new HashMap<>();
        deptCounts.put("CSE", 720);
        deptCounts.put("AIDS", 480);
        deptCounts.put("ECE", 640);
        deptCounts.put("EEE", 420);
        deptCounts.put("MECH", 380);
        deptCounts.put("CIVIL", 200);
        deptCounts.put("IT", 320);
        data.put("departmentWiseStudents", deptCounts);

        Map<String, Integer> yearCounts = new HashMap<>();
        yearCounts.put("1st Year", 750);
        yearCounts.put("2nd Year", 720);
        yearCounts.put("3rd Year", 690);
        yearCounts.put("4th Year", 680);
        data.put("yearWiseStudents", yearCounts);

        data.put("attendancePercentage", 95.8);
        data.put("placementPercentage", 94.2);
        data.put("passPercentage", 96.4);
        data.put("totalCollegeFees", "₹ 18.50 Crores");
        data.put("hostelFees", "₹ 4.20 Crores");
        data.put("busFees", "₹ 2.80 Crores");
        data.put("pendingFees", "₹ 45.20 Lakhs");
        data.put("arrearRate", "3.2%");
        data.put("arrearStudentCount", 91);
        data.put("aiGraduationPrediction", "98.2%");
        data.put("message", "Authorized Principal Executive Analytics");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/hod/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD')")
    @Operation(summary = "HOD Department Scoped Dashboard", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getHodSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "HOD");
        data.put("departmentCode", "AIDS");
        data.put("departmentName", "Artificial Intelligence & Data Science");
        data.put("hodName", "Dr. K. Senthil Kumar");
        data.put("enrolledStudents", 480);
        data.put("facultyCount", 24);
        data.put("passPercentage", 97.2);
        data.put("placementPercentage", 96.5);
        data.put("attendancePercentage", 96.8);
        data.put("arrearCount", 8);
        data.put("feeStatus", "94.2% Paid (₹ 3.50 L Dues)");
        data.put("semesterResultsAverage", 8.85);
        data.put("message", "Authorized HOD Department Scoped Analytics");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/staff/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'STAFF')")
    @Operation(summary = "Staff Class Scoped Dashboard", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getStaffSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "STAFF");
        data.put("assignedClasses", new String[]{"III AI & DS - A", "II AI & DS - B", "IV AI & DS - A"});
        data.put("totalAssignedStudents", 180);
        data.put("pendingMarkEntry", "IA2 Generative AI & LLMs");
        data.put("message", "Authorized Faculty / Staff Class Workspace");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/staff/classes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'STAFF')")
    @Operation(summary = "Get Assigned Classes for Staff Member", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getStaffAssignedClasses() {
        Map<String, Object> data = new HashMap<>();
        data.put("staffId", "STF001");
        data.put("staffName", "Prof. M. Rajesh");
        data.put("classes", new Object[]{
            Map.of("id", "cls-3aids-a", "name", "III AI & DS - A", "year", 3, "sem", 6, "sec", "A", "subject", "AD3651 - LLMs"),
            Map.of("id", "cls-2aids-b", "name", "II AI & DS - B", "year", 2, "sem", 4, "sec", "B", "subject", "CS3491 - AI & ML"),
            Map.of("id", "cls-4aids-a", "name", "IV AI & DS - A", "year", 4, "sem", 8, "sec", "A", "subject", "PW3812 - Project Phase II")
        });
        return ResponseEntity.ok(data);
    }

    @GetMapping("/student/summary")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'HOD', 'STAFF', 'STUDENT')")
    @Operation(summary = "Student Personal Profile Dashboard", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getStudentSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "STUDENT");
        data.put("registerNumber", "922521104001");
        data.put("cgpa", 8.92);
        data.put("sgpa", 9.10);
        data.put("attendancePct", 95.4);
        data.put("feeBalance", 0.00);
        data.put("placementStatus", "Eligible / Selected");
        data.put("message", "Authorized Student Personal Profile");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/office/summary")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'OFFICE_ADMIN')")
    @Operation(summary = "Office Administrator Dashboard", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getOfficeSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "OFFICE_ADMIN");
        data.put("totalFeeCollected", "₹ 5.82 Crores");
        data.put("pendingCertificates", 14);
        data.put("busRoutesActive", 32);
        data.put("hostelAllocations", 850);
        data.put("message", "Authorized Office Administration Portal");
        return ResponseEntity.ok(data);
    }

    @GetMapping("/placement/summary")
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'PLACEMENT_OFFICER')")
    @Operation(summary = "Placement Officer Dashboard", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> getPlacementSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("role", "PLACEMENT_OFFICER");
        data.put("placedStudents", 620);
        data.put("highestPackage", "28 LPA");
        data.put("averagePackage", "6.5 LPA");
        data.put("visitedCompanies", 84);
        data.put("message", "Authorized Placement & Training Portal");
        return ResponseEntity.ok(data);
    }
}
