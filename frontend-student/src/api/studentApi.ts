import axios from 'axios';
import type {
  ApiResponse,
  PagedResponse,
  Student,
  StudentFormData,
  StudentSummary,
} from '@/types/student';

// Base API client — proxied by Vite to http://localhost:8080
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vsb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Student API ──────────────────────────────────────────────────────────────

export interface StudentListParams {
  search?: string;
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
  community?: string;
  batch?: string;
  gender?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

/** Get paginated student list with optional filters */
export const getStudents = async (
  params: StudentListParams
): Promise<ApiResponse<PagedResponse<StudentSummary>>> => {
  // Strip empty params
  const cleaned: Record<string, string | number> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = v;
  });
  const res = await api.get('/students', { params: cleaned });
  return res.data;
};

/** Get full student by ID */
export const getStudentById = async (
  id: number
): Promise<ApiResponse<Student>> => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

/** Get student by register number */
export const getStudentByRegisterNumber = async (
  regNo: string
): Promise<ApiResponse<Student>> => {
  const res = await api.get(`/students/register/${regNo}`);
  return res.data;
};

/** Create student */
export const createStudent = async (
  data: Partial<StudentFormData>
): Promise<ApiResponse<Student>> => {
  const res = await api.post('/students', data);
  return res.data;
};

/** Update student */
export const updateStudent = async (
  id: number,
  data: Partial<StudentFormData>
): Promise<ApiResponse<Student>> => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};

/** Delete student */
export const deleteStudent = async (
  id: number
): Promise<ApiResponse<void>> => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

/** Upload photo */
export const uploadStudentPhoto = async (
  id: number,
  file: File
): Promise<ApiResponse<Student>> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/students/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** Get departments for dropdown */
export const getDepartments = async (): Promise<ApiResponse<string[]>> => {
  const res = await api.get('/students/meta/departments');
  return res.data;
};

/** Get batches for dropdown */
export const getBatches = async (): Promise<ApiResponse<string[]>> => {
  const res = await api.get('/students/meta/batches');
  return res.data;
};
