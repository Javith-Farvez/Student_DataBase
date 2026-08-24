/**
 * VSB SmartCampus — Certificates Service
 */
import api from './apiClient';

// Get all certificates for a student
export const getStudentCertificates = (studentId) =>
  api.get(`/certificates/${studentId}`);

// Add a certificate
export const addCertificate = (studentId, data) =>
  api.post(`/certificates/${studentId}`, data);

// Update a certificate
export const updateCertificate = (certificateId, data) =>
  api.put(`/certificates/${certificateId}`, data);

// Delete (archive) a certificate
export const archiveCertificate = (certificateId) =>
  api.delete(`/certificates/${certificateId}`);

// Generate bonafide certificate
export const generateBonafide = (studentId) =>
  api.post(`/certificates/${studentId}/bonafide`, {});

// Generate study certificate
export const generateStudyCertificate = (studentId) =>
  api.post(`/certificates/${studentId}/study`, {});

// Generate no-due certificate
export const generateNoDue = (studentId) =>
  api.post(`/certificates/${studentId}/no-due`, {});

// Upload certificate file
export const uploadCertificateFile = (certificateId, formData) =>
  api.upload(`/certificates/${certificateId}/upload`, formData);
