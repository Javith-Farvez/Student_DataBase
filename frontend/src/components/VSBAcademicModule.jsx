import React, { useState, useEffect } from 'react';
import {
  BookOpen, Award, ArrowUpCircle, RotateCcw, Search, Filter,
  CheckCircle, AlertCircle, Edit3, Users, Building, ShieldCheck,
  ChevronRight, Calendar, UserCheck, Sparkles, Layers, RefreshCw
} from 'lucide-react';
import {
  fetchAcademicRecords,
  autoPromoteStudent,
  autoPromoteBatch,
  updateAcademicDetails
} from '../api/academicService';

const DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering'
];

const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C'];
const BATCHES = ['2021-2025', '2022-2026', '2023-2027', '2024-2028'];

export default function VSBAcademicModule() {
  const [academicRecords, setAcademicRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    semester: '',
    section: '',
    batch: '',
    search: ''
  });

  // Modal States
  const [editingRecord, setEditingRecord] = useState(null);
  const [isBatchPromoteModalOpen, setIsBatchPromoteModalOpen] = useState(false);
  const [batchPayload, setBatchPayload] = useState({
    departmentName: '',
    fromYear: '',
    fromSemester: '',
    batch: '',
    sectionName: ''
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAcademicData = async () => {
    setLoading(true);
    try {
      const data = await fetchAcademicRecords(filters);
      setAcademicRecords(data || []);
    } catch (err) {
      showToast('Failed to load academic records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicData();
  }, [filters]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      department: '',
      year: '',
      semester: '',
      section: '',
      batch: '',
      search: ''
    });
  };

  // Auto Promote Single Student
  const handleSinglePromote = async (studentId, studentName, currentSem) => {
    try {
      const res = await autoPromoteStudent(studentId);
      showToast(`🎉 Promoted ${studentName} to Semester ${res.currentSemester} (Year ${res.currentYear})!`);
      loadAcademicData();
    } catch (err) {
      showToast('Auto-promotion failed', 'error');
    }
  };

  // Auto Promote Bulk Batch
  const handleBatchPromoteSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await autoPromoteBatch(batchPayload);
      showToast(`🚀 ${res.message || 'Batch promotion complete!'}`);
      setIsBatchPromoteModalOpen(false);
      loadAcademicData();
    } catch (err) {
      showToast('Bulk batch promotion failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;
    setSubmitting(true);
    try {
      await updateAcademicDetails(editingRecord.studentId, editingRecord);
      showToast('Academic Record updated successfully!');
      setEditingRecord(null);
      loadAcademicData();
    } catch (err) {
      showToast('Failed to update academic record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Client-side search filtering
  const filteredRecords = academicRecords.filter(rec => {
    if (!filters.search.trim()) return true;
    const q = filters.search.toLowerCase();
    return (rec.studentName && rec.studentName.toLowerCase().includes(q)) ||
           (rec.registerNumber && rec.registerNumber.toLowerCase().includes(q)) ||
           (rec.universityRegNo && rec.universityRegNo.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6 font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold transition-all duration-300 animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
            : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toastMessage.message}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold text-2xl shadow-inner">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Academic Details Module
              <span className="text-xs px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
                Auto-Progression Engine
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Synchronized Academic Roster • Automated Year & Semester Progression • Mentor & Advisor Management
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBatchPromoteModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ArrowUpCircle className="w-5 h-5" />
          Bulk Batch Auto-Promote
        </button>
      </div>

      {/* Academic Analytics Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Academic Roster</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{filteredRecords.length} Active Records</p>
          <p className="text-xs text-indigo-300 mt-1">Synced with Student Master</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Regulation</span>
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">2021 Regulation</p>
          <p className="text-xs text-amber-300 mt-1">Anna University Curriculum</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Batches</span>
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">4 Batches</p>
          <p className="text-xs text-emerald-400 mt-1">2021-25 to 2024-28</p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 shadow">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mentorship</span>
            <ShieldCheck className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">100% Assigned</p>
          <p className="text-xs text-purple-300 mt-1">Mentors & Class Advisors</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Reg No, Univ Reg No, Name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-medium text-slate-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Academic Filters
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-700/60">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Year</label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange('semester', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Section</label>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Sections</option>
              {SECTIONS.map(sec => <option key={sec} value={sec}>Sec {sec}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Batch</label>
            <select
              value={filters.batch}
              onChange={(e) => handleFilterChange('batch', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Batches</option>
              {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Academic Roster Table */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Univ Register No</th>
                <th className="py-3.5 px-4">Department & Degree</th>
                <th className="py-3.5 px-4">Batch / Reg</th>
                <th className="py-3.5 px-4 text-center">Current Year & Semester</th>
                <th className="py-3.5 px-4">Mentor & Class Advisor</th>
                <th className="py-3.5 px-4 text-center">Auto-Progression</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 animate-pulse">
                    Loading Academic Details records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No academic records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id || record.studentId} className="hover:bg-slate-700/30 transition duration-150">
                    
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{record.studentName}</p>
                        <p className="text-xs font-mono text-indigo-400">Reg: {record.registerNumber}</p>
                      </div>
                    </td>

                    {/* University Register No */}
                    <td className="py-3.5 px-4 font-mono text-xs text-amber-300 font-semibold">
                      {record.universityRegNo || record.registerNumber}
                    </td>

                    {/* Department & Degree */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                      <div>{record.departmentName}</div>
                      <span className="text-[10px] text-slate-400">{record.degree || 'B.E.'} • Adm {record.admissionYear}</span>
                    </td>

                    {/* Batch / Regulation */}
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-300 border border-emerald-500/20">
                        {record.batch} (Reg {record.regulation || '2021'})
                      </span>
                    </td>

                    {/* Current Year & Semester */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-xs font-bold shadow-inner">
                        <span>Year {record.currentYear}</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                        <span className="text-amber-400">Sem {record.currentSemester}</span>
                        <span className="ml-1 text-[10px] text-purple-300">Sec {record.sectionName}</span>
                      </div>
                    </td>

                    {/* Mentor & Advisor */}
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div><span className="text-slate-500">Mentor:</span> {record.mentorName || 'Unassigned'}</div>
                      <div><span className="text-slate-500">Advisor:</span> {record.classAdvisor || 'Unassigned'}</div>
                    </td>

                    {/* Auto-Progression Action */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSinglePromote(record.studentId, record.studentName, record.currentSemester)}
                          disabled={record.currentSemester >= 8}
                          title="Auto-Promote to Next Semester & Calculate Year"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-emerald-500/20"
                        >
                          <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                          {record.currentSemester >= 8 ? 'Completed' : 'Promote'}
                        </button>

                        <button
                          onClick={() => setEditingRecord(record)}
                          title="Edit Academic Details"
                          className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ACADEMIC RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Edit Academic Record: {editingRecord.studentName}
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">University Reg No</label>
                  <input
                    type="text"
                    value={editingRecord.universityRegNo || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, universityRegNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Admission Year</label>
                  <input
                    type="number"
                    value={editingRecord.admissionYear || 2021}
                    onChange={(e) => setEditingRecord({ ...editingRecord, admissionYear: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Degree</label>
                  <input
                    type="text"
                    value={editingRecord.degree || 'B.E.'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, degree: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Regulation</label>
                  <input
                    type="text"
                    value={editingRecord.regulation || '2021'}
                    onChange={(e) => setEditingRecord({ ...editingRecord, regulation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Current Semester *</label>
                  <select
                    value={editingRecord.currentSemester}
                    onChange={(e) => {
                      const sem = Number(e.target.value);
                      const yr = Math.ceil(sem / 2);
                      setEditingRecord({ ...editingRecord, currentSemester: sem, currentYear: yr });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Auto Calculated Year</label>
                  <input
                    type="text"
                    disabled
                    value={`Year ${editingRecord.currentYear}`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-indigo-300 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Section</label>
                  <select
                    value={editingRecord.sectionName}
                    onChange={(e) => setEditingRecord({ ...editingRecord, sectionName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {SECTIONS.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Batch</label>
                  <select
                    value={editingRecord.batch}
                    onChange={(e) => setEditingRecord({ ...editingRecord, batch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-300 block mb-1 font-semibold">Mentor Name</label>
                  <input
                    type="text"
                    value={editingRecord.mentorName || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, mentorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-300 block mb-1 font-semibold">Class Advisor</label>
                  <input
                    type="text"
                    value={editingRecord.classAdvisor || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, classAdvisor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK BATCH AUTO-PROMOTE MODAL */}
      {isBatchPromoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Bulk Batch Auto-Promotion Engine
              </h3>
              <button
                onClick={() => setIsBatchPromoteModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select department or batch criteria below to promote all matching enrolled students automatically to the next Semester & calculated Academic Year.
            </p>

            <form onSubmit={handleBatchPromoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Department</label>
                <select
                  value={batchPayload.departmentName}
                  onChange={(e) => setBatchPayload({ ...batchPayload, departmentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">From Semester</label>
                  <select
                    value={batchPayload.fromSemester}
                    onChange={(e) => setBatchPayload({ ...batchPayload, fromSemester: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Batch</label>
                  <select
                    value={batchPayload.batch}
                    onChange={(e) => setBatchPayload({ ...batchPayload, batch: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="">All Batches</option>
                    {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 space-y-1">
                <p className="font-bold">⚡ Progression Rule:</p>
                <p>Students in Semester N will be promoted to Semester N + 1. Academic Year will automatically update to `ceil((N+1) / 2)`.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchPromoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? 'Promoting...' : 'Execute Bulk Auto-Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
