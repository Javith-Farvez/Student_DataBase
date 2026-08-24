-- ============================================================================
-- V.S.B. ENGINEERING COLLEGE (KARUR - 639 111)
-- Campus360 AI ERP — SSLC & HSC Academic Module
-- Migration: Add sslc_details + hsc_details Tables
-- Compatible with: SQLite (primary) | MySQL 8 | PostgreSQL 14+
-- ============================================================================

-- ============================================================
-- TABLE: sslc_details (10th Standard Academic Records)
-- ============================================================

-- SQLite Version (primary)
CREATE TABLE IF NOT EXISTS sslc_details (
    id                  TEXT NOT NULL PRIMARY KEY,              -- UUID
    student_id          TEXT NOT NULL UNIQUE,                   -- FK → students.id
    school_name         TEXT,                                   -- Name of the school
    board               TEXT,                                   -- State Board / CBSE / ICSE / Matric
    passing_year        INTEGER,                                -- e.g. 2021
    register_number     TEXT,                                   -- Hall ticket / Register No
    total_marks         REAL,                                   -- Sum of all subjects
    max_marks           REAL DEFAULT 500.0,                     -- Maximum possible marks
    percentage          REAL,                                   -- Computed or entered
    -- Subject-wise marks (out of 100 each)
    tamil               REAL,
    english             REAL,
    mathematics         REAL,
    science             REAL,
    social_science      REAL,
    optional_subject    TEXT,                                   -- Name of optional 6th subject
    optional_marks      REAL,
    remarks             TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sslc_student ON sslc_details(student_id);
CREATE INDEX IF NOT EXISTS idx_sslc_board ON sslc_details(board);
CREATE INDEX IF NOT EXISTS idx_sslc_year ON sslc_details(passing_year);
CREATE INDEX IF NOT EXISTS idx_sslc_pct ON sslc_details(percentage);


-- ============================================================
-- TABLE: hsc_details (12th Standard Academic Records)
-- ============================================================

CREATE TABLE IF NOT EXISTS hsc_details (
    id                  TEXT NOT NULL PRIMARY KEY,              -- UUID
    student_id          TEXT NOT NULL UNIQUE,                   -- FK → students.id
    school_name         TEXT,                                   -- Name of the school
    board               TEXT,                                   -- State Board / CBSE / ICSE / Matric
    passing_year        INTEGER,                                -- e.g. 2023
    register_number     TEXT,                                   -- Hall ticket / Register No
    stream              TEXT DEFAULT 'Science',                 -- Science / Commerce / Arts
    total_marks         REAL,                                   -- Sum of all subjects
    max_marks           REAL DEFAULT 600.0,                     -- Maximum possible marks
    percentage          REAL,                                   -- Computed or entered
    cutoff              REAL,                                   -- Out of 200 (TN formula: Phy/2 + Chem/2 + Maths/Bio)
    -- Subject-wise marks (out of 100 each)
    physics             REAL,
    chemistry           REAL,
    mathematics         REAL,
    biology             REAL,                                   -- For Biology stream
    computer_science    REAL,                                   -- For CS stream
    language1           REAL,                                   -- Tamil / Hindi / Other Part I
    language2           REAL,                                   -- English Part II
    bio_cs_subject      TEXT DEFAULT 'Biology',                 -- 'Biology' or 'Computer Science'
    remarks             TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hsc_student ON hsc_details(student_id);
CREATE INDEX IF NOT EXISTS idx_hsc_board ON hsc_details(board);
CREATE INDEX IF NOT EXISTS idx_hsc_year ON hsc_details(passing_year);
CREATE INDEX IF NOT EXISTS idx_hsc_pct ON hsc_details(percentage);
CREATE INDEX IF NOT EXISTS idx_hsc_cutoff ON hsc_details(cutoff);


-- ============================================================
-- MySQL 8 Equivalent (run on MySQL server)
-- ============================================================

/*
CREATE TABLE IF NOT EXISTS `sslc_details` (
    `id`               VARCHAR(36) NOT NULL,
    `student_id`       VARCHAR(36) NOT NULL UNIQUE,
    `school_name`      VARCHAR(255) DEFAULT NULL,
    `board`            VARCHAR(100) DEFAULT NULL  COMMENT 'State Board / CBSE / ICSE / Matric',
    `passing_year`     SMALLINT DEFAULT NULL,
    `register_number`  VARCHAR(100) DEFAULT NULL,
    `total_marks`      FLOAT DEFAULT NULL,
    `max_marks`        FLOAT DEFAULT 500.0,
    `percentage`       FLOAT DEFAULT NULL,
    `tamil`            FLOAT DEFAULT NULL,
    `english`          FLOAT DEFAULT NULL,
    `mathematics`      FLOAT DEFAULT NULL,
    `science`          FLOAT DEFAULT NULL,
    `social_science`   FLOAT DEFAULT NULL,
    `optional_subject` VARCHAR(100) DEFAULT NULL,
    `optional_marks`   FLOAT DEFAULT NULL,
    `remarks`          TEXT DEFAULT NULL,
    `created_at`       DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    INDEX `idx_sslc_board` (`board`),
    INDEX `idx_sslc_year` (`passing_year`),
    INDEX `idx_sslc_pct` (`percentage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='SSLC / 10th Standard Academic Records';

CREATE TABLE IF NOT EXISTS `hsc_details` (
    `id`               VARCHAR(36) NOT NULL,
    `student_id`       VARCHAR(36) NOT NULL UNIQUE,
    `school_name`      VARCHAR(255) DEFAULT NULL,
    `board`            VARCHAR(100) DEFAULT NULL  COMMENT 'State Board / CBSE / ICSE / Matric',
    `passing_year`     SMALLINT DEFAULT NULL,
    `register_number`  VARCHAR(100) DEFAULT NULL,
    `stream`           VARCHAR(50) DEFAULT 'Science',
    `total_marks`      FLOAT DEFAULT NULL,
    `max_marks`        FLOAT DEFAULT 600.0,
    `percentage`       FLOAT DEFAULT NULL,
    `cutoff`           FLOAT DEFAULT NULL          COMMENT 'Out of 200 — TN formula: Phy/2 + Chem/2 + Maths/Bio',
    `physics`          FLOAT DEFAULT NULL,
    `chemistry`        FLOAT DEFAULT NULL,
    `mathematics`      FLOAT DEFAULT NULL,
    `biology`          FLOAT DEFAULT NULL,
    `computer_science` FLOAT DEFAULT NULL,
    `language1`        FLOAT DEFAULT NULL,
    `language2`        FLOAT DEFAULT NULL,
    `bio_cs_subject`   VARCHAR(50) DEFAULT 'Biology',
    `remarks`          TEXT DEFAULT NULL,
    `created_at`       DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
    INDEX `idx_hsc_board` (`board`),
    INDEX `idx_hsc_year` (`passing_year`),
    INDEX `idx_hsc_pct` (`percentage`),
    INDEX `idx_hsc_cutoff` (`cutoff`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='HSC / 12th Standard Academic Records';
*/


-- ============================================================
-- PostgreSQL Equivalent (run on PostgreSQL server)
-- ============================================================

/*
CREATE TABLE IF NOT EXISTS sslc_details (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    school_name      VARCHAR(255),
    board            VARCHAR(100),
    passing_year     SMALLINT,
    register_number  VARCHAR(100),
    total_marks      NUMERIC(6,2),
    max_marks        NUMERIC(6,2) DEFAULT 500.0,
    percentage       NUMERIC(5,2),
    tamil            NUMERIC(5,2),
    english          NUMERIC(5,2),
    mathematics      NUMERIC(5,2),
    science          NUMERIC(5,2),
    social_science   NUMERIC(5,2),
    optional_subject VARCHAR(100),
    optional_marks   NUMERIC(5,2),
    remarks          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hsc_details (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    school_name      VARCHAR(255),
    board            VARCHAR(100),
    passing_year     SMALLINT,
    register_number  VARCHAR(100),
    stream           VARCHAR(50) DEFAULT 'Science',
    total_marks      NUMERIC(7,2),
    max_marks        NUMERIC(7,2) DEFAULT 600.0,
    percentage       NUMERIC(5,2),
    cutoff           NUMERIC(5,2),
    physics          NUMERIC(5,2),
    chemistry        NUMERIC(5,2),
    mathematics      NUMERIC(5,2),
    biology          NUMERIC(5,2),
    computer_science NUMERIC(5,2),
    language1        NUMERIC(5,2),
    language2        NUMERIC(5,2),
    bio_cs_subject   VARCHAR(50) DEFAULT 'Biology',
    remarks          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
*/
