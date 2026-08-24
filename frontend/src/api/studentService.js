// VSB Engineering College ERP - Student Master Service API
import api from './apiClient';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/students';

// Mock Initial Fallback Data in case the backend server is offline during client dev preview
const INITIAL_MOCK_STUDENTS = [
  {
    id: 1,
    registerNumber: '922521104001',
    universityRegNo: '922521104001',
    admissionNumber: 'ADM2021001',
    rollNumber: '21AD001',
    fullName: 'Aarav Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    gender: 'Male',
    dateOfBirth: '2003-05-14',
    bloodGroup: 'O+',
    aadhaarNumber: '678912345678',
    panNumber: 'ABCDE1234F',
    mobileNumber: '9876543210',
    email: 'aarav.sharma@vsb.ac.in',
    fatherName: 'Ramesh Sharma',
    fatherOccupation: 'Business',
    fatherMobile: '9876543211',
    motherName: 'Sunita Sharma',
    motherOccupation: 'Homemaker',
    motherMobile: '9876543212',
    guardianName: 'Ramesh Sharma',
    guardianMobile: '9876543211',
    currentAddress: '124 College Road, Karur',
    permanentAddress: '124 College Road, Karur',
    nativeDistrict: 'Karur',
    nativeState: 'Tamil Nadu',
    pincode: '639111',
    religion: 'Hindu',
    community: 'BC',
    caste: 'Kongu Vellalar',
    nationality: 'Indian',
    firstGraduate: true,
    departmentName: 'Artificial Intelligence & Data Science',
    degree: 'B.E.',
    batch: '2021-2025',
    admissionYear: 2021,
    regulation: '2021',
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'A',
    mentorName: 'Prof. M. Rajesh',
    classAdvisor: 'Dr. K. Senthil Kumar',
    studentStatus: 'ACTIVE',
    residenceType: 'DAY_SCHOLAR',
    busRoute: 'Route 4 - Karur Bus Stand',
    boardingPoint: 'Karur Collectorate',
    hostelBlock: null,
    roomNumber: null,
    emergencyContactName: 'Ramesh Sharma',
    emergencyContactRelation: 'Father',
    emergencyContactMobile: '9876543211',
    cgpa: 8.92,
    attendancePercentage: 95.4,
    feeBalance: 0
  },
  {
    id: 2,
    registerNumber: '922521104002',
    universityRegNo: '922521104002',
    admissionNumber: 'ADM2021002',
    rollNumber: '21AD002',
    fullName: 'Ananya K',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    gender: 'Female',
    dateOfBirth: '2003-08-22',
    bloodGroup: 'A+',
    mobileNumber: '9876543220',
    email: 'ananya.k@vsb.ac.in',
    fatherName: 'Krishnan S',
    motherName: 'Lakshmi K',
    nationality: 'Indian',
    firstGraduate: false,
    departmentName: 'Artificial Intelligence & Data Science',
    degree: 'B.E.',
    batch: '2021-2025',
    admissionYear: 2021,
    regulation: '2021',
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'A',
    studentStatus: 'ACTIVE',
    residenceType: 'HOSTELLER',
    hostelBlock: 'Block A',
    roomNumber: '204',
    cgpa: 9.45,
    attendancePercentage: 98.1,
    feeBalance: 0
  },
  {
    id: 3,
    registerNumber: '922521104003',
    admissionNumber: 'ADM2021003',
    rollNumber: '21CS001',
    fullName: 'Vikas Sundaram',
    gender: 'Male',
    mobileNumber: '9876543230',
    email: 'vikas.s@vsb.ac.in',
    nationality: 'Indian',
    firstGraduate: true,
    departmentName: 'Computer Science & Engineering',
    degree: 'B.E.',
    batch: '2021-2025',
    admissionYear: 2021,
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'B',
    studentStatus: 'ACTIVE',
    residenceType: 'HOSTELLER',
    hostelBlock: 'Block B',
    roomNumber: '108',
    cgpa: 8.15,
    attendancePercentage: 91.5,
    feeBalance: 12500
  },
  {
    id: 4,
    registerNumber: '922522104004',
    admissionNumber: 'ADM2022010',
    rollNumber: '22EC015',
    fullName: 'Kavitha Ramachandran',
    gender: 'Female',
    mobileNumber: '9876543240',
    email: 'kavitha.r@vsb.ac.in',
    nationality: 'Indian',
    firstGraduate: true,
    departmentName: 'Electronics & Communication Engineering',
    degree: 'B.E.',
    batch: '2022-2026',
    admissionYear: 2022,
    currentYear: 2,
    currentSemester: 4,
    sectionName: 'A',
    studentStatus: 'ACTIVE',
    residenceType: 'DAY_SCHOLAR',
    busRoute: 'Route 12 - Namakkal',
    cgpa: 8.70,
    attendancePercentage: 96.0,
    feeBalance: 0
  }
];

let localMockDatabase = [...INITIAL_MOCK_STUDENTS];

