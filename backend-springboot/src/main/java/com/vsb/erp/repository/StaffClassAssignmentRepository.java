package com.vsb.erp.repository;

import com.vsb.erp.entity.StaffClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffClassAssignmentRepository extends JpaRepository<StaffClassAssignment, Long> {
    List<StaffClassAssignment> findByUserId(String userId);
    List<StaffClassAssignment> findByDepartmentId(Long departmentId);
}
