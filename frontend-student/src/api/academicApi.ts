import axios from 'axios'
import type {
  SslcDetail, HscDetail,
  SslcDetailFormData, HscDetailFormData,
  StudentAcademicProfile, SslcReports, HscReports,
} from '@/types/academic'

const api = axios.create({ baseURL: '/api/v1/academic' })

// ── Helper ────────────────────────────────────────────────────────────────────
type ApiResp<T> = { success: boolean; data: T; message?: string }
type Paged<T>   = { content: T[]; totalElements: number; totalPages: number; number: number; size: number }

// ── SSLC (10th) ───────────────────────────────────────────────────────────────
export const getSslcList = (params: Record<string, unknown>) =>
  api.get<ApiResp<Paged<SslcDetail>>>('/sslc', { params }).then(r => r.data)

export const getSslcById = (id: number) =>
  api.get<ApiResp<SslcDetail>>(`/sslc/${id}`).then(r => r.data)

export const getSslcByStudentId = (studentId: number) =>
  api.get<ApiResp<SslcDetail>>(`/sslc/student/${studentId}`).then(r => r.data)

export const createSslc = (data: SslcDetailFormData) =>
  api.post<ApiResp<SslcDetail>>('/sslc', data).then(r => r.data)

export const updateSslc = (id: number, data: SslcDetailFormData) =>
  api.put<ApiResp<SslcDetail>>(`/sslc/${id}`, data).then(r => r.data)

export const deleteSslc = (id: number) =>
  api.delete<ApiResp<void>>(`/sslc/${id}`).then(r => r.data)

export const getSslcReports = () =>
  api.get<ApiResp<SslcReports>>('/sslc/reports').then(r => r.data)

// ── HSC (12th) ────────────────────────────────────────────────────────────────
export const getHscList = (params: Record<string, unknown>) =>
  api.get<ApiResp<Paged<HscDetail>>>('/hsc', { params }).then(r => r.data)

export const getHscById = (id: number) =>
  api.get<ApiResp<HscDetail>>(`/hsc/${id}`).then(r => r.data)

export const getHscByStudentId = (studentId: number) =>
  api.get<ApiResp<HscDetail>>(`/hsc/student/${studentId}`).then(r => r.data)

export const createHsc = (data: HscDetailFormData) =>
  api.post<ApiResp<HscDetail>>('/hsc', data).then(r => r.data)

export const updateHsc = (id: number, data: HscDetailFormData) =>
  api.put<ApiResp<HscDetail>>(`/hsc/${id}`, data).then(r => r.data)

export const deleteHsc = (id: number) =>
  api.delete<ApiResp<void>>(`/hsc/${id}`).then(r => r.data)

export const getHscReports = () =>
  api.get<ApiResp<HscReports>>('/hsc/reports').then(r => r.data)

// ── Combined ─────────────────────────────────────────────────────────────────
export const getStudentAcademicProfile = (studentId: number) =>
  api.get<ApiResp<StudentAcademicProfile>>(`/student/${studentId}`).then(r => r.data)

export const getAcademicMeta = () =>
  api.get<ApiResp<Record<string, unknown>>>('/meta').then(r => r.data)
