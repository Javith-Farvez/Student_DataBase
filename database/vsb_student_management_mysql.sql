-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE (KARUR - 639 111)
-- STUDENT MASTER MODULE — COMPLETE MySQL 8.0 SCHEMA
-- Includes: all 50+ fields across 7 sections + indexes + seed data
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `vsb_erp_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vsb_erp_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id`         VARCHAR(36)  NOT NULL,
  `code`       VARCHAR(20)  NOT NULL UNIQUE,
  `name`       VARCHAR(150) NOT NULL,
  `hod_name`   VARCHAR(150) DEFAULT NULL,
  `status`     VARCHAR(20)  DEFAULT 'Active',
  `created_at` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── STUDENT MASTER ───────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id`                         BIGINT AUTO_INCREMENT NOT NULL,

  -- Personal Details
  `register_number`            VARCHAR(30) NOT NULL,
  `university_reg_no`          VARCHAR(30) DEFAULT NULL,
  `admission_number`           VARCHAR(30) NOT NULL,
  `roll_number`                VARCHAR(30) NOT NULL,
  `full_name`                  VARCHAR(100) NOT NULL,
  `photo_url`                  LONGTEXT DEFAULT NULL,
  `gender`                     VARCHAR(10) NOT NULL,
  `date_of_birth`              DATE NOT NULL,
  `blood_group`                VARCHAR(12) DEFAULT NULL,
  `aadhaar_number`             VARCHAR(20) DEFAULT NULL,
  `mobile_number`              VARCHAR(15) NOT NULL,
  `email`                      VARCHAR(100) NOT NULL,

  -- Parent Details
  `father_name`                VARCHAR(100) DEFAULT NULL,
  `father_occupation`          VARCHAR(100) DEFAULT NULL,
  `father_mobile`              VARCHAR(15)  DEFAULT NULL,
  `mother_name`                VARCHAR(100) DEFAULT NULL,
  `mother_occupation`          VARCHAR(100) DEFAULT NULL,
  `mother_mobile`              VARCHAR(15)  DEFAULT NULL,
  `guardian_name`              VARCHAR(100) DEFAULT NULL,
  `guardian_mobile`            VARCHAR(15)  DEFAULT NULL,

  -- Address Details
  `current_address`            TEXT DEFAULT NULL,
  `permanent_address`          TEXT DEFAULT NULL,
  `district`                   VARCHAR(60)  DEFAULT NULL,
  `state`                      VARCHAR(60)  DEFAULT 'Tamil Nadu',
  `pincode`                    VARCHAR(10)  DEFAULT NULL,

  -- Community Details
  `religion`                   VARCHAR(50) DEFAULT NULL,
  `community`                  VARCHAR(10) DEFAULT NULL,
  `caste`                      VARCHAR(60) DEFAULT NULL,
  `sub_caste`                  VARCHAR(60) DEFAULT NULL,
  `nationality`                VARCHAR(50) DEFAULT 'Indian',
  `native_district`            VARCHAR(60) DEFAULT NULL,
  `first_graduate`             TINYINT(1)  DEFAULT 0,

  -- Academic Details
  `department_name`            VARCHAR(150) NOT NULL,
  `degree`                     VARCHAR(50)  DEFAULT 'B.E.',
  `batch`                      VARCHAR(20)  NOT NULL,
  `admission_year`             INT NOT NULL,
  `regulation`                 VARCHAR(20)  DEFAULT '2021',
  `current_year`               INT NOT NULL,
  `current_semester`           INT NOT NULL,
  `section_name`               VARCHAR(10)  NOT NULL,
  `mentor_name`                VARCHAR(100) DEFAULT NULL,
  `class_advisor`              VARCHAR(100) DEFAULT NULL,
  `student_status`             VARCHAR(20)  DEFAULT 'ACTIVE',

  -- Transport & Accommodation
  `residence_type`             VARCHAR(20)  DEFAULT 'DAY_SCHOLAR',
  `bus_route`                  VARCHAR(100) DEFAULT NULL,
  `boarding_point`             VARCHAR(100) DEFAULT NULL,
  `hostel_block`               VARCHAR(50)  DEFAULT NULL,
  `room_number`                VARCHAR(20)  DEFAULT NULL,

  -- Emergency Contact
  `emergency_contact_name`     VARCHAR(100) DEFAULT NULL,
  `emergency_contact_relation` VARCHAR(50)  DEFAULT NULL,
  `emergency_contact_mobile`   VARCHAR(15)  DEFAULT NULL,

  -- System Metadata
  `created_at`                 DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`                 DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_register_number`   (`register_number`),
  UNIQUE KEY `uk_university_reg_no` (`university_reg_no`),
  UNIQUE KEY `uk_admission_number`  (`admission_number`),
  UNIQUE KEY `uk_roll_number`       (`roll_number`),
  UNIQUE KEY `uk_email`             (`email`),
  UNIQUE KEY `uk_aadhaar_number`    (`aadhaar_number`),

  INDEX `idx_dept_year_sec`         (`department_name`, `current_year`, `section_name`),
  INDEX `idx_community`             (`community`),
  INDEX `idx_batch`                 (`batch`),
  INDEX `idx_gender`                (`gender`),
  INDEX `idx_status`                (`student_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ─── SEED DEPARTMENTS ────────────────────────────────────────────────────────
