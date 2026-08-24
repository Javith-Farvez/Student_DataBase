-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE (KARUR - 639 111)
-- ACADEMIC DETAILS MODULE - MYSQL 8.0 DATABASE SCHEMA & SEED DATA
-- ============================================================================

USE `vsb_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `academic_details`;
CREATE TABLE `academic_details` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `student_id` BIGINT NOT NULL UNIQUE,
  
  -- Required Academic Fields
  `university_reg_no` VARCHAR(30) UNIQUE DEFAULT NULL,
  `admission_year` INT NOT NULL,
  `batch` VARCHAR(20) NOT NULL,
  `department_name` VARCHAR(100) NOT NULL,
  `degree` VARCHAR(50) NOT NULL DEFAULT 'B.E.',
  `regulation` VARCHAR(20) NOT NULL DEFAULT '2021',
  `current_year` INT NOT NULL DEFAULT 1,
  `current_semester` INT NOT NULL DEFAULT 1,
  `section_name` VARCHAR(10) NOT NULL DEFAULT 'A',
  `mentor_name` VARCHAR(100) DEFAULT NULL,
  `class_advisor` VARCHAR(100) DEFAULT NULL,
  `academic_status` VARCHAR(20) DEFAULT 'ACTIVE',
  `last_promotion_date` DATETIME DEFAULT NULL,

  -- System Timestamps
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  INDEX `idx_acad_dept_year` (`department_name`, `current_year`, `current_semester`, `section_name`),
  INDEX `idx_acad_batch` (`batch`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SEED DATA FOR ACADEMIC DETAILS LINKED TO EXISTING STUDENTS
-- ============================================================================

INSERT INTO `academic_details` (
  `student_id`, `university_reg_no`, `admission_year`, `batch`, `department_name`,
  `degree`, `regulation`, `current_year`, `current_semester`, `section_name`,
  `mentor_name`, `class_advisor`, `academic_status`, `last_promotion_date`
) VALUES
(1, '922521104001', 2021, '2021-2025', 'Artificial Intelligence & Data Science', 'B.E.', '2021', 3, 6, 'A', 'Prof. M. Rajesh', 'Dr. K. Senthil Kumar', 'ACTIVE', NOW()),
(2, '922521104002', 2021, '2021-2025', 'Artificial Intelligence & Data Science', 'B.E.', '2021', 3, 6, 'A', 'Prof. M. Rajesh', 'Dr. K. Senthil Kumar', 'ACTIVE', NOW()),
(3, '922521104003', 2021, '2021-2025', 'Computer Science & Engineering', 'B.E.', '2021', 3, 6, 'B', 'Dr. A. Ramesh', 'Prof. S. Priya', 'ACTIVE', NOW()),
(4, '922522104004', 2022, '2022-2026', 'Electronics & Communication Engineering', 'B.E.', '2021', 2, 4, 'A', 'Dr. P. Murugan', 'Prof. J. Balaji', 'ACTIVE', NOW());
