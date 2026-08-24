-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE ERP
-- SSLC (10th) & HSC (12th) ACADEMIC MODULE — MySQL 8.0 Schema
-- ============================================================================

USE `vsb_erp_db`;

-- ─── SSLC DETAILS (10th Standard) ────────────────────────────────────────────
DROP TABLE IF EXISTS `sslc_details`;
CREATE TABLE `sslc_details` (
  `id`                     BIGINT AUTO_INCREMENT NOT NULL,

  -- FK to Student Master
  `student_id`             BIGINT NOT NULL,
  `register_number`        VARCHAR(30) NOT NULL,       -- denormalized

  -- School Info
  `school_name`            VARCHAR(200) DEFAULT NULL,
  `board`                  VARCHAR(60)  DEFAULT NULL,  -- TN State Board, CBSE, ICSE, NIOS
  `passing_year`           INT          DEFAULT NULL,
  `exam_register_number`   VARCHAR(40)  DEFAULT NULL,  -- Board exam register no

  -- Marks Summary
  `total_marks`            INT          DEFAULT NULL,
  `max_marks`              INT          DEFAULT 600,
  `percentage`             DECIMAL(5,2) DEFAULT NULL,
  `grade`                  VARCHAR(5)   DEFAULT NULL,
  `result`                 VARCHAR(10)  DEFAULT 'PASS', -- PASS / FAIL

  -- Subject-Wise Marks
  `tamil_marks`            INT DEFAULT NULL,
  `english_marks`          INT DEFAULT NULL,
  `mathematics_marks`      INT DEFAULT NULL,
  `science_marks`          INT DEFAULT NULL,
  `social_science_marks`   INT DEFAULT NULL,
  `language3_subject`      VARCHAR(60)  DEFAULT NULL,  -- 3rd language name
  `language3_marks`        INT DEFAULT NULL,

  -- Metadata
  `created_at`             DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_sslc_student_id`    (`student_id`),
  UNIQUE KEY `uk_sslc_register`      (`register_number`),
  INDEX `idx_sslc_board`             (`board`),
  INDEX `idx_sslc_year`              (`passing_year`),

  CONSTRAINT `fk_sslc_student`
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── HSC DETAILS (12th Standard) ─────────────────────────────────────────────
DROP TABLE IF EXISTS `hsc_details`;
CREATE TABLE `hsc_details` (
  `id`                     BIGINT AUTO_INCREMENT NOT NULL,

  -- FK to Student Master
  `student_id`             BIGINT NOT NULL,
  `register_number`        VARCHAR(30) NOT NULL,

  -- School Info
  `school_name`            VARCHAR(200) DEFAULT NULL,
  `board`                  VARCHAR(60)  DEFAULT NULL,
  `passing_year`           INT          DEFAULT NULL,
  `exam_register_number`   VARCHAR(40)  DEFAULT NULL,
  `group_name`             VARCHAR(60)  DEFAULT NULL,   -- Bio-Maths, CS-Maths, Commerce, Arts

  -- Marks Summary
  `total_marks`            INT          DEFAULT NULL,
  `max_marks`              INT          DEFAULT 600,
  `percentage`             DECIMAL(5,2) DEFAULT NULL,
  `cutoff`                 DECIMAL(6,2) DEFAULT NULL,   -- auto-calculated
  `grade`                  VARCHAR(5)   DEFAULT NULL,
  `result`                 VARCHAR(10)  DEFAULT 'PASS',

  -- Subject-Wise Marks
  `language1_subject`      VARCHAR(60)  DEFAULT 'Tamil',
  `language1_marks`        INT DEFAULT NULL,
  `language2_subject`      VARCHAR(60)  DEFAULT 'English',
  `language2_marks`        INT DEFAULT NULL,
  `physics_marks`          INT DEFAULT NULL,
  `chemistry_marks`        INT DEFAULT NULL,
  `mathematics_marks`      INT DEFAULT NULL,
  `biology_marks`          INT DEFAULT NULL,   -- MBC/Bio group
  `computer_science_marks` INT DEFAULT NULL,   -- CS group
  `optional_subject`       VARCHAR(60)  DEFAULT NULL,
  `optional_marks`         INT DEFAULT NULL,

  -- Metadata
  `created_at`             DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_hsc_student_id`     (`student_id`),
  UNIQUE KEY `uk_hsc_register`       (`register_number`),
  INDEX `idx_hsc_board`              (`board`),
  INDEX `idx_hsc_year`               (`passing_year`),
  INDEX `idx_hsc_group`              (`group_name`),

  CONSTRAINT `fk_hsc_student`
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
-- Student 1 (id=1, register_number='922521104001')
INSERT INTO `sslc_details` (
  `student_id`,`register_number`,`school_name`,`board`,`passing_year`,
  `exam_register_number`,`total_marks`,`max_marks`,`percentage`,`grade`,`result`,
  `tamil_marks`,`english_marks`,`mathematics_marks`,`science_marks`,`social_science_marks`
) SELECT
  s.id,'922521104001','Govt. High School, Karur','Tamil Nadu State Board',2019,
  '1921104001',512,600,85.33,'A+','PASS',
  85,78,95,88,82
FROM students s WHERE s.register_number='922521104001'
ON DUPLICATE KEY UPDATE updated_at=NOW();

INSERT INTO `hsc_details` (
  `student_id`,`register_number`,`school_name`,`board`,`passing_year`,
  `exam_register_number`,`group_name`,`total_marks`,`max_marks`,`percentage`,
  `cutoff`,`grade`,`result`,
  `language1_marks`,`language2_marks`,`physics_marks`,`chemistry_marks`,
  `mathematics_marks`,`computer_science_marks`
) SELECT
  s.id,'922521104001','Govt. Hr. Sec. School, Karur','Tamil Nadu State Board',2021,
  '1922104001','CS-Maths',542,600,90.33,
  195.50,'A+','PASS',
  88,82,95,90,185,90
FROM students s WHERE s.register_number='922521104001'
ON DUPLICATE KEY UPDATE updated_at=NOW();

-- ─── VIEWS FOR REPORTS ────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW `v_student_academic_summary` AS
SELECT
  s.id           AS student_id,
  s.register_number,
  s.full_name,
  s.department_name,
  s.batch,
  -- SSLC
  sl.school_name       AS sslc_school,
  sl.board             AS sslc_board,
  sl.passing_year      AS sslc_year,
  sl.percentage        AS sslc_percentage,
  sl.grade             AS sslc_grade,
  -- HSC
  hs.school_name       AS hsc_school,
  hs.board             AS hsc_board,
  hs.passing_year      AS hsc_year,
  hs.group_name        AS hsc_group,
  hs.percentage        AS hsc_percentage,
  hs.cutoff            AS hsc_cutoff,
  hs.grade             AS hsc_grade
FROM students s
LEFT JOIN sslc_details sl ON sl.student_id = s.id
LEFT JOIN hsc_details  hs ON hs.student_id = s.id;

-- Verify
SELECT COUNT(*) AS sslc_count FROM sslc_details;
SELECT COUNT(*) AS hsc_count  FROM hsc_details;
