// VSB Engineering College ERP - Academic Details Service API
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/academic';

const INITIAL_MOCK_ACADEMIC = [
  {
    id: 1,
    studentId: 1,
    registerNumber: '922521104001',
    studentName: 'Aarav Sharma',
    universityRegNo: '922521104001',
    admissionYear: 2021,
    batch: '2021-2025',
    departmentName: 'Artificial Intelligence & Data Science',
    degree: 'B.E.',
    regulation: '2021',
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'A',
    mentorName: 'Prof. M. Rajesh',
    classAdvisor: 'Dr. K. Senthil Kumar',
    academicStatus: 'ACTIVE',
    lastPromotionDate: new Date().toISOString()
  },
  {
    id: 2,
    studentId: 2,
    registerNumber: '922521104002',
    studentName: 'Ananya K',
    universityRegNo: '922521104002',
    admissionYear: 2021,
    batch: '2021-2025',
    departmentName: 'Artificial Intelligence & Data Science',
    degree: 'B.E.',
    regulation: '2021',
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'A',
    mentorName: 'Prof. M. Rajesh',
    classAdvisor: 'Dr. K. Senthil Kumar',
    academicStatus: 'ACTIVE',
    lastPromotionDate: new Date().toISOString()
  },
  {
    id: 3,
    studentId: 3,
    registerNumber: '922521104003',
    studentName: 'Vikas Sundaram',
    universityRegNo: '922521104003',
    admissionYear: 2021,
    batch: '2021-2025',
    departmentName: 'Computer Science & Engineering',
    degree: 'B.E.',
    regulation: '2021',
    currentYear: 3,
    currentSemester: 6,
    sectionName: 'B',
    mentorName: 'Dr. A. Ramesh',
    classAdvisor: 'Prof. S. Priya',
    academicStatus: 'ACTIVE',
    lastPromotionDate: new Date().toISOString()
  },
  {
    id: 4,
    studentId: 4,
    registerNumber: '922522104004',
    studentName: 'Kavitha Ramachandran',
    universityRegNo: '922522104004',
    admissionYear: 2022,
    batch: '2022-2026',
    departmentName: 'Electronics & Communication Engineering',
    degree: 'B.E.',
    regulation: '2021',
    currentYear: 2,
    currentSemester: 4,
    sectionName: 'A',
    mentorName: 'Dr. P. Murugan',
    classAdvisor: 'Prof. J. Balaji',
    academicStatus: 'ACTIVE',
    lastPromotionDate: new Date().toISOString()
  }
];

let localMockAcademic = [...INITIAL_MOCK_ACADEMIC];

const getAuthHeaders = () => {
  const token = localStorage.getItem('vsb_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const fetchAcademicRecords = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.semester ? { semester: filters.semester } : {}),
      ...(filters.section ? { section: filters.section } : {}),
      ...(filters.batch ? { batch: filters.batch } : {})
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend REST API offline, using local academic fallback:', error.message);
    let filtered = [...localMockAcademic];
    if (filters.department) filtered = filtered.filter(a => a.departmentName === filters.department);
    if (filters.year) filtered = filtered.filter(a => a.currentYear === Number(filters.year));
    if (filters.semester) filtered = filtered.filter(a => a.currentSemester === Number(filters.semester));
    if (filters.section) filtered = filtered.filter(a => a.sectionName === filters.section);
    if (filters.batch) filtered = filtered.filter(a => a.batch === filters.batch);
    return filtered;
  }
};

export const autoPromoteStudent = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/promote/${studentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} promotion failed`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend REST API offline, performing local auto-promotion:', error.message);
    const item = localMockAcademic.find(a => a.studentId === Number(studentId));
    if (item) {
      if (item.currentSemester < 8) {
        item.currentSemester += 1;
        item.currentYear = Math.ceil(item.currentSemester / 2);
        item.lastPromotionDate = new Date().toISOString();
      } else {
        item.academicStatus = 'COMPLETING / ALUMNI';
      }
      return { ...item };
    }
    throw error;
  }
};

export const autoPromoteBatch = async (promotionPayload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/promote-batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(promotionPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} batch promotion failed`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend REST API offline, performing local batch auto-promotion:', error.message);
    let count = 0;
    localMockAcademic.forEach(item => {
      let match = true;
      if (promotionPayload.departmentName && item.departmentName !== promotionPayload.departmentName) match = false;
      if (promotionPayload.fromYear && item.currentYear !== Number(promotionPayload.fromYear)) match = false;
      if (promotionPayload.fromSemester && item.currentSemester !== Number(promotionPayload.fromSemester)) match = false;
      
      if (match && item.currentSemester < 8) {
        item.currentSemester += 1;
        item.currentYear = Math.ceil(item.currentSemester / 2);
        item.lastPromotionDate = new Date().toISOString();
        count++;
      }
    });

    return {
      promotedCount: count,
      message: `Successfully promoted ${count} students to the next Semester & Year.`
    };
  }
};

export const updateAcademicDetails = async (studentId, academicData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/student/${studentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(academicData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} update failed`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Backend REST API offline, updating local mock academic details:', error.message);
    const index = localMockAcademic.findIndex(a => a.studentId === Number(studentId));
    if (index !== -1) {
      localMockAcademic[index] = {
        ...localMockAcademic[index],
        ...academicData,
        currentYear: Math.ceil((academicData.currentSemester || localMockAcademic[index].currentSemester) / 2)
      };
      return localMockAcademic[index];
    }
    throw error;
  }
};