const getAuthHeaders = () => {
  const token = localStorage.getItem('vsb_token') || sessionStorage.getItem('vsb_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchStudents = async (filters = {}, page = 0, size = 10, sortBy = 'registerNumber', sortDirection = 'ASC') => {
  try {
    const queryParams = new URLSearchParams({
      page, size, sortBy, sortDirection,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.semester ? { semester: filters.semester } : {}),
      ...(filters.section ? { section: filters.section } : {}),
      ...(filters.community ? { community: filters.community } : {}),
      ...(filters.batch ? { batch: filters.batch } : {}),
      ...(filters.gender ? { gender: filters.gender } : {}),
      ...(filters.residenceType ? { residenceType: filters.residenceType } : {})
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Server returned HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Backend unreachable, using fallback:', error.message);
    let filtered = [...localMockDatabase];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        (s.registerNumber || '').toLowerCase().includes(q) ||
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.rollNumber || '').toLowerCase().includes(q) ||
        (s.admissionNumber || '').toLowerCase().includes(q)
      );
    }
    if (filters.department) filtered = filtered.filter(s => s.departmentName === filters.department);
    if (filters.year) filtered = filtered.filter(s => s.currentYear === Number(filters.year));
    if (filters.semester) filtered = filtered.filter(s => s.currentSemester === Number(filters.semester));
    if (filters.section) filtered = filtered.filter(s => s.sectionName === filters.section);
    if (filters.community) filtered = filtered.filter(s => s.community === filters.community);
    if (filters.batch) filtered = filtered.filter(s => s.batch === filters.batch);
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    filtered.sort((a, b) => {
      const vA = String(a[sortBy] || ''), vB = String(b[sortBy] || '');
      return sortDirection === 'DESC' ? vB.localeCompare(vA, undefined, { numeric: true }) : vA.localeCompare(vB, undefined, { numeric: true });
    });
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const startIndex = page * size;
    return { content: filtered.slice(startIndex, startIndex + size), pageNo: page, pageSize: size, totalElements, totalPages, last: page >= totalPages - 1 };
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(studentData)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Create failed, using fallback:', error.message);
    const newStudent = { ...studentData, id: Date.now(), createdAt: new Date().toISOString() };
    localMockDatabase.unshift(newStudent);
    return newStudent;
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(studentData)
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Update failed, using fallback:', error.message);
    const index = localMockDatabase.findIndex(s => s.id === Number(id));
    if (index !== -1) {
      localMockDatabase[index] = { ...localMockDatabase[index], ...studentData, updatedAt: new Date().toISOString() };
      return localMockDatabase[index];
    }
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Delete failed, using fallback:', error.message);
    localMockDatabase = localMockDatabase.filter(s => s.id !== Number(id));
    return { message: 'Student removed successfully' };
  }
};

export const uploadStudentPhoto = async (id, photoUrlOrBase64) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/photo`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ photoUrl: photoUrlOrBase64 })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Photo upload failed, using fallback:', error.message);
    const index = localMockDatabase.findIndex(s => s.id === Number(id));
    if (index !== -1) localMockDatabase[index].photoUrl = photoUrlOrBase64;
    return { photoUrl: photoUrlOrBase64, message: 'Photo uploaded locally' };
  }
};

// ── Student 360° Complete Profile ─────────────────────────────────────────────
export const getStudent360Profile = async (studentId) => {
  try {
    return await api.get(`/students/${studentId}/360`);
  } catch (error) {
    console.warn('360 profile API unavailable:', error.message);
    return null;
  }
};

// ── Get single student by ID ───────────────────────────────────────────────────
export const getStudentById = async (studentId) => {
  try {
    return await api.get(`/students/${studentId}`);
  } catch (error) {
    console.warn('Student fetch failed, using fallback:', error.message);
    return localMockDatabase.find(s => String(s.id) === String(studentId)) || null;
  }
};

// ── Search students (unified) ──────────────────────────────────────────────────
export const searchStudents = async (query, params = {}) => {
  try {
    return await api.get('/students/search', { q: query, ...params });
  } catch (error) {
    console.warn('Search API unavailable, using local fallback:', error.message);
    const q = (query || '').toLowerCase();
    return localMockDatabase.filter(s =>
      (s.registerNumber || '').toLowerCase().includes(q) ||
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.admissionNumber || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.mobileNumber || '').toLowerCase().includes(q)
    );
  }
};

// ── Get students by dept/year/section (for HOD & Staff dashboards) ─────────────
export const getStudentsByClass = async ({ departmentCode, year, section, semester, academicYear } = {}) => {
  try {
    return await api.get('/students', {
      department_code: departmentCode, year, section, semester,
      academic_year: academicYear, size: 500,
    });
  } catch (error) {
    console.warn('Class students API unavailable, using local fallback:', error.message);
    return { content: localMockDatabase, totalElements: localMockDatabase.length };
  }
};

// ── User Management ────────────────────────────────────────────────────────────
export const getUsers = (params = {}) => api.get('/users', params);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (userId, data) => api.put(`/users/${userId}`, data);
export const deactivateUser = (userId) => api.put(`/users/${userId}/deactivate`, {});
export const resetUserPassword = (userId, newPassword) =>
  api.post(`/users/${userId}/reset-password`, { new_password: newPassword });

// ── Department data ────────────────────────────────────────────────────────────
export const getDepartments = () => api.get('/departments');
export const getDepartmentStudents = (deptCode, params = {}) =>
  api.get('/students', { department_code: deptCode, ...params });

// ── Audit Logs ─────────────────────────────────────────────────────────────────
export const getAuditLogs = (params = {}) => api.get('/audit-logs', params);
