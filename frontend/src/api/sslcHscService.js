/**
 * V.S.B ENGINEERING COLLEGE — VSB SmartCampus ERP
 * SSLC & HSC Academic Module API Service
 * All REST calls to /api/v1/sslc-hsc/*
 */

const API_BASE = 'http://127.0.0.1:8000/api/v1/sslc-hsc';

const headers = { 'Content-Type': 'application/json' };

// ─────────────────────────────────────────────────────────────
//  READ
// ─────────────────────────────────────────────────────────────

/** Get both SSLC + HSC records for a student */
export async function getStudentAcademicHistory(studentId) {
  const res = await fetch(`${API_BASE}/student/${studentId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** List all SSLC records (optional filters) */
export async function listSSLCRecords({ board, passingYear, minPercentage, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (board) params.append('board', board);
  if (passingYear) params.append('passing_year', passingYear);
  if (minPercentage) params.append('min_percentage', minPercentage);
  params.append('limit', limit);
  const res = await fetch(`${API_BASE}/sslc?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** List all HSC records (optional filters) */
export async function listHSCRecords({ board, passingYear, stream, minPercentage, limit = 100 } = {}) {
  const params = new URLSearchParams();
  if (board) params.append('board', board);
  if (passingYear) params.append('passing_year', passingYear);
  if (stream) params.append('stream', stream);
  if (minPercentage) params.append('min_percentage', minPercentage);
  params.append('limit', limit);
  const res = await fetch(`${API_BASE}/hsc?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  CREATE
// ─────────────────────────────────────────────────────────────

/** Create new SSLC record */
export async function createSSLC(data) {
  const res = await fetch(`${API_BASE}/sslc`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create SSLC record');
  }
  return res.json();
}

/** Create new HSC record */
export async function createHSC(data) {
  const res = await fetch(`${API_BASE}/hsc`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create HSC record');
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  UPDATE
// ─────────────────────────────────────────────────────────────

/** Update existing SSLC record by ID */
export async function updateSSLC(recordId, data) {
  const res = await fetch(`${API_BASE}/sslc/${recordId}`, {
    method: 'PUT', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update SSLC record');
  }
  return res.json();
}

/** Update existing HSC record by ID */
export async function updateHSC(recordId, data) {
  const res = await fetch(`${API_BASE}/hsc/${recordId}`, {
    method: 'PUT', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update HSC record');
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  UPSERT (create or update)
// ─────────────────────────────────────────────────────────────

/** Upsert SSLC — creates if not exists, updates if exists */
export async function upsertSSLC(data) {
  const res = await fetch(`${API_BASE}/sslc/upsert`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to save SSLC record');
  }
  return res.json();
}

/** Upsert HSC — creates if not exists, updates if exists */
export async function upsertHSC(data) {
  const res = await fetch(`${API_BASE}/hsc/upsert`, {
    method: 'POST', headers, body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to save HSC record');
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  DELETE
// ─────────────────────────────────────────────────────────────

/** Delete SSLC record by ID */
export async function deleteSSLC(recordId) {
  const res = await fetch(`${API_BASE}/sslc/${recordId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Delete HSC record by ID */
export async function deleteHSC(recordId) {
  const res = await fetch(`${API_BASE}/hsc/${recordId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────────────────────

/** Summary statistics report (aggregate) */
export async function getSummaryReport() {
  const res = await fetch(`${API_BASE}/reports/summary`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Per-student detailed report */
export async function getStudentReport(studentId) {
  const res = await fetch(`${API_BASE}/reports/student/${studentId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Top performers by SSLC or HSC */
export async function getTopPerformers(exam = 'hsc', limit = 20) {
  const res = await fetch(`${API_BASE}/reports/top-performers?exam=${exam}&limit=${limit}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─────────────────────────────────────────────────────────────
//  UTILITY: Cutoff Calculator (mirrors backend formula)
// ─────────────────────────────────────────────────────────────

/**
 * Tamil Nadu HSC Cutoff Formula:
 *   Cutoff (out of 200) = Physics/2 + Chemistry/2 + Maths (or Bio/CS)
 */
export function calculateHSCCutoff({ physics = 0, chemistry = 0, mathematics = 0, biology = 0, computer_science = 0, bio_cs_subject = 'Biology' }) {
  const p = (Number(physics) || 0) / 2;
  const c = (Number(chemistry) || 0) / 2;
  const m = bio_cs_subject === 'Computer Science'
    ? (Number(computer_science) || Number(mathematics) || 0)
    : (Number(mathematics) || Number(biology) || 0);
  return Math.round((p + c + m) * 100) / 100;
}

/** Auto compute SSLC percentage from subject marks */
export function calculateSSLCPercentage(subjects) {
  const vals = Object.values(subjects).filter(v => v !== null && v !== undefined && !isNaN(Number(v)));
  if (!vals.length) return null;
  const sum = vals.reduce((a, b) => a + Number(b), 0);
  return Math.round((sum / (vals.length * 100)) * 10000) / 100;
}
