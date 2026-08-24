-- =============================================================================
-- V.S.B ENGINEERING COLLEGE ERP — PRODUCTION MYSQL DATABASE SCHEMA
-- Database: vsb_smartcampus_db
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `vsb_smartcampus_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vsb_smartcampus_db`;

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS `departments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `hod_user_id` VARCHAR(36) DEFAULT NULL,
  `established_year` INT DEFAULT 2002,
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ROLE PERMISSIONS LINK
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. USERS TABLE (Admin, Principal, HOD, Staff)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role_id` INT NOT NULL,
  `department_id` VARCHAR(36) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `failed_login_attempts` INT DEFAULT 0,
  `account_locked_until` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  INDEX `idx_users_employee` (`employee_id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. COURSES & REGULATIONS
CREATE TABLE IF NOT EXISTS `regulations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE, -- e.g. R2021, R2023
  `name` VARCHAR(100) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `degree` VARCHAR(20) DEFAULT 'B.E.',
  `duration_years` INT DEFAULT 4,
  `department_id` VARCHAR(36) NOT NULL,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ACADEMIC YEARS & SEMESTERS & SECTIONS
CREATE TABLE IF NOT EXISTS `academic_years` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `year_label` VARCHAR(20) NOT NULL UNIQUE, -- e.g. 2025-2026
  `is_current` BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `semesters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `semester_number` INT NOT NULL, -- 1 to 8
  `academic_year_id` INT NOT NULL,
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `section_name` CHAR(1) NOT NULL, -- A, B, C
  `department_id` VARCHAR(36) NOT NULL,
  `year_level` INT NOT NULL, -- 1, 2, 3, 4
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `credits` INT DEFAULT 3,
  `subject_type` ENUM('THEORY', 'LAB', 'EMBEDDED') DEFAULT 'THEORY',
  `department_id` VARCHAR(36) NOT NULL,
  `semester_number` INT NOT NULL,
  `regulation_id` INT DEFAULT 1,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`),
  FOREIGN KEY (`regulation_id`) REFERENCES `regulations`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. STAFF CLASS ASSIGNMENTS (Admin assigns staff to class & subject)
