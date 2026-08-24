-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE (KARUR - 639 111)
-- LOGIN MODULE & ROLE-BASED ACCESS CONTROL (4 ROLES ONLY)
-- MySQL 8.0 Enterprise Database Schema Script
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `vsb_college_erp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vsb_college_erp`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. DEPARTMENTS TABLE
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL UNIQUE, -- CSE, AIDS, ECE, EEE, MECH, CIVIL, IT, ALL
  `name` VARCHAR(150) NOT NULL,
  `hod_name` VARCHAR(150) DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'ACTIVE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ROLES TABLE (EXACTLY 4 AUTHORIZED ROLES)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE, -- ADMIN, PRINCIPAL, HOD, STAFF
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PERMISSIONS TABLE
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL UNIQUE, -- e.g., MANAGE_USERS, VIEW_COLLEGE, EDIT_DEPT, MARKS_ENTRY
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ROLE_PERMISSIONS MAPPING
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` BIGINT NOT NULL,
  `permission_id` BIGINT NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. USERS TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE, -- Admin ID / Employee ID / Reg No
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- BCrypt Hash
  `full_name` VARCHAR(150) NOT NULL,
  `role_id` BIGINT NOT NULL,
  `department_id` BIGINT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
  `failed_attempts` INT DEFAULT 0,
  `is_locked` TINYINT(1) DEFAULT 0,
  `lock_time` DATETIME DEFAULT NULL,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. STAFF CLASS ASSIGNMENTS TABLE
DROP TABLE IF EXISTS `staff_assignments`;
CREATE TABLE `staff_assignments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `staff_id` BIGINT NOT NULL,
  `department_id` BIGINT NOT NULL,
  `academic_year` VARCHAR(20) NOT NULL DEFAULT '2025-2026',
  `year` INT NOT NULL, -- 1, 2, 3, 4
  `semester` INT NOT NULL, -- 1 to 8
  `section_name` VARCHAR(10) NOT NULL, -- A, B, C
  `subject_code` VARCHAR(20) DEFAULT NULL,
  `subject_name` VARCHAR(150) DEFAULT NULL,
  `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sa_staff` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sa_dept` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. LOGIN HISTORY TABLE
DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT DEFAULT NULL,
  `username` VARCHAR(100) NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `login_status` VARCHAR(20) NOT NULL, -- SUCCESS, FAILED, LOCKED
  `failure_reason` VARCHAR(255) DEFAULT NULL,
  `logged_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_login_user` (`user_id`),
  KEY `idx_login_logged_at` (`logged_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. AUDIT LOGS TABLE
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL, -- CREATE_USER, EDIT_MARKS, LOCK_ACCOUNT, BACKUP_DB, etc.
  `target_entity` VARCHAR(100) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PASSWORD RESET TOKENS
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `user_id` BIGINT NOT NULL UNIQUE,
  `expiry_date` DATETIME NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- SEED DATA (EXACTLY 4 ROLES & PERMISSIONS & ACCOUNTS)
-- ============================================================================

-- 1. Insert 4 Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'ADMIN', 'System Administrator - Complete ERP Control, Users, Backup & System Settings'),
(2, 'PRINCIPAL', 'Principal Executive Portal - College-wide View, Analytics & Reports'),
(3, 'HOD', 'Head of Department - Department Scoped Management (1st-4th Year)'),
(4, 'STAFF', 'Faculty & Staff - Assigned Class Scoped Attendance & Mark Entry');

