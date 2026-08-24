package com.vsb.erp.repository;

import com.vsb.erp.dto.StudentSearchCriteriaDTO;
import com.vsb.erp.entity.StudentMaster;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class StudentSpecification {

    public static Specification<StudentMaster> buildSpecification(StudentSearchCriteriaDTO criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Universal Search (Register No, Student Name, Roll No, Admission No)
            if (criteria.getSearch() != null && !criteria.getSearch().trim().isEmpty()) {
                String searchPattern = "%" + criteria.getSearch().trim().toLowerCase() + "%";
                Predicate regNoMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("registerNumber")), searchPattern);
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), searchPattern);
                Predicate rollNoMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("rollNumber")), searchPattern);
                Predicate admNoMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("admissionNumber")), searchPattern);

                predicates.add(criteriaBuilder.or(regNoMatch, nameMatch, rollNoMatch, admNoMatch));
            }

            // 2. Department Filter
            if (criteria.getDepartment() != null && !criteria.getDepartment().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("departmentName")), criteria.getDepartment().trim().toLowerCase()));
            }

            // 3. Current Year Filter
            if (criteria.getYear() != null && criteria.getYear() > 0) {
                predicates.add(criteriaBuilder.equal(root.get("currentYear"), criteria.getYear()));
            }

            // 4. Current Semester Filter
            if (criteria.getSemester() != null && criteria.getSemester() > 0) {
                predicates.add(criteriaBuilder.equal(root.get("currentSemester"), criteria.getSemester()));
            }

            // 5. Section Filter
            if (criteria.getSection() != null && !criteria.getSection().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("sectionName")), criteria.getSection().trim().toLowerCase()));
            }

            // 6. Community Filter
            if (criteria.getCommunity() != null && !criteria.getCommunity().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("community")), criteria.getCommunity().trim().toLowerCase()));
            }

            // 7. Batch Filter
            if (criteria.getBatch() != null && !criteria.getBatch().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("batch"), criteria.getBatch().trim()));
            }

            // 8. Gender Filter
            if (criteria.getGender() != null && !criteria.getGender().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("gender")), criteria.getGender().trim().toLowerCase()));
            }

            // 9. Residence Type Filter (DAY_SCHOLAR / HOSTELLER)
            if (criteria.getResidenceType() != null && !criteria.getResidenceType().trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("residenceType"), criteria.getResidenceType().trim()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