CREATE TABLE IF NOT EXISTS `staff_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `staff_user_id` VARCHAR(36) NOT NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `year_level` INT NOT NULL, -- 1, 2, 3, 4
  `section_name` CHAR(1) NOT NULL, -- A, B
  `subject_id` VARCHAR(36) NOT NULL,
  `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`staff_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`),
  UNIQUE KEY `uk_staff_class_subject` (`staff_user_id`, `department_id`, `year_level`, `section_name`, `subject_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. LOGIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS `login_history` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `login_identifier` VARCHAR(100) NOT NULL,
  `role_name` VARCHAR(50) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('SUCCESS', 'FAILED', 'LOCKED') NOT NULL,
  `failure_reason` VARCHAR(255) DEFAULT NULL,
  `login_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_user` (`user_id`),
  INDEX `idx_history_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(100) NOT NULL, -- e.g. 'CREATE_USER', 'UPLOAD_MARKS', 'MARK_ATTENDANCE'
  `module` VARCHAR(50) NOT NULL,
  `target_id` VARCHAR(100) DEFAULT NULL,
  `details_json` JSON DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. SUBJECT MARKS TABLE
CREATE TABLE IF NOT EXISTS `subject_marks` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `student_register_number` VARCHAR(50) NOT NULL,
  `semester_number` INT NOT NULL, -- 1 to 8
  `subject_code` VARCHAR(20) NOT NULL,
  `subject_title` VARCHAR(150) NOT NULL,
  `credits` INT DEFAULT 3,
  `internal_1` DECIMAL(5,2) DEFAULT 0,
  `internal_2` DECIMAL(5,2) DEFAULT 0,
  `assignment_1` DECIMAL(5,2) DEFAULT 0,
  `assignment_2` DECIMAL(5,2) DEFAULT 0,
  `model_exam` DECIMAL(5,2) DEFAULT 0,
  `final_internal` DECIMAL(5,2) DEFAULT 0,
  `external_mark` DECIMAL(5,2) DEFAULT 0,
  `total_mark` DECIMAL(5,2) DEFAULT 0,
  `grade` VARCHAR(5) DEFAULT 'U', -- O, A+, A, B+, B, C, U
  `grade_point` INT DEFAULT 0, -- 10, 9, 8, 7, 6, 5, 0
  `result` ENUM('PASS', 'FAIL', 'ARREAR', 'ABSENT') DEFAULT 'PASS',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_sem_subject` (`student_register_number`, `semester_number`, `subject_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. SEMESTER SGPA & CGPA RESULTS TABLE
CREATE TABLE IF NOT EXISTS `semester_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_register_number` VARCHAR(50) NOT NULL,
  `semester_number` INT NOT NULL,
  `sgpa` DECIMAL(4,2) DEFAULT 0.00,
  `total_credits_earned` INT DEFAULT 0,
  `is_completed` BOOLEAN DEFAULT FALSE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_sem_result` (`student_register_number`, `semester_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. ACADEMIC AUDIT LOGS TABLE (Marks History Trail)
CREATE TABLE IF NOT EXISTS `academic_audit_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `student_register_number` VARCHAR(50) NOT NULL,
  `semester_number` INT NOT NULL,
  `subject_code` VARCHAR(20) NOT NULL,
  `field_name` VARCHAR(50) NOT NULL, -- e.g. 'internal_1', 'external_mark'
  `previous_mark` VARCHAR(50) DEFAULT NULL,
  `new_mark` VARCHAR(50) DEFAULT NULL,
  `updated_by` VARCHAR(100) NOT NULL,
  `reason_for_change` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. DEPARTMENT DETAILS TABLES
CREATE TABLE IF NOT EXISTS `department_details` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL UNIQUE,
  `about` TEXT DEFAULT NULL,
  `vision` TEXT DEFAULT NULL,
  `mission` TEXT DEFAULT NULL,
  `contact_email` VARCHAR(150) DEFAULT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `building_location` VARCHAR(150) DEFAULT NULL,
  `official_url` TEXT DEFAULT NULL,
  `banner_image_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_programmes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `programme_name` VARCHAR(150) NOT NULL,
  `degree` VARCHAR(20) DEFAULT 'B.E.',
  `duration` VARCHAR(50) DEFAULT '4 Years',
  `started_year` INT DEFAULT NULL,
  `sanctioned_intake` INT DEFAULT 60,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_facilities` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `facility_name` VARCHAR(150) NOT NULL,
  `facility_type` VARCHAR(50) DEFAULT 'Laboratory',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_labs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `lab_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `specs` TEXT DEFAULT NULL,
  `equipment` TEXT DEFAULT NULL,
  `lab_incharge` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_faculty` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `faculty_name` VARCHAR(150) NOT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `qualification` VARCHAR(100) DEFAULT NULL,
  `specialization` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `profile_image` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_statistics` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `stat_type` VARCHAR(50) NOT NULL,
  `stat_key` VARCHAR(100) NOT NULL,
  `stat_value` VARCHAR(100) NOT NULL,
  `year_label` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_mous` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `organization` VARCHAR(200) NOT NULL,
  `purpose` TEXT NOT NULL,
  `year` INT DEFAULT NULL,
  `mou_type` VARCHAR(50) DEFAULT 'Industry',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_research` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `authors_or_area` VARCHAR(255) DEFAULT NULL,
  `journal_or_conf` VARCHAR(255) DEFAULT NULL,
  `year` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_accreditation` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL UNIQUE,
  `nba_status` VARCHAR(100) DEFAULT 'Applied / Eligible',
  `naac_status` VARCHAR(100) DEFAULT 'NAAC ''A'' Grade',
  `anna_univ_affiliation` VARCHAR(150) DEFAULT 'Permanently Affiliated',
  `aicte_approval` VARCHAR(150) DEFAULT 'Approved by AICTE',
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_syllabus` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `regulation` VARCHAR(50) DEFAULT 'R2021',
  `semester_number` INT NOT NULL,
  `subject_code` VARCHAR(20) NOT NULL,
  `subject_title` VARCHAR(150) NOT NULL,
  `credits` DECIMAL(3,1) DEFAULT 3.0,
  `syllabus_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `department_links` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `department_id` VARCHAR(36) NOT NULL,
  `link_title` VARCHAR(150) NOT NULL,
  `url` TEXT NOT NULL,
  `link_type` VARCHAR(50) DEFAULT 'Official Website',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- SEED SAMPLE DATA (ROLES & DEPARTMENTS & INITIAL USERS)
-- =============================================================================

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'SUPER_ADMIN', 'Unrestricted full access to entire ERP system'),
(2, 'PRINCIPAL', 'Executive institutional access to view all departments and analytics'),
(3, 'HOD', 'Department-scoped executive access'),
(4, 'STAFF', 'Class & subject scoped faculty access')
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `departments` (`id`, `code`, `name`, `established_year`) VALUES
('dept-it', 'IT', 'Information Technology', 2007),
('dept-cse', 'CSE', 'Computer Science and Engineering', 2002),
('dept-aids', 'AIDS', 'Artificial Intelligence and Data Science', 2021),
('dept-aiml', 'AIML', 'Artificial Intelligence and Machine Learning', 2022),
('dept-csbs', 'CSBS', 'Computer Science and Business System', 2021),
('dept-cce', 'CCE', 'Computer and Communication Engineering', 2021),
('dept-ece', 'ECE', 'Electronics and Communication Engineering', 2002),
('dept-eee', 'EEE', 'Electrical and Electronics Engineering', 2002),
('dept-mech', 'MECH', 'Mechanical Engineering', 2004),
('dept-chem', 'CHEM', 'Chemical Engineering', 2018),
('dept-civil', 'CIVIL', 'Civil Engineering', 2011)
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `users` (`id`, `employee_id`, `full_name`, `email`, `password_hash`, `role_id`, `department_id`, `designation`) VALUES
('user-admin-1', 'ADMIN001', 'Dr. V.S.B Administrator', 'admin@vsb.ac.in', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 1, 'dept-cse', 'Super Admin'),
('user-prin-1', 'PRIN001', 'Dr. V.S.B Principal', 'principal@vsb.ac.in', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 2, 'dept-cse', 'Principal'),
('user-hod-1', 'HOD001', 'Dr. K. Senthil Kumar', 'hod.aids@vsb.ac.in', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 3, 'dept-aids', 'HOD AI&DS'),
('user-stf-1', 'STF001', 'Prof. M. Rajesh', 'staff.aids@vsb.ac.in', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 4, 'dept-aids', 'Assistant Professor')
ON DUPLICATE KEY UPDATE `full_name`=`full_name`;

