// ============================================================================
// Student Master Module — TypeScript Type Definitions
// VSB Engineering College ERP
// ============================================================================

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE'
  | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE'
  | 'O_POSITIVE' | 'O_NEGATIVE';

export type Community = 'OC' | 'BC' | 'BCM' | 'MBC' | 'SC' | 'ST' | 'SCA' | 'OBC';

export type StudentStatus =
  | 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'DROPOUT' | 'TRANSFERRED' | 'SUSPENDED';

export type ResidenceType = 'DAY_SCHOLAR' | 'HOSTELLER';

// ─── Student Summary (list view) ──────────────────────────────────────────────
export interface StudentSummary {
  id: number;
  registerNumber: string;
  rollNumber: string;
  fullName: string;
  photoUrl?: string;
  gender: Gender;
  departmentName: string;
  batch: string;
  currentYear: number;
  currentSemester: number;
  sectionName: string;
  studentStatus: StudentStatus;
  residenceType: ResidenceType;
  community?: Community;
  mobileNumber: string;
  email: string;
}

// ─── Full Student Profile ──────────────────────────────────────────────────────
export interface Student extends StudentSummary {
  universityRegNo?: string;
  admissionNumber: string;
  dateOfBirth: string;
  bloodGroup?: BloodGroup;
  aadhaarNumber?: string;

  // Parent
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  guardianName?: string;
  guardianMobile?: string;

  // Address
  currentAddress?: string;
  permanentAddress?: string;
  district?: string;
  state?: string;
  pincode?: string;

  // Community
  religion?: string;
  caste?: string;
  subCaste?: string;
  nationality?: string;
  nativeDistrict?: string;
  firstGraduate?: boolean;

  // Academic
  degree?: string;
  admissionYear: number;
  regulation?: string;
  mentorName?: string;
  classAdvisor?: string;

  // Transport
  busRoute?: string;
  boardingPoint?: string;
  hostelBlock?: string;
  roomNumber?: string;

  // Emergency
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactMobile?: string;

  createdAt?: string;
  updatedAt?: string;
}

// ─── Create / Update Form ─────────────────────────────────────────────────────
export interface StudentFormData {
  // Personal
  registerNumber: string;
  universityRegNo: string;
  admissionNumber: string;
  rollNumber: string;
  fullName: string;
  gender: Gender | '';
  dateOfBirth: string;
  bloodGroup: BloodGroup | '';
  aadhaarNumber: string;
  mobileNumber: string;
  email: string;

  // Parent
  fatherName: string;
  fatherOccupation: string;
  fatherMobile: string;
  motherName: string;
  motherOccupation: string;
  motherMobile: string;
  guardianName: string;
  guardianMobile: string;

  // Address
  currentAddress: string;
  permanentAddress: string;
  district: string;
  state: string;
  pincode: string;

  // Community
  religion: string;
  community: Community | '';
  caste: string;
  subCaste: string;
  nationality: string;
  nativeDistrict: string;
  firstGraduate: boolean;

  // Academic
  departmentName: string;
  degree: string;
  batch: string;
  admissionYear: number | '';
  regulation: string;
  currentYear: number | '';
  currentSemester: number | '';
  sectionName: string;
  mentorName: string;
  classAdvisor: string;
  studentStatus: StudentStatus | '';

  // Transport
  residenceType: ResidenceType | '';
  busRoute: string;
  boardingPoint: string;
  hostelBlock: string;
  roomNumber: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactMobile: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errors?: Record<string, string>;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface StudentFilters {
  search: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  community: string;
  batch: string;
  gender: string;
  status: string;
}

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
];

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
};

export const STATUS_COLORS: Record<StudentStatus, string> = {
  ACTIVE:      'bg-emerald-100 text-emerald-800',
  INACTIVE:    'bg-gray-100 text-gray-800',
  ALUMNI:      'bg-blue-100 text-blue-800',
  DROPOUT:     'bg-red-100 text-red-800',
  TRANSFERRED: 'bg-amber-100 text-amber-800',
  SUSPENDED:   'bg-orange-100 text-orange-800',
};
