package com.vsb.erp.controller;

import com.vsb.erp.entity.Department;
import com.vsb.erp.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDepartmentById(@PathVariable String id) {
        try {
            Long deptId = Long.parseLong(id);
            Optional<Department> dept = departmentRepository.findById(deptId);
            return dept.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            Optional<Department> dept = departmentRepository.findByCode(id.toUpperCase());
            return dept.map(ResponseEntity::ok)
                       .orElseGet(() -> ResponseEntity.notFound().build());
        }
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        if (departmentRepository.findByCode(department.getCode().toUpperCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Department with code '" + department.getCode() + "' already exists");
        }
        department.setCode(department.getCode().toUpperCase());
        Department saved = departmentRepository.save(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        return departmentRepository.findById(id).map(existing -> {
            existing.setName(department.getName());
            existing.setHodName(department.getHodName());
            if (department.getCode() != null) existing.setCode(department.getCode().toUpperCase());
            Department updated = departmentRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        if (!departmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok("Department deleted successfully");
    }
}
