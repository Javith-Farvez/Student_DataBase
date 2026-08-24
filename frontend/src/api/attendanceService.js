/**
 * VSB SmartCampus — Attendance Service
 */
import api from './apiClient';

// Get attendance summary for a student
export const getStudentAttendance = (studentId, params = {}) =>
  api.get(`/attendance/student/${studentId}`, params);

// Get class attendance for a date
export const getClassAttendance = (params) =>
  api.get('/attendance/class', params);

// Submit bulk attendance for a class
export const submitBulkAttendance = (records) =>
  api.post('/attendance/bulk', { records });

// Get subject-wise attendance for a student
export const getSubjectAttendance = (studentId, semester) =>
  api.get(`/attendance/student/${studentId}/subjects`, { semester });

// Get attendance shortage list for a department/class
export const getAttendanceShortage = (params) =>
  api.get('/attendance/shortage', params);

// Update single attendance record
export const updateAttendance = (attendanceId, data) =>
  api.put(`/attendance/${attendanceId}`, data);

// Get monthly attendance summary
export const getMonthlyAttendance = (studentId, month, year) =>
  api.get(`/attendance/student/${studentId}/monthly`, { month, year });
