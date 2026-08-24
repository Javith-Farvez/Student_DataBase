/**
 * VSB SmartCampus — Fees Service
 * Covers college fees, hostel, transport, scholarship records.
 */
import api from './apiClient';

// ── Fee Records ────────────────────────────────────────────────────────────────
export const getStudentFees = (studentId) =>
  api.get(`/financial/fees/${studentId}`);

export const getYearwiseFees = (studentId) =>
  api.get(`/financial/fees/${studentId}/yearwise`);

export const getSemesterFees = (studentId) =>
  api.get(`/financial/fees/${studentId}/semester`);

export const updateFeeRecord = (recordId, data) =>
  api.put(`/financial/fees/record/${recordId}`, data);

// ── Payments ───────────────────────────────────────────────────────────────────
export const getPaymentHistory = (studentId) =>
  api.get(`/financial/payments/${studentId}`);

export const addPayment = (studentId, data) =>
  api.post(`/financial/payments/${studentId}`, data);

// ── Fee Defaulters ─────────────────────────────────────────────────────────────
export const getFeeDefaulters = (params) =>
  api.get('/financial/defaulters', params);

// ── Hostel ─────────────────────────────────────────────────────────────────────
export const getHostelRecord = (studentId) =>
  api.get(`/financial/hostel/${studentId}`);

export const getHostelHistory = (studentId) =>
  api.get(`/financial/hostel/${studentId}/history`);

export const updateHostelRecord = (studentId, data) =>
  api.put(`/financial/hostel/${studentId}`, data);

// ── Transport ─────────────────────────────────────────────────────────────────
export const getTransportRecord = (studentId) =>
  api.get(`/financial/transport/${studentId}`);

export const getTransportHistory = (studentId) =>
  api.get(`/financial/transport/${studentId}/history`);

export const updateTransportRecord = (studentId, data) =>
  api.put(`/financial/transport/${studentId}`, data);

// ── Scholarship ────────────────────────────────────────────────────────────────
export const getScholarships = (studentId) =>
  api.get(`/financial/scholarships/${studentId}`);

export const addScholarship = (studentId, data) =>
  api.post(`/financial/scholarships/${studentId}`, data);

export const updateScholarship = (scholarshipId, data) =>
  api.put(`/financial/scholarships/${scholarshipId}`, data);

// ── Bank Details ───────────────────────────────────────────────────────────────
export const getBankDetails = (studentId) =>
  api.get(`/financial/bank/${studentId}`);

// ── Fee Summary (for reports) ──────────────────────────────────────────────────
export const getFeeSummary = (params) =>
  api.get('/financial/summary', params);
