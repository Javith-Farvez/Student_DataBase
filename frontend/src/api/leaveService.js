/**
 * VSB SmartCampus — Leave & OD Service
 */
import api from './apiClient';

// ── Leave Requests ────────────────────────────────────────────────────────────
export const getLeaveRequests = (studentId) =>
  api.get(`/leaves/${studentId}`);

export const submitLeaveRequest = (studentId, data) =>
  api.post(`/leaves/${studentId}`, data);

export const approveLeave = (leaveId, data) =>
  api.put(`/leaves/${leaveId}/approve`, data);

export const rejectLeave = (leaveId, data) =>
  api.put(`/leaves/${leaveId}/reject`, data);

// Get pending leaves for a class advisor
export const getPendingLeaves = (params) =>
  api.get('/leaves/pending', params);

// ── OD Requests ───────────────────────────────────────────────────────────────
export const getODRequests = (studentId) =>
  api.get(`/od/${studentId}`);

export const submitODRequest = (studentId, data) =>
  api.post(`/od/${studentId}`, data);

export const approveOD = (odId, data) =>
  api.put(`/od/${odId}/approve`, data);

export const rejectOD = (odId, data) =>
  api.put(`/od/${odId}/reject`, data);

export const getPendingODs = (params) =>
  api.get('/od/pending', params);
