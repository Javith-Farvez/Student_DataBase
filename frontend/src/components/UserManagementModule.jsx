import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  { code: 'IT', name: 'Information Technology' },
  { code: 'CSE', name: 'Computer Science and Engineering' },
  { code: 'AI & DS', name: 'Artificial Intelligence and Data Science' },
  { code: 'AI & ML', name: 'Artificial Intelligence and Machine Learning' },
  { code: 'CSBS', name: 'Computer Science and Business System' },
  { code: 'CCE', name: 'Computer and Communication Engineering' },
  { code: 'ECE', name: 'Electronics and Communication Engineering' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
  { code: 'CHEM', name: 'Chemical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering' }
];

export default function UserManagementModule() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'history'
  const [users, setUsers] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // Create User Form State
  const [createRole, setCreateRole] = useState('STAFF');
  const [createDept, setCreateDept] = useState('AI & DS');
  const [createUserId, setCreateUserId] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createDesignation, setCreateDesignation] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');

  // Staff Class Assignments
  const [classAssignments, setClassAssignments] = useState([
    { year: 1, section: 'A', is_class_advisor: false },
    { year: 2, section: 'B', is_class_advisor: false }
  ]);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Fetch Users & Audit Logs
  useEffect(() => {
    fetchUsers();
    fetchLoginHistory();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err) {
      console.warn('Backend server fetch failed, loading default initial users list:', err);
      // Fallback example initial users if server restarting
      setUsers([
        { id: '1', user_id: 'ADMIN001', full_name: 'Dr. V.S.B Administrator', role: 'ADMIN', department_code: 'ALL', status: 'Active', last_login: '2026-08-20T18:00:00Z', assigned_classes: [] },
        { id: '3', user_id: 'AIDS_HOD_001', full_name: 'Dr. K. Senthil Kumar', role: 'HOD', department_code: 'AI & DS', status: 'Active', last_login: '2026-08-20T16:45:00Z', assigned_classes: [] },
        { id: '4', user_id: 'CSE_HOD_001', full_name: 'Dr. A. Ramesh', role: 'HOD', department_code: 'CSE', status: 'Active', last_login: '2026-08-20T15:10:00Z', assigned_classes: [] },
        { id: '5', user_id: 'STAFF_AIDS_001', full_name: 'Prof. M. Rajesh', role: 'STAFF', department_code: 'AI & DS', status: 'Active', last_login: '2026-08-20T14:20:00Z', assigned_classes: [{ year: 1, section: 'A' }, { year: 2, section: 'B' }] },
        { id: '6', user_id: 'STAFF_CSE_001', full_name: 'Prof. S. Suresh', role: 'STAFF', department_code: 'CSE', status: 'Active', last_login: null, assigned_classes: [{ year: 3, section: 'A' }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/login-history');
      if (res.ok) {
        const data = await res.json();
        setLoginLogs(data);
      }
    } catch (e) {
      console.warn('Could not fetch login history:', e);
    }
  };

  const handleRoleSelectChange = (roleVal) => {
    setCreateRole(roleVal);
    if (roleVal === 'PRINCIPAL' || roleVal === 'ADMIN') {
      setCreateDept('ALL');
      if (roleVal === 'PRINCIPAL' && !createUserId) setCreateUserId('PRINCIPAL_001');
    } else if (roleVal === 'HOD') {
      setCreateDept('AI & DS');
      setCreateUserId(`HOD_AIDS_001`);
    } else if (roleVal === 'STAFF') {
      setCreateDept('AI & DS');
      setCreateUserId(`STAFF_AIDS_001`);
    }
  };

  const handleDeptSelectChange = (deptVal) => {
    setCreateDept(deptVal);
    const codeClean = deptVal.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (createRole === 'HOD') {
      setCreateUserId(`HOD_${codeClean}_001`);
    } else if (createRole === 'STAFF') {
      setCreateUserId(`STAFF_${codeClean}_001`);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (createPassword !== createConfirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    try {
      const payload = {
        role: createRole,
        department_code: createDept,
        employee_id: createUserId.trim().toUpperCase(),
        full_name: createFullName.trim(),
        email: createEmail.trim() || undefined,
        phone: createPhone.trim() || undefined,
        designation: createDesignation.trim() || undefined,
        password: createPassword,
        confirm_password: createConfirmPassword,
        assigned_classes: createRole === 'STAFF' ? classAssignments : []
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`${createRole} account '${createUserId}' created successfully.`);
        setShowCreateModal(false);
        resetCreateForm();
        fetchUsers();
      } else {
        throw new Error(data.detail || 'Failed to create user account.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSuccess(`Account status for '${user.user_id}' updated to ${newStatus}.`);
        fetchUsers();
      } else {
        const d = await res.json();
        throw new Error(d.detail || 'Status update failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Password reset successfully for '${selectedUser.user_id}'.`);
        setShowResetModal(false);
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        throw new Error(data.detail || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveClassAssignments = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/users/${selectedUser.id}/class-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_classes: classAssignments })
      });
      if (res.ok) {
        setSuccess(`Class assignments updated for Staff '${selectedUser.user_id}'.`);
        setShowClassModal(false);
        fetchUsers();
      } else {
        const d = await res.json();
        throw new Error(d.detail || 'Failed to update class assignments');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const addClassAssignmentRow = () => {
    setClassAssignments([...classAssignments, { year: 1, section: 'A', is_class_advisor: false }]);
  };

  const removeClassAssignmentRow = (idx) => {
    setClassAssignments(classAssignments.filter((_, i) => i !== idx));
  };

  const resetCreateForm = () => {
    setCreateRole('STAFF');
    setCreateDept('AI & DS');
    setCreateUserId('');
    setCreateFullName('');
    setCreateEmail('');
    setCreatePhone('');
    setCreateDesignation('');
    setCreatePassword('');
    setCreateConfirmPassword('');
    setClassAssignments([{ year: 1, section: 'A', is_class_advisor: false }]);
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const roleMatch = roleFilter === 'ALL' || u.role === roleFilter;
    const deptMatch = deptFilter === 'ALL' || u.department_code === deptFilter || u.department_code === 'ALL';
    const statusMatch = statusFilter === 'ALL' || u.status === statusFilter;
    const searchMatch = !search || (
      u.user_id?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
    return roleMatch && deptMatch && statusMatch && searchMatch;
  });

  return (
    <div style={{ color: '#2B2926', paddingBottom: 40, fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        padding: '22px 26px',
        borderRadius: 11,
        marginBottom: 20,
        background: '#F4EFE6',
        border: '1px solid #D8CEBE',
        borderLeft: '4px solid #D69A18',
        boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#5A0A0A', margin: 0 }}>
                Admin User Management & Role Authorization
              </h2>
              <p style={{ fontSize: '13px', color: '#5C5750', margin: '3px 0 0' }}>
                Create accounts, assign department scopes, reset passwords, and manage class permissions for Principal, HOD, and Staff.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: activeTab === 'users' ? '1px solid #4B0909' : '1px solid #D8CEBE',
              background: activeTab === 'users' ? '#720F0F' : '#FAF7F0',
              color: activeTab === 'users' ? '#FFFFFF' : '#720F0F',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'users' ? '0 2px 6px rgba(114, 15, 15, 0.20)' : 'none',
              transition: 'all 200ms ease'
            }}
          >
            👥 User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: activeTab === 'history' ? '1px solid #4B0909' : '1px solid #D8CEBE',
              background: activeTab === 'history' ? '#720F0F' : '#FAF7F0',
              color: activeTab === 'history' ? '#FFFFFF' : '#720F0F',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'history' ? '0 2px 6px rgba(114, 15, 15, 0.20)' : 'none',
              transition: 'all 200ms ease'
            }}
          >
            📜 Login & Audit Log ({loginLogs.length})
          </button>
          <button
            onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid #A96E00',
              background: '#D69A18',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(214, 154, 24, 0.25)',
              transition: 'all 200ms ease'
            }}
          >
            ➕ Create User Account
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{
          background: '#FFEBEE',
          border: '1px solid #EF9A9A',
          color: '#C62828',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13.5px'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {success && (
        <div style={{
          background: '#E8F5E9',
          border: '1px solid #A5D6A7',
          color: '#2E7D32',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13.5px'
        }}>
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* TAB 1: USER ACCOUNTS TABLE */}
      {activeTab === 'users' && (
        <div>
          {/* Filters Bar */}
          <div style={{
            padding: '14px 18px',
            borderRadius: 11,
            marginBottom: 18,
            background: '#FAF7F0',
            border: '1px solid #D8CEBE',
            boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12
          }}>
            <input
              type="text"
              placeholder="Search User ID or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #D8CEBE',
                background: '#EFE9DF',
                color: '#2B2926',
                fontSize: '13px'
              }}
            />

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #D8CEBE',
                background: '#EFE9DF',
                color: '#2B2926',
                fontSize: '13px'
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="HOD">HOD</option>
              <option value="STAFF">Staff</option>
            </select>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #D8CEBE',
                background: '#EFE9DF',
                color: '#2B2926',
                fontSize: '13px'
              }}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #D8CEBE',
                background: '#EFE9DF',
                color: '#2B2926',
                fontSize: '13px'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* User List Table */}
          <div style={{
            borderRadius: 11,
            overflow: 'hidden',
            background: '#FAF7F0',
            border: '1px solid #D8CEBE',
            boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#720F0F', color: '#FFFFFF' }}>
                  <th style={{ padding: '12px 16px' }}>USER ID</th>
                  <th style={{ padding: '12px 16px' }}>FULL NAME</th>
                  <th style={{ padding: '12px 16px' }}>ROLE</th>
                  <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
                  <th style={{ padding: '12px 16px' }}>ASSIGNED CLASSES</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px' }}>LAST LOGIN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#777168' }}>
                      No user accounts found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id || user.user_id} style={{ borderBottom: '1px solid #D8CEBE', background: idx % 2 === 0 ? '#FAF7F0' : '#F5EFE6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#5A0A0A' }}>
                        {user.user_id || user.employee_id}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2B2926' }}>
                        {user.full_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: '11.5px', fontWeight: 700,
                          background: user.role === 'ADMIN' ? '#F9EED4' :
                                      user.role === 'PRINCIPAL' ? '#F9EED4' :
                                      user.role === 'HOD' ? '#F9EED4' : '#E8F5E9',
                          color: user.role === 'ADMIN' ? '#720F0F' :
                                 user.role === 'PRINCIPAL' ? '#720F0F' :
                                 user.role === 'HOD' ? '#720F0F' : '#24733E',
                          border: user.role === 'STAFF' ? '1px solid #A5D6A7' : '1px solid #D69A18'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#5C5750' }}>
                        {user.department_code || 'ALL'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {user.role === 'STAFF' && user.assigned_classes?.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {user.assigned_classes.map((c, i) => (
                              <span key={i} style={{ padding: '2px 7px', borderRadius: 4, background: '#F9EED4', border: '1px solid #D69A18', color: '#720F0F', fontSize: '11.5px', fontWeight: 600 }}>
                                Yr {c.year} – {c.section}
                              </span>
                            ))}
                          </div>
                        ) : user.role === 'HOD' ? (
                          <span style={{ color: '#5C5750', fontSize: '12px' }}>1st - 4th Year ({user.department_code})</span>
                        ) : (
                          <span style={{ color: '#5C5750', fontSize: '12px' }}>All Departments</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: '11.5px', fontWeight: 600,
                          background: user.status === 'Active' ? '#E8F5E9' : '#FFEBEE',
                          color: user.status === 'Active' ? '#24733E' : '#C62828',
                          border: user.status === 'Active' ? '1px solid #A5D6A7' : '1px solid #EF9A9A'
                        }}>
                          ● {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#777168', fontSize: '12px' }}>
                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                            title="Reset Password"
                            style={{ padding: '4px 9px', borderRadius: 4, border: '1px solid #D8CEBE', background: '#FAF7F0', color: '#720F0F', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            🔑 Password
                          </button>

                          {user.role === 'STAFF' && (
                            <button
                              onClick={() => { setSelectedUser(user); setClassAssignments(user.assigned_classes || []); setShowClassModal(true); }}
                              title="Assign Classes"
                              style={{ padding: '4px 9px', borderRadius: 4, border: '1px solid #D8CEBE', background: '#FAF7F0', color: '#720F0F', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              📚 Classes
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              padding: '4px 9px', borderRadius: 4,
                              border: user.status === 'Active' ? '1px solid #EF9A9A' : '1px solid #A5D6A7',
                              background: user.status === 'Active' ? '#FFEBEE' : '#E8F5E9',
                              color: user.status === 'Active' ? '#C62828' : '#24733E',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            {user.status === 'Active' ? '🚫 Deactivate' : '✅ Activate'}
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
      )}

      {/* TAB 2: AUDIT LOG & LOGIN HISTORY */}
      {activeTab === 'history' && (
        <div style={{
          borderRadius: 11, overflow: 'hidden', background: '#FAF7F0', border: '1px solid #D8CEBE', boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#720F0F', color: '#FFFFFF' }}>
                <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 16px' }}>USER ID</th>
                <th style={{ padding: '12px 16px' }}>ROLE</th>
                <th style={{ padding: '12px 16px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 16px' }}>RESULT</th>
                <th style={{ padding: '12px 16px' }}>FAILURE REASON / DETAILS</th>
                <th style={{ padding: '12px 16px' }}>IP ADDRESS</th>
              </tr>
            </thead>
            <tbody>
              {loginLogs.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#777168' }}>No audit history records available.</td></tr>
              ) : (
                loginLogs.map((log, idx) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #D8CEBE', background: idx % 2 === 0 ? '#FAF7F0' : '#F5EFE6' }}>
                    <td style={{ padding: '10px 16px', color: '#5C5750', fontSize: '12px' }}>
                      {log.login_time ? new Date(log.login_time).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#5A0A0A' }}>{log.user_id || 'N/A'}</td>
                    <td style={{ padding: '10px 16px', color: '#2B2926' }}>{log.role}</td>
                    <td style={{ padding: '10px 16px', color: '#5C5750' }}>{log.department_code || 'ALL'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{
                        padding: '2px 7px', borderRadius: 4, fontSize: '11.5px', fontWeight: 700,
                        background: log.is_success ? '#E8F5E9' : '#FFEBEE',
                        color: log.is_success ? '#24733E' : '#C62828',
                        border: log.is_success ? '1px solid #A5D6A7' : '1px solid #EF9A9A'
                      }}>
                        {log.is_success ? 'SUCCESS' : 'FAILED'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: log.is_success ? '#5C5750' : '#C62828', fontSize: '12px' }}>
                      {log.failure_reason || 'Authentication successful'}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#777168', fontSize: '12px' }}>{log.ip_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(70, 45, 20, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 580, maxWidth: '94vw', maxHeight: '90vh', overflowY: 'auto',
            padding: 26, borderRadius: 11, background: '#FAF7F0', border: '1px solid #D8CEBE',
            boxShadow: '0 8px 32px rgba(70, 45, 20, 0.18)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, borderBottom: '2px solid #D69A18', paddingBottom: 8 }}>
              <h3 style={{ margin: 0, color: '#5A0A0A', fontSize: '18px', fontWeight: 700 }}>
                ➕ Create New User Account
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#720F0F', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  Select Account Role *
                </label>
                <select
                  value={createRole}
                  onChange={e => handleRoleSelectChange(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="STAFF">Staff / Faculty</option>
                  <option value="HOD">Head of Department (HOD)</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>

              {/* Department Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  Assigned Department *
                </label>
                {createRole === 'ADMIN' ? (
                  <input
                    type="text"
                    value="All Departments"
                    disabled
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#E5DED2', border: '1px solid #D8CEBE', color: '#5C5750', fontSize: '13px' }}
                  />
                ) : (
                  <select
                    value={createDept}
                    onChange={e => handleDeptSelectChange(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px', fontWeight: 600 }}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Unique User ID / Employee ID */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  Unique User ID / Employee ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. STAFF_AIDS_001, HOD_CSE_001"
                  value={createUserId}
                  onChange={e => setCreateUserId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px', fontWeight: 600 }}
                />
              </div>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. K. Senthil Kumar"
                  value={createFullName}
                  onChange={e => setCreateFullName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                />
              </div>

              {/* Passwords */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={createConfirmPassword}
                    onChange={e => setCreateConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Staff Class Assignments */}
              {createRole === 'STAFF' && (
                <div style={{ background: '#F1EBE0', padding: 12, borderRadius: 8, border: '1px solid #D8CEBE' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#720F0F' }}>
                      Assign Staff Classes ({createDept})
                    </label>
                    <button
                      type="button"
                      onClick={addClassAssignmentRow}
                      style={{ padding: '4px 10px', borderRadius: 4, background: '#FAF7F0', border: '1px solid #D69A18', color: '#720F0F', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Class
                    </button>
                  </div>

                  {classAssignments.map((cls, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <select
                        value={cls.year}
                        onChange={e => {
                          const updated = [...classAssignments];
                          updated[idx].year = parseInt(e.target.value);
                          setClassAssignments(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '12.5px' }}
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                      </select>

                      <select
                        value={cls.section}
                        onChange={e => {
                          const updated = [...classAssignments];
                          updated[idx].section = e.target.value;
                          setClassAssignments(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '12.5px' }}
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                        <option value="D">Section D</option>
                      </select>

                      {classAssignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClassAssignmentRow(idx)}
                          style={{ padding: '4px 8px', borderRadius: 4, background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828', fontSize: '12px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#FAF7F0', border: '1px solid #D8CEBE', color: '#720F0F', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(114, 15, 15, 0.20)' }}
                >
                  CREATE ACCOUNT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(70, 45, 20, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 440, padding: 24, borderRadius: 11, background: '#FAF7F0', border: '1px solid #D8CEBE',
            boxShadow: '0 8px 32px rgba(70, 45, 20, 0.18)'
          }}>
            <h3 style={{ margin: '0 0 14px', color: '#5A0A0A', fontSize: '17px', fontWeight: 700, borderBottom: '2px solid #D69A18', paddingBottom: 6 }}>
              🔑 Reset Password for <span style={{ color: '#720F0F' }}>{selectedUser.user_id || selectedUser.employee_id}</span>
            </h3>

            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#FAF7F0', border: '1px solid #D8CEBE', color: '#720F0F', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CLASSES MODAL */}
      {showClassModal && selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(70, 45, 20, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 480, padding: 24, borderRadius: 11, background: '#FAF7F0', border: '1px solid #D8CEBE',
            boxShadow: '0 8px 32px rgba(70, 45, 20, 0.18)'
          }}>
            <h3 style={{ margin: '0 0 6px', color: '#5A0A0A', fontSize: '17px', fontWeight: 700 }}>
              📚 Class Assignments for Staff <span style={{ color: '#720F0F' }}>{selectedUser.user_id || selectedUser.employee_id}</span>
            </h3>
            <p style={{ fontSize: '13px', color: '#5C5750', margin: '0 0 14px' }}>
              Department: <strong style={{ color: '#5A0A0A' }}>{selectedUser.department_code}</strong>. The staff member will be granted access ONLY to these assigned classes.
            </p>

            <form onSubmit={handleSaveClassAssignments} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {classAssignments.map((cls, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={cls.year}
                    onChange={e => {
                      const updated = [...classAssignments];
                      updated[idx].year = parseInt(e.target.value);
                      setClassAssignments(updated);
                    }}
                    style={{ padding: '8px 10px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>

                  <select
                    value={cls.section}
                    onChange={e => {
                      const updated = [...classAssignments];
                      updated[idx].section = e.target.value;
                      setClassAssignments(updated);
                    }}
                    style={{ padding: '8px 10px', borderRadius: 6, background: '#EFE9DF', border: '1px solid #D8CEBE', color: '#2B2926', fontSize: '13px' }}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeClassAssignmentRow(idx)}
                    style={{ padding: '6px 10px', borderRadius: 4, background: '#FFEBEE', border: '1px solid #EF9A9A', color: '#C62828', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addClassAssignmentRow}
                style={{ padding: '6px 12px', borderRadius: 6, background: '#F1EBE0', border: '1px dashed #720F0F', color: '#720F0F', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}
              >
                + Add Another Class Assignment
              </button>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, background: '#FAF7F0', border: '1px solid #D8CEBE', color: '#720F0F', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
