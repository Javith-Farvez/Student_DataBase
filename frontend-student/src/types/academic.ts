// ── SSLC (10th) Types ─────────────────────────────────────────────────────────
export interface SslcDetail {
  id: number
  studentId: number
  registerNumber: string
  fullName: string
  departmentName: string
  batch: string
  schoolName?: string
  board?: string
  passingYear?: number
  examRegisterNumber?: string
  totalMarks?: number
  maxMarks?: number
  percentage?: number
  grade?: string
  result?: 'PASS' | 'FAIL'
  tamilMarks?: number
  englishMarks?: number
  mathematicsMarks?: number
  scienceMarks?: number
  socialScienceMarks?: number
  language3Subject?: string
  language3Marks?: number
  createdAt?: string
  updatedAt?: string
}

export interface SslcDetailFormData {
  studentId: number | ''
  schoolName?: string
  board?: string
  passingYear?: number | ''
  examRegisterNumber?: string
  totalMarks?: number | ''
  maxMarks?: number | ''
  percentage?: number | ''
  grade?: string
  result?: string
  tamilMarks?: number | ''
  englishMarks?: number | ''
  mathematicsMarks?: number | ''
  scienceMarks?: number | ''
  socialScienceMarks?: number | ''
  language3Subject?: string
  language3Marks?: number | ''
}

// ── HSC (12th) Types ──────────────────────────────────────────────────────────
export interface HscDetail {
  id: number
  studentId: number
  registerNumber: string
  fullName: string
  departmentName: string
  batch: string
  schoolName?: string
  board?: string
  passingYear?: number
  examRegisterNumber?: string
  groupName?: string
  totalMarks?: number
  maxMarks?: number
  percentage?: number
  cutoff?: number
  grade?: string
  result?: 'PASS' | 'FAIL'
  language1Subject?: string
  language1Marks?: number
  language2Subject?: string
  language2Marks?: number
  physicsMarks?: number
  chemistryMarks?: number
  mathematicsMarks?: number
  biologyMarks?: number
  computerScienceMarks?: number
  optionalSubject?: string
  optionalMarks?: number
  createdAt?: string
  updatedAt?: string
}

export interface HscDetailFormData {
  studentId: number | ''
  schoolName?: string
  board?: string
  passingYear?: number | ''
  examRegisterNumber?: string
  groupName?: string
  totalMarks?: number | ''
  maxMarks?: number | ''
  percentage?: number | ''
  cutoff?: number | ''
  grade?: string
  result?: string
  language1Subject?: string
  language1Marks?: number | ''
  language2Subject?: string
  language2Marks?: number | ''
  physicsMarks?: number | ''
  chemistryMarks?: number | ''
  mathematicsMarks?: number | ''
  biologyMarks?: number | ''
  computerScienceMarks?: number | ''
  optionalSubject?: string
  optionalMarks?: number | ''
}

// ── Combined Profile ───────────────────────────────────────────────────────────
export interface StudentAcademicProfile {
  studentId: number
  registerNumber: string
  fullName: string
  departmentName: string
  batch: string
  sslc?: SslcDetail
  hsc?: HscDetail
}

// ── Filters ───────────────────────────────────────────────────────────────────
export interface SslcFilters {
  search: string
  board: string
  year: string
  department: string
  result: string
}

export interface HscFilters {
  search: string
  board: string
  year: string
  department: string
  groupName: string
  result: string
}

// ── Report Types ──────────────────────────────────────────────────────────────
export interface ReportRow {
  label: string
  count: number
  avgPct?: number
  avgCutoff?: number
}

export interface SslcReports {
  byBoard:      ReportRow[]
  byYear:       ReportRow[]
  byResult:     { label: string; count: number }[]
  byDepartment: ReportRow[]
  byGrade:      { label: string; count: number }[]
  totalRecords: number
}

export interface HscReports {
  byBoard:      ReportRow[]
  byYear:       ReportRow[]
  byGroup:      ReportRow[]
  byResult:     { label: string; count: number }[]
  byDepartment: { label: string; count: number; avgCutoff?: number }[]
  byGrade:      { label: string; count: number }[]
  totalRecords: number
}

// ── Meta / Options ────────────────────────────────────────────────────────────
export const BOARD_OPTIONS = [
  'Tamil Nadu State Board',
  'CBSE',
  'ICSE',
  'Matriculation',
  'NIOS',
]

export const HSC_GROUP_OPTIONS = [
  'Bio-Maths (PCB)',
  'CS-Maths (PCM)',
  'Commerce',
  'Arts / Humanities',
  'Bio-Maths-CS',
  'Vocational',
]

export const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-700',
  'A':  'bg-green-100 text-green-700',
  'B+': 'bg-blue-100 text-blue-700',
  'B':  'bg-sky-100 text-sky-700',
  'C':  'bg-amber-100 text-amber-700',
  'D':  'bg-red-100 text-red-700',
}

export const RESULT_COLORS: Record<string, string> = {
  PASS: 'bg-green-100 text-green-700',
  FAIL: 'bg-red-100 text-red-700',
}
