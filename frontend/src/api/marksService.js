/**
 * VSB SmartCampus — Marks Service
 * Covers internal marks, assignment marks, semester marks, SGPA, CGPA, arrears.
 */
import api from './apiClient';

// ── Internal Marks ────────────────────────────────────────────────────────────
export const getInternalMarks = (studentId, semester) =>
  api.get(`/academic/internal-marks/${studentId}`, { semester });

export const saveInternalMarks = (data) =>
  api.post('/academic/internal-marks', data);

export const saveInternal1Marks = (data) =>
  api.post('/academic/internal-1-marks', data);

export const saveInternal2Marks = (data) =>
  api.post('/academic/internal-2-marks', data);

// ── Assignment Marks ──────────────────────────────────────────────────────────
export const getAssignmentMarks = (studentId, semester) =>
  api.get(`/academic/assignment-marks/${studentId}`, { semester });

export const saveAssignmentMarks = (data) =>
  api.post('/academic/assignment-marks', data);

// ── Lab Marks ─────────────────────────────────────────────────────────────────
export const getLabMarks = (studentId, semester) =>
  api.get(`/academic/lab-marks/${studentId}`, { semester });

export const saveLabMarks = (data) =>
  api.post('/academic/lab-marks', data);

// ── Semester/University Exam Marks ────────────────────────────────────────────
export const getSemesterMarks = (studentId, semester) =>
  api.get(`/academic/semester-marks/${studentId}`, { semester });

export const saveSemesterMarks = (data) =>
  api.post('/academic/semester-marks', data);

// ── Subject Results ───────────────────────────────────────────────────────────
export const getSubjectResults = (studentId, semester) =>
  api.get(`/academic/results/${studentId}`, { semester });

// ── SGPA ─────────────────────────────────────────────────────────────────────
export const getSGPA = (studentId) =>
  api.get(`/academic/sgpa/${studentId}`);

export const calculateSGPA = (studentId, semester) =>
  api.post(`/academic/sgpa/calculate`, { student_id: studentId, semester });

// ── CGPA ─────────────────────────────────────────────────────────────────────
export const getCGPA = (studentId) =>
  api.get(`/academic/cgpa/${studentId}`);

export const calculateCGPA = (studentId) =>
  api.post(`/academic/cgpa/calculate`, { student_id: studentId });

// ── Arrears ───────────────────────────────────────────────────────────────────
export const getArrears = (studentId) =>
  api.get(`/academic/arrears/${studentId}`);

export const addArrear = (data) =>
  api.post('/academic/arrears', data);

export const updateArrear = (arrearId, data) =>
  api.put(`/academic/arrears/${arrearId}`, data);

// ── Bulk class marks (Staff view) ─────────────────────────────────────────────
export const getClassMarks = (params) =>
  api.get('/academic/class-marks', params);

export const saveClassMarksBulk = (data) =>
  api.post('/academic/class-marks/bulk', data);

// ── Semester Results ──────────────────────────────────────────────────────────
export const getSemesterResults = (studentId) =>
  api.get(`/academic/semester-results/${studentId}`);