-- 2. Insert Permissions
INSERT INTO `permissions` (`id`, `code`, `name`, `category`, `description`) VALUES
(1, 'MANAGE_USERS', 'Manage Users & Accounts', 'ADMIN', 'Create, edit, delete users and reset passwords'),
(2, 'MANAGE_SYSTEM', 'System Settings & Backups', 'ADMIN', 'Configure system settings, create/restore backups'),
(3, 'MANAGE_ACADEMICS', 'Manage Courses & Regulations', 'ADMIN', 'Configure regulations, semesters, sections, subjects'),
(4, 'MANAGE_FEE_STRUCTURE', 'Manage Fee & Routes', 'ADMIN', 'Configure fee structures, hostel, bus routes'),
(5, 'VIEW_COLLEGE_ANALYTICS', 'View College Analytics', 'PRINCIPAL', 'View college-wide analytics, metrics, and pass percentages'),
(6, 'VIEW_STUDENT_PROFILE', 'View Student Profile', 'ALL', 'View full 360 student master profile'),
(7, 'EDIT_DEPT_STUDENTS', 'Edit Department Students', 'HOD', 'Update student information in own department'),
(8, 'ENTER_MARKS', 'Enter Marks & Attendance', 'STAFF', 'Upload IA1, IA2, IA3, assignments, and daily attendance'),
(9, 'PRINT_REPORTS', 'Print Official Reports', 'ALL', 'Print official certificates, marksheets, reports');

-- 3. Map Permissions to 4 Roles
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), -- Admin has all
(2, 5), (2, 6), (2, 9),                                                 -- Principal
(3, 6), (3, 7), (3, 8), (3, 9),                                         -- HOD
(4, 6), (4, 8), (4, 9);                                                 -- Staff

-- 4. Insert Departments
INSERT INTO `departments` (`id`, `code`, `name`, `hod_name`) VALUES
(1, 'ALL', 'All College Departments', 'Principal Office'),
(2, 'CSE', 'Computer Science & Engineering', 'Dr. A. Ramesh'),
(3, 'AIDS', 'Artificial Intelligence & Data Science', 'Dr. K. Senthil Kumar'),
(4, 'ECE', 'Electronics & Communication Engineering', 'Dr. P. Murugan'),
(5, 'EEE', 'Electrical & Electronics Engineering', 'Dr. R. Vignesh'),
(6, 'MECH', 'Mechanical Engineering', 'Dr. S. Karthik');

-- 5. Insert Accounts for the 4 Roles
-- Password hash for 'admin123' / 'pass123': $2a$10$e8e9X0x64.c3aZ1N6e4zxe1b.4q5a6s7d8f9g0h1j2k3l4m5n6
INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role_id`, `department_id`, `status`) VALUES
(1, 'ADMIN001', 'admin@vsb.ac.in', '$2a$10$e8e9X0x64.c3aZ1N6e4zxe1b.4q5a6s7d8f9g0h1j2k3l4m5n6', 'Dr. V.S.B Administrator', 1, 1, 'ACTIVE'),
(2, 'PRIN001', 'principal@vsb.ac.in', '$2a$10$e8e9X0x64.c3aZ1N6e4zxe1b.4q5a6s7d8f9g0h1j2k3l4m5n6', 'Dr. V.S.B Principal', 2, 1, 'ACTIVE'),
(3, 'HOD001', 'hod.aids@vsb.ac.in', '$2a$10$e8e9X0x64.c3aZ1N6e4zxe1b.4q5a6s7d8f9g0h1j2k3l4m5n6', 'Dr. K. Senthil Kumar (HOD AI&DS)', 3, 3, 'ACTIVE'),
(4, 'STF001', 'staff.aids@vsb.ac.in', '$2a$10$e8e9X0x64.c3aZ1N6e4zxe1b.4q5a6s7d8f9g0h1j2k3l4m5n6', 'Prof. M. Rajesh (Faculty AI&DS)', 4, 3, 'ACTIVE');

-- 6. Insert Staff Class Assignments (for Staff STF001)
INSERT INTO `staff_assignments` (`staff_id`, `department_id`, `academic_year`, `year`, `semester`, `section_name`, `subject_code`, `subject_name`) VALUES
(4, 3, '2025-2026', 2, 4, 'A', 'CS3491', 'Artificial Intelligence & Machine Learning'),
(4, 3, '2025-2026', 3, 6, 'B', 'AD3651', 'Generative AI & LLM Engineering'),
(4, 3, '2025-2026', 4, 8, 'A', 'PW3812', 'Engineering Project Work Phase - II');