INSERT INTO `departments` (`id`, `code`, `name`, `hod_name`) VALUES
('dept-cse',  'CSE',   'Computer Science & Engineering',               'Dr. A. Ramesh'),
('dept-aids', 'AIDS',  'Artificial Intelligence & Data Science',       'Dr. K. Senthil Kumar'),
('dept-ece',  'ECE',   'Electronics & Communication Engineering',      'Dr. P. Murugan'),
('dept-eee',  'EEE',   'Electrical & Electronics Engineering',         'Dr. R. Vignesh'),
('dept-mech', 'MECH',  'Mechanical Engineering',                       'Dr. S. Karthik'),
('dept-civil','CIVIL', 'Civil Engineering',                            'Dr. M. Anand'),
('dept-it',   'IT',    'Information Technology',                       'Dr. L. Suresh');

-- ─── SEED STUDENTS ────────────────────────────────────────────────────────────
INSERT INTO `students` (
  `register_number`, `university_reg_no`, `admission_number`, `roll_number`,
  `full_name`, `gender`, `date_of_birth`, `blood_group`, `aadhaar_number`,
  `mobile_number`, `email`,
  `father_name`, `father_occupation`, `father_mobile`,
  `mother_name`, `mother_occupation`, `mother_mobile`,
  `guardian_name`, `guardian_mobile`,
  `current_address`, `permanent_address`, `district`, `state`, `pincode`,
  `religion`, `community`, `caste`, `nationality`, `first_graduate`,
  `admission_year`, `batch`, `degree`, `department_name`, `regulation`,
  `current_year`, `current_semester`, `section_name`,
  `mentor_name`, `class_advisor`, `student_status`, `residence_type`,
  `bus_route`, `boarding_point`, `hostel_block`, `room_number`,
  `emergency_contact_name`, `emergency_contact_relation`, `emergency_contact_mobile`
) VALUES
-- Student 1
('922521104001', '922521104001', 'ADM2021001', '21AD001',
 'Aarav Sharma', 'MALE', '2003-05-14', 'O_POSITIVE', '678912345678',
 '9876543210', 'aarav.sharma@vsb.ac.in',
 'Ramesh Sharma', 'Business', '9876543211',
 'Sunita Sharma', 'Homemaker', '9876543212',
 'Ramesh Sharma', '9876543211',
 '124 College Road, Karur', '124 College Road, Karur', 'Karur', 'Tamil Nadu', '639111',
 'Hindu', 'BC', 'Kongu Vellalar', 'Indian', 1,
 2021, '2021-2025', 'B.E.', 'Artificial Intelligence & Data Science', '2021',
 3, 6, 'A',
 'Prof. M. Rajesh', 'Dr. K. Senthil Kumar', 'ACTIVE', 'DAY_SCHOLAR',
 'Route 4 - Karur Bus Stand', 'Karur Collectorate', NULL, NULL,
 'Ramesh Sharma', 'Father', '9876543211'),

