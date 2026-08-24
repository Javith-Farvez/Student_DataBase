import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, RotateCcw, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, Edit3, Trash2, Camera, Upload, X, CheckCircle, AlertCircle, Building, Award,
  MapPin, Shield, Phone, Mail, FileText, UserCheck, BookOpen, Truck, HeartHandshake,
  Download, Printer, Plus
} from 'lucide-react';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto
} from '../api/studentService';

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering'
];

const COMMUNITIES = ['OC', 'BC', 'MBC', 'SC', 'ST'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];
const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C'];
const GENDERS = ['Male', 'Female', 'Other'];

const INITIAL_FORM_STATE = {
  // Personal Details
  registerNumber: '',
  universityRegNo: '',
  admissionNumber: '',
  rollNumber: '',
  fullName: '',
  photoUrl: '',
  gender: 'Male',
  dateOfBirth: '',
  bloodGroup: 'O+',
  aadhaarNumber: '',
  panNumber: '',
  mobileNumber: '',
  email: '',

  // Parent Details
  fatherName: '',
  fatherOccupation: '',
  fatherMobile: '',
  motherName: '',
  motherOccupation: '',
  motherMobile: '',
  guardianName: '',
  guardianMobile: '',

  // Address
  currentAddress: '',
  permanentAddress: '',
  nativeDistrict: 'Karur',
  nativeState: 'Tamil Nadu',
  pincode: '',

  // Community Details
  religion: 'Hindu',
  community: 'BC',
  caste: '',
  subCaste: '',
  nationality: 'Indian',
  firstGraduate: false,

  // Academic Details
  departmentName: 'Artificial Intelligence & Data Science',
  degree: 'B.E.',
  batch: '2021-2025',
  admissionYear: 2021,
  regulation: '2021',
  currentYear: 3,
  currentSemester: 6,
  sectionName: 'A',
  mentorName: '',
  classAdvisor: '',
  studentStatus: 'ACTIVE',

  // Transport Details
  residenceType: 'DAY_SCHOLAR',
  busRoute: '',
  boardingPoint: '',
  hostelBlock: '',
  roomNumber: '',

  // Emergency Contact
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactMobile: '',

  // Performance Indicators
  cgpa: 8.00,
  attendancePercentage: 95.0,
  feeBalance: 0
};

