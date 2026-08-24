/**
 * VSB SmartCampus — Documents Service
 */
import api, { BASE_URL, getToken } from './apiClient';

// List all documents for a student
export const getStudentDocuments = (studentId) =>
  api.get(`/documents/${studentId}`);

// Upload a document
export const uploadDocument = (studentId, formData) =>
  api.upload(`/documents/${studentId}/upload`, formData);

// Verify a document
export const verifyDocument = (documentId, data) =>
  api.put(`/documents/${documentId}/verify`, data);

// Reject a document
export const rejectDocument = (documentId, reason) =>
  api.put(`/documents/${documentId}/reject`, { reason });

// Delete a document
export const deleteDocument = (documentId) =>
  api.delete(`/documents/${documentId}`);

// Get document download URL
export const getDocumentDownloadUrl = (documentId) =>
  `${BASE_URL}/documents/${documentId}/download?token=${getToken()}`;

// Get document access log
export const getDocumentAccessLog = (studentId) =>
  api.get(`/documents/${studentId}/access-log`);

// Replace a document (new version)
export const replaceDocument = (documentId, formData) =>
  api.upload(`/documents/${documentId}/replace`, formData);