-- Student 2
('922521104002', '922521104002', 'ADM2021002', '21AD002',
 'Ananya Krishnan', 'FEMALE', '2003-08-22', 'A_POSITIVE', '891234567890',
 '9876543220', 'ananya.k@vsb.ac.in',
 'Krishnan S', 'Engineer', '9876543221',
 'Lakshmi K', 'Teacher', '9876543222',
 'Krishnan S', '9876543221',
 'Girls Hostel Block A, VSB Campus', '45 North Street, Trichy', 'Tiruchirappalli', 'Tamil Nadu', '620001',
 'Hindu', 'OC', 'Iyer', 'Indian', 0,
 2021, '2021-2025', 'B.E.', 'Artificial Intelligence & Data Science', '2021',
 3, 6, 'A',
 'Prof. M. Rajesh', 'Dr. K. Senthil Kumar', 'ACTIVE', 'HOSTELLER',
 NULL, NULL, 'Block A', '204',
 'Krishnan S', 'Father', '9876543221'),

-- Student 3
('922521101001', '922521101001', 'ADM2021003', '21CS001',
 'Vikas Sundaram', 'MALE', '2003-03-10', 'B_POSITIVE', '456789123456',
 '9876543230', 'vikas.s@vsb.ac.in',
 'Sundaram V', 'Government Employee', '9876543231',
 'Meena S', 'Bank Staff', '9876543232',
 'Sundaram V', '9876543231',
 'Boys Hostel Block B, VSB Campus', '88 South Car St, Madurai', 'Madurai', 'Tamil Nadu', '625001',
 'Hindu', 'MBC', 'Vanniyar', 'Indian', 1,
 2021, '2021-2025', 'B.E.', 'Computer Science & Engineering', '2021',
 3, 6, 'B',
 'Dr. A. Ramesh', 'Prof. S. Priya', 'ACTIVE', 'HOSTELLER',
 NULL, NULL, 'Block B', '108',
 'Sundaram V', 'Father', '9876543231'),

-- Student 4
('922522103001', '922522103001', 'ADM2022010', '22EC001',
 'Kavitha Ramachandran', 'FEMALE', '2004-11-05', 'AB_POSITIVE', '345678912345',
 '9876543240', 'kavitha.r@vsb.ac.in',
 'Ramachandran N', 'Farmer', '9876543241',
 'Devi R', 'Homemaker', '9876543242',
 'Ramachandran N', '9876543241',
 '22 Salem Main Road, Namakkal', '22 Salem Main Road, Namakkal', 'Namakkal', 'Tamil Nadu', '637001',
 'Hindu', 'SC', 'Adi Dravida', 'Indian', 1,
 2022, '2022-2026', 'B.E.', 'Electronics & Communication Engineering', '2021',
 2, 4, 'A',
 'Dr. P. Murugan', 'Prof. J. Balaji', 'ACTIVE', 'DAY_SCHOLAR',
 'Route 12 - Namakkal', 'Velur Bus Stop', NULL, NULL,
 'Ramachandran N', 'Father', '9876543241'),

-- Student 5
('922523105001', '922523105001', 'ADM2023001', '23ME001',
 'Pradeep Kumar', 'MALE', '2005-01-20', 'O_NEGATIVE', '234567891234',
 '9876543250', 'pradeep.k@vsb.ac.in',
 'Kumar P', 'Mechanic', '9876543251',
 'Selvi K', 'Homemaker', '9876543252',
 'Kumar P', '9876543251',
 'New Bus Stand Road, Karur', 'New Bus Stand Road, Karur', 'Karur', 'Tamil Nadu', '639001',
 'Hindu', 'MBC', 'Nadar', 'Indian', 1,
 2023, '2023-2027', 'B.E.', 'Mechanical Engineering', '2021',
 1, 2, 'A',
 'Prof. R. Kannan', 'Dr. S. Karthik', 'ACTIVE', 'DAY_SCHOLAR',
 'Route 1 - Karur Town', 'Clock Tower', NULL, NULL,
 'Kumar P', 'Father', '9876543251');

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT COUNT(*) AS total_students FROM students;
SELECT COUNT(*) AS total_departments FROM departments;
