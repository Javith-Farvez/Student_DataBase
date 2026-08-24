-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE — ACADEMIC DETAILS MODULE
-- MySQL 8.0 Schema — Linked to Student Master via student_id FK
-- ============================================================================

USE `vsb_erp_db`;

-- ─── ACADEMIC DETAILS TABLE ───────────────────────────────────────────────────
DROP TABLE IF EXISTS `academic_details`;
CREATE TABLE `academic_details` (
  `id`                   BIGINT AUTO_INCREMENT NOT NULL,

  -- FK to Student Master
  `student_id`           BIGINT NOT NULL,

  -- Denormalized for fast queries without joins
  `register_number`      VARCHAR(30) NOT NULL,
  `university_reg_no`    VARCHAR(30) DEFAULT NULL,

  -- Academic Fields
  `department_name`      VARCHAR(150) NOT NULL,
  `degree`               VARCHAR(50)  DEFAULT 'B.E.',
  `batch`                VARCHAR(20)  NOT NULL,
  `admission_year`       INT NOT NULL,
  `regulation`           VARCHAR(20)  DEFAULT '2021',
  `current_year`         INT NOT NULL,
  `current_semester`     INT NOT NULL,
  `section_name`         VARCHAR(10)  NOT NULL,
  `mentor_name`          VARCHAR(100) DEFAULT NULL,
  `class_advisor`        VARCHAR(100) DEFAULT NULL,

  -- Auto-update control
  `year_semester_auto`   TINYINT(1)   DEFAULT 1 COMMENT '1 = auto-compute Year/Sem on schedule',
  `last_auto_updated`    DATETIME     DEFAULT NULL,

  -- Academic Status & Notes
  `academic_status`      VARCHAR(20)  DEFAULT 'ACTIVE',
  `remarks`              TEXT         DEFAULT NULL,

  -- System Metadata
  `created_at`           DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ad_student_id`       (`student_id`),
  UNIQUE KEY `uk_ad_register_number`  (`register_number`),
  INDEX `idx_ad_dept_batch`           (`department_name`, `batch`),
  INDEX `idx_ad_year_sem`             (`current_year`, `current_semester`),
  INDEX `idx_ad_section`              (`section_name`),
  INDEX `idx_ad_status`               (`academic_status`),

  CONSTRAINT `fk_ad_student`
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SEED — Create Academic Records from Existing Students ────────────────────
-- Populates academic_details from existing student rows
INSERT INTO `academic_details` (
  `student_id`, `register_number`, `university_reg_no`,
  `department_name`, `degree`, `batch`, `admission_year`, `regulation`,
  `current_year`, `current_semester`, `section_name`,
  `mentor_name`, `class_advisor`, `academic_status`
)
SELECT
  s.`id`,
  s.`register_number`,
  s.`university_reg_no`,
  s.`department_name`,
  COALESCE(s.`degree`, 'B.E.'),
  s.`batch`,
  s.`admission_year`,
  COALESCE(s.`regulation`, '2021'),
  s.`current_year`,
  s.`current_semester`,
  s.`section_name`,
  s.`mentor_name`,
  s.`class_advisor`,
  s.`student_status`
FROM `students` s
ON DUPLICATE KEY UPDATE
  `department_name` = s.`department_name`,
  `updated_at`      = CURRENT_TIMESTAMP;

-- ─── VERIFY ──────────────────────────────────────────────────────────────────
SELECT
  ad.id,
  ad.register_number,
  s.full_name,
  ad.department_name,
  ad.batch,
  ad.current_year,
  ad.current_semester,
  ad.section_name
FROM academic_details ad
JOIN students s ON s.id = ad.student_id
ORDER BY ad.register_number;
