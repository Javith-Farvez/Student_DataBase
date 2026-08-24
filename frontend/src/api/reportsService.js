/**
 * VSB SmartCampus — Reports Service
 */
import api, { BASE_URL, getToken } from './apiClient';

// ── Report URLs (for iframe/new tab PDF) ──────────────────────────────────────
export const getReportUrl = (type, params = {}) => {
  const token = getToken();
  const qs = new URLSearchParams({ ...params, token }).toString();
  return `${BASE_URL}/reports/${type}?${qs}`;
};

// ── Student Reports ───────────────────────────────────────────────────────────
export const getStudentListReport = (params) =>
  api.get('/reports/students', params);

export const getStudentProfileReport = (studentId) =>
  api.get(`/reports/students/${studentId}/profile`);

// ── Academic Reports ──────────────────────────────────────────────────────────
export const getSemesterResultReport = (params) =>
  api.get('/reports/results', params);

export const getMarkSheetReport = (studentId, semester) =>
  api.get(`/reports/marksheet/${studentId}`, { semester });

export const getSGPACGPAReport = (params) =>
  api.get('/reports/sgpa-cgpa', params);

export const getArrearReport = (params) =>
  api.get('/reports/arrears', params);

// ── Attendance Reports ────────────────────────────────────────────────────────
export const getAttendanceReport = (params) =>
  api.get('/reports/attendance', params);

export const getAttendanceShortageReport = (params) =>
  api.get('/reports/attendance/shortage', params);

// ── Fee Reports ───────────────────────────────────────────────────────────────
export const getFeeCollectionReport = (params) =>
  api.get('/reports/fees/collection', params);

export const getFeeDefaulterReport = (params) =>
  api.get('/reports/fees/defaulters', params);

// ── Placement Reports ─────────────────────────────────────────────────────────
export const getPlacementReport = (params) =>
  api.get('/reports/placement', params);

// ── Department Strength ───────────────────────────────────────────────────────
export const getDeptStrengthReport = (params) =>
  api.get('/reports/department-strength', params);