export default function VSBStudentMasterModule() {
  // Main Data States
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Search, Filter & Sort States
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    year: '',
    semester: '',
    section: '',
    community: '',
    batch: '',
    gender: '',
    residenceType: ''
  });
  const [sortDirection, setSortDirection] = useState('ASC');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  // Form State & Navigation
  const [activeFormTab, setActiveFormTab] = useState('personal');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load Students Data
  const loadStudentsData = async () => {
    setLoading(true);
    try {
      const res = await fetchStudents(filters, page, pageSize, 'registerNumber', sortDirection);
      setStudents(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      showToast('Failed to load student profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsData();
  }, [page, pageSize, filters, sortDirection]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      department: '',
      year: '',
      semester: '',
      section: '',
      community: '',
      batch: '',
      gender: '',
      residenceType: ''
    });
    setSortDirection('ASC');
    setPage(0);
  };

  // Photo File Change Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingStudentId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setActiveFormTab('personal');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setEditingStudentId(student.id);
    setFormData({
      ...INITIAL_FORM_STATE,
      ...student,
      dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth) : ''
    });
    setFormErrors({});
    setActiveFormTab('personal');
    setIsCreateModalOpen(true);
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.registerNumber) errors.registerNumber = 'Register Number is required';
    if (!formData.admissionNumber) errors.admissionNumber = 'Admission Number is required';
    if (!formData.rollNumber) errors.rollNumber = 'Roll Number is required';
    if (!formData.fullName) errors.fullName = 'Student Name is required';
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of Birth is required';
    if (!formData.mobileNumber) errors.mobileNumber = 'Mobile Number is required';
    if (!formData.email) errors.email = 'Email Address is required';
    if (!formData.departmentName) errors.departmentName = 'Department is required';
    if (!formData.batch) errors.batch = 'Batch is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form (Create / Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix validation errors in the form', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, formData);
        showToast('Student profile updated successfully!');
      } else {
        await createStudent(formData);
        showToast('New student created successfully!');
      }
      setIsCreateModalOpen(false);
      loadStudentsData();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Student
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    try {
      await deleteStudent(deletingStudent.id);
      showToast('Student profile deleted successfully!');
      setDeletingStudent(null);
      loadStudentsData();
    } catch (err) {
      showToast('Failed to delete student record', 'error');
    }
  };

  // Printable Profile Handler
  const handlePrintProfile = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#252525] p-4 md:p-6 space-y-6 font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-[#2E7D32] text-white border-[#A5D6A7]'
            : 'bg-[#B42318] text-white border-[#FFCDD2]'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-white" />}
          {toastMessage.message}
        </div>
      )}

      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E8E1D7] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F5E8CC] border border-[#D49A17] flex items-center justify-center text-[#6E0F0F] font-bold text-xl">
            <Building className="w-6 h-6 text-[#6E0F0F]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#6E0F0F] flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              VSB Engineering College
              <span className="text-xs px-3 py-1 bg-[#F5E8CC] text-[#6E0F0F] rounded-full border border-[#D49A17] font-sans">
                ERP Student Master
              </span>
            </h1>
            <p className="text-[#666666] text-sm mt-1">
              Production-Grade Student Information System • Autonomous Profile Management & REST APIs
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#6E0F0F] hover:bg-[#4B0808] text-white font-semibold border border-[#4B0808] shadow transition-all duration-200"
        >
          <UserPlus className="w-5 h-5 text-[#D49A17]" />
          Create New Student
        </button>
      </div>

      {/* Key Metrics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E8E1D7] shadow-sm hover:border-[#D49A17] transition">
          <div className="flex items-center justify-between">
            <span className="text-[#666666] text-xs font-semibold uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-5 h-5 text-[#6E0F0F]" />
          </div>
          <p className="text-2xl font-bold text-[#6E0F0F] mt-2">{totalElements}</p>
          <p className="text-xs text-[#2E7D32] mt-1 font-medium">✓ Active Roster Records</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E1D7] shadow-sm hover:border-[#D49A17] transition">
          <div className="flex items-center justify-between">
            <span className="text-[#666666] text-xs font-semibold uppercase tracking-wider">Day Scholars vs Hostellers</span>
            <Truck className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <p className="text-2xl font-bold text-[#252525] mt-2">
            {students.filter(s => s.residenceType === 'DAY_SCHOLAR').length} / {students.filter(s => s.residenceType === 'HOSTELLER').length}
          </p>
          <p className="text-xs text-[#666666] mt-1">Bus Transport vs Residence Blocks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E1D7] shadow-sm hover:border-[#D49A17] transition">
          <div className="flex items-center justify-between">
            <span className="text-[#666666] text-xs font-semibold uppercase tracking-wider">Departments</span>
            <BookOpen className="w-5 h-5 text-[#6E0F0F]" />
          </div>
          <p className="text-2xl font-bold text-[#6E0F0F] mt-2">5 Active</p>
          <p className="text-xs text-[#666666] mt-1">CSE, AIDS, ECE, EEE, MECH</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E8E1D7] shadow-sm hover:border-[#D49A17] transition">
          <div className="flex items-center justify-between">
            <span className="text-[#666666] text-xs font-semibold uppercase tracking-wider">First Graduates</span>
            <Award className="w-5 h-5 text-[#D49A17]" />
          </div>
          <p className="text-2xl font-bold text-[#D49A17] mt-2">
            {students.filter(s => s.firstGraduate).length} Eligible
          </p>
          <p className="text-xs text-[#666666] mt-1">Government Scholarship Scheme</p>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-[#E8E1D7] shadow-sm space-y-4">
        
        {/* Search Bar & Primary Actions */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-5 h-5 text-[#666666] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Register No, Name, Roll No..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-[#FCFAF6] border border-[#E8E1D7] rounded-lg pl-11 pr-4 py-2 text-sm text-[#252525] placeholder-[#666666] focus:outline-none focus:border-[#6E0F0F] transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'))}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5E8CC] hover:bg-[#E8E1D7] border border-[#D49A17] rounded-lg text-xs font-semibold text-[#6E0F0F] transition"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort Register No: <span className="text-[#6E0F0F] font-bold">{sortDirection}</span>
            </button>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FCFAF6] border border-[#E8E1D7] rounded-lg text-xs font-medium text-[#666666] transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Multi-Select Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2 border-t border-[#E8E1D7]">
          
          {/* Department Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6E0F0F] block mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full bg-white border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#252525] focus:outline-none focus:border-[#6E0F0F]"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Current Year */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6E0F0F] block mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full bg-white border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#252525] focus:outline-none focus:border-[#6E0F0F]"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          {/* Current Semester */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6E0F0F] block mb-1">Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full bg-white border border-[#E8E1D7] rounded-lg px-2.5 py-1.5 text-xs text-[#252525] focus:outline-none focus:border-[#6E0F0F]"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#6E0F0F] block mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(sec => <option key={sec} value={sec}>Sec {sec}</option>)}
            </select>
          </div>

          {/* Community */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Community</label>
            <select
              value={filters.community}
              onChange={(e) => handleFilterChange('community', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Communities</option>
              {COMMUNITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => handleFilterChange('batch', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Batches</option>
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="">All Genders</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Register Number</th>
                <th className="py-3.5 px-4">Roll / Adm No</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Year / Sem / Sec</th>
                <th className="py-3.5 px-4">Community</th>
                <th className="py-3.5 px-4">Residence</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 animate-pulse">
                    Loading VSB Student Master records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No matching student records found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-700/30 transition-colors duration-150 group">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={student.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-sky-400/40 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Register Number */}
                    <td className="py-3 px-4 font-mono font-medium text-sky-400">
                      {student.registerNumber}
                    </td>

                    {/* Roll / Admission Number */}
                    <td className="py-3 px-4 text-xs font-mono text-slate-300">
                      <div>{student.rollNumber}</div>
                      <div className="text-slate-500">{student.admissionNumber}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {student.departmentName}
                    </td>

                    {/* Academic Position */}
                    <td className="py-3 px-4 text-xs font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-sky-500/20">
                        Yr {student.currentYear} • Sem {student.currentSemester} • Sec {student.sectionName}
                      </span>
                    </td>

                    {/* Community */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-900/80 text-amber-300 border border-amber-500/20">
                        {student.community || 'N/A'}
                      </span>
                    </td>

                    {/* Residence */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        student.residenceType === 'HOSTELLER'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {student.residenceType === 'HOSTELLER' ? 'Hosteller' : 'Day Scholar'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingStudent(student)}
                          title="View Complete Profile"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit Student Record"
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingStudent(student)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>Total {totalElements} Students</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT MULTI-SECTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingStudentId ? 'Edit Student Master Record' : 'Create New Student Profile'}
                </h2>
                <p className="text-xs text-slate-400">VSB Engineering College ERP Record Form</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Tab Header */}
            <div className="flex overflow-x-auto bg-slate-950 border-b border-slate-800 px-4 pt-2 gap-2 text-xs font-semibold scrollbar-none">
              {[
                { id: 'personal', label: 'Personal Details', icon: Users },
                { id: 'parent', label: 'Parent Details', icon: Shield },
                { id: 'address', label: 'Address', icon: MapPin },
                { id: 'community', label: 'Community', icon: Award },
                { id: 'academic', label: 'Academic Details', icon: BookOpen },
                { id: 'transport', label: 'Transport & Hostel', icon: Truck },
                { id: 'emergency', label: 'Emergency Contact', icon: HeartHandshake },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                      active
                        ? 'border-sky-400 text-sky-400 bg-sky-500/10 rounded-t-lg'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* TAB 1: PERSONAL DETAILS */}
              {activeFormTab === 'personal' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    
                    {/* Photo Upload & Preview */}
                    <div className="relative group">
                      <img
                        src={formData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt="Passport Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-sky-400 shadow-md"
                      />
                      <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-semibold text-white">Passport Size Photo</p>
                      <p className="text-xs text-slate-400">Click avatar image to upload or replace photo preview</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Register Number *</label>
                      <input
                        type="text"
                        value={formData.registerNumber}
                        onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="e.g. 922521104001"
                      />
                      {formErrors.registerNumber && <p className="text-xs text-rose-400 mt-1">{formErrors.registerNumber}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">University Reg No</label>
                      <input
                        type="text"
                        value={formData.universityRegNo}
                        onChange={(e) => setFormData({ ...formData, universityRegNo: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Admission Number *</label>
                      <input
                        type="text"
                        value={formData.admissionNumber}
                        onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="e.g. ADM2021001"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Roll Number *</label>
                      <input
                        type="text"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="e.g. 21AD001"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Student Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="Full Name"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="e.g. O+"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="12 digit Aadhaar"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        placeholder="student@vsb.ac.in"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PARENT DETAILS */}
              {activeFormTab === 'parent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Father Name</label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Father Occupation</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Father Mobile Number</label>
                    <input
                      type="text"
                      value={formData.fatherMobile}
                      onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mother Name</label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mother Occupation</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mother Mobile Number</label>
                    <input
                      type="text"
                      value={formData.motherMobile}
                      onChange={(e) => setFormData({ ...formData, motherMobile: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Guardian Name</label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Guardian Mobile Number</label>
                    <input
                      type="text"
                      value={formData.guardianMobile}
                      onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: ADDRESS */}
              {activeFormTab === 'address' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Current Address</label>
                    <textarea
                      rows={3}
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Permanent Address</label>
                    <textarea
                      rows={3}
                      value={formData.permanentAddress}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">District</label>
                      <input
                        type="text"
                        value={formData.nativeDistrict}
                        onChange={(e) => setFormData({ ...formData, nativeDistrict: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">State</label>
                      <input
                        type="text"
                        value={formData.nativeState}
                        onChange={(e) => setFormData({ ...formData, nativeState: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COMMUNITY DETAILS */}
              {activeFormTab === 'community' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Religion</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Community</label>
                    <select
                      value={formData.community}
                      onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {COMMUNITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Caste</label>
                    <input
                      type="text"
                      value={formData.caste}
                      onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Sub Caste</label>
                    <input
                      type="text"
                      value={formData.subCaste}
                      onChange={(e) => setFormData({ ...formData, subCaste: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="firstGraduate"
                      checked={formData.firstGraduate}
                      onChange={(e) => setFormData({ ...formData, firstGraduate: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500"
                    />
                    <label htmlFor="firstGraduate" className="text-xs font-semibold text-slate-200">
                      First Graduate Status
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 5: ACADEMIC DETAILS */}
              {activeFormTab === 'academic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Department *</label>
                    <select
                      value={formData.departmentName}
                      onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Batch *</label>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Admission Year *</label>
                    <input
                      type="number"
                      value={formData.admissionYear}
                      onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Regulation</label>
                    <input
                      type="text"
                      value={formData.regulation}
                      onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Current Year *</label>
                    <select
                      value={formData.currentYear}
                      onChange={(e) => setFormData({ ...formData, currentYear: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Current Semester *</label>
                    <select
                      value={formData.currentSemester}
                      onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Section *</label>
                    <select
                      value={formData.sectionName}
                      onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      {SECTIONS.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mentor Name</label>
                    <input
                      type="text"
                      value={formData.mentorName}
                      onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Class Advisor</label>
                    <input
                      type="text"
                      value={formData.classAdvisor}
                      onChange={(e) => setFormData({ ...formData, classAdvisor: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Student Status</label>
                    <select
                      value={formData.studentStatus}
                      onChange={(e) => setFormData({ ...formData, studentStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ALUMNI">ALUMNI</option>
                      <option value="DISCONTINUED">DISCONTINUED</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 6: TRANSPORT & HOSTEL */}
              {activeFormTab === 'transport' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Residence Type</label>
                    <select
                      value={formData.residenceType}
                      onChange={(e) => setFormData({ ...formData, residenceType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    >
                      <option value="DAY_SCHOLAR">Day Scholar</option>
                      <option value="HOSTELLER">Hosteller</option>
                    </select>
                  </div>

                  {formData.residenceType === 'DAY_SCHOLAR' ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Bus Route</label>
                        <input
                          type="text"
                          value={formData.busRoute}
                          onChange={(e) => setFormData({ ...formData, busRoute: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                          placeholder="e.g. Route 4 - Karur"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Boarding Point</label>
                        <input
                          type="text"
                          value={formData.boardingPoint}
                          onChange={(e) => setFormData({ ...formData, boardingPoint: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Hostel Block</label>
                        <input
                          type="text"
                          value={formData.hostelBlock}
                          onChange={(e) => setFormData({ ...formData, hostelBlock: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                          placeholder="e.g. Block A"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Room Number</label>
                        <input
                          type="text"
                          value={formData.roomNumber}
                          onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                          placeholder="e.g. 204"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 7: EMERGENCY CONTACT */}
              {activeFormTab === 'emergency' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={formData.emergencyContactMobile}
                      onChange={(e) => setFormData({ ...formData, emergencyContactMobile: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="p-4 bg-slate-800/80 -mx-6 -mb-6 border-t border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-400">* Required mandatory fields</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingStudentId ? 'Update Record' : 'Save Student'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT PROFILE DETAIL MODAL */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-800 to-sky-950 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">VSB Engineering College Profile</h3>
                  <p className="text-xs text-sky-300 font-mono">Register No: {viewingStudent.registerNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile ID Card Overview Header */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-sky-500/20 flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={viewingStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={viewingStudent.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-400 shadow-lg"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-xl font-bold text-white">{viewingStudent.fullName}</h4>
                  <p className="text-xs text-sky-400 font-medium">{viewingStudent.departmentName}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                      {viewingStudent.batch}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      Roll: {viewingStudent.rollNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {viewingStudent.residenceType === 'HOSTELLER' ? 'Hosteller' : 'Day Scholar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid of Profile Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Personal & Identification */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <h5 className="font-bold text-sky-400 uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1">
                    Personal Details
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><span className="text-slate-500">Gender:</span> {viewingStudent.gender}</div>
                    <div><span className="text-slate-500">DOB:</span> {viewingStudent.dateOfBirth}</div>
                    <div><span className="text-slate-500">Blood Group:</span> {viewingStudent.bloodGroup || 'N/A'}</div>
                    <div><span className="text-slate-500">Aadhaar:</span> {viewingStudent.aadhaarNumber || 'N/A'}</div>
                    <div><span className="text-slate-500">Mobile:</span> {viewingStudent.mobileNumber}</div>
                    <div className="col-span-2"><span className="text-slate-500">Email:</span> {viewingStudent.email}</div>
                  </div>
                </div>

                {/* Academic Profile */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <h5 className="font-bold text-purple-400 uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1">
                    Academic Context
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><span className="text-slate-500">Degree:</span> {viewingStudent.degree}</div>
                    <div><span className="text-slate-500">Regulation:</span> {viewingStudent.regulation}</div>
                    <div><span className="text-slate-500">Year/Sem:</span> Yr {viewingStudent.currentYear} / Sem {viewingStudent.currentSemester}</div>
                    <div><span className="text-slate-500">Section:</span> {viewingStudent.sectionName}</div>
                    <div><span className="text-slate-500">Mentor:</span> {viewingStudent.mentorName || 'N/A'}</div>
                    <div><span className="text-slate-500">Class Advisor:</span> {viewingStudent.classAdvisor || 'N/A'}</div>
                  </div>
                </div>

                {/* Parents & Guardians */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <h5 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1">
                    Parent Details
                  </h5>
                  <div className="space-y-1.5 text-slate-300">
                    <div><span className="text-slate-500">Father:</span> {viewingStudent.fatherName || 'N/A'} ({viewingStudent.fatherOccupation || 'N/A'}) - {viewingStudent.fatherMobile || 'N/A'}</div>
                    <div><span className="text-slate-500">Mother:</span> {viewingStudent.motherName || 'N/A'} ({viewingStudent.motherOccupation || 'N/A'}) - {viewingStudent.motherMobile || 'N/A'}</div>
                    <div><span className="text-slate-500">Guardian:</span> {viewingStudent.guardianName || 'N/A'} - {viewingStudent.guardianMobile || 'N/A'}</div>
                  </div>
                </div>

                {/* Community & Residence */}
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                  <h5 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] border-b border-slate-700 pb-1">
                    Community & Accommodation
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><span className="text-slate-500">Community:</span> {viewingStudent.community || 'N/A'}</div>
                    <div><span className="text-slate-500">Caste:</span> {viewingStudent.caste || 'N/A'}</div>
                    <div><span className="text-slate-500">Religion:</span> {viewingStudent.religion || 'N/A'}</div>
                    <div><span className="text-slate-500">First Graduate:</span> {viewingStudent.firstGraduate ? 'Yes' : 'No'}</div>
                    {viewingStudent.residenceType === 'HOSTELLER' ? (
                      <>
                        <div><span className="text-slate-500">Block:</span> {viewingStudent.hostelBlock || 'N/A'}</div>
                        <div><span className="text-slate-500">Room:</span> {viewingStudent.roomNumber || 'N/A'}</div>
                      </>
                    ) : (
                      <>
                        <div><span className="text-slate-500">Route:</span> {viewingStudent.busRoute || 'N/A'}</div>
                        <div><span className="text-slate-500">Boarding:</span> {viewingStudent.boardingPoint || 'N/A'}</div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-7 h-7" />
              <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete the student profile for <span className="font-bold text-sky-300">{deletingStudent.fullName}</span> (Register No: {deletingStudent.registerNumber})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition"
              >
                Delete Student Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
