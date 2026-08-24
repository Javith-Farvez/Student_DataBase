import React, { useState } from 'react';

export default function DeptLoginModal({ departments, onClose, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('STAFF');
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [email, setEmail] = useState('aids001.staff@vsb.ac.in');
  const [password, setPassword] = useState('pass123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        const dept = departments.find(d => d.id === selectedDeptId) || departments[0];
        onLoginSuccess({
          token: data.access_token,
          userName: data.full_name,
          role: selectedRole,
          department: dept
        });
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || 'Invalid email or password');
      }
    } catch (err) {
      // Fallback for demo if offline
      const dept = departments.find(d => d.id === selectedDeptId) || departments[0];
      onLoginSuccess({
        token: 'demo-token-2026',
        userName: selectedRole === 'SUPER_ADMIN' ? 'Super Administrator' : `${selectedRole} User`,
        role: selectedRole,
        department: dept
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel" style={{ width: 480, padding: 36, position: 'relative' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 20,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            marginBottom: 12,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            🔑
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>V.S.B SmartCampus ERP Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
            Select your role and department to authenticate
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Role Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              SELECT PORTAL ROLE
            </label>
            <select
              className="input-field"
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
                if (e.target.value === 'HOD') {
                  setEmail('hod.aids@vsb.ac.in');
                } else {
                  setEmail('aids001.staff@vsb.ac.in');
                }
              }}
            >
              <option value="STAFF">👩‍🏫 Faculty / Staff Portal</option>
              <option value="HOD">👔 Head of Department (HOD)</option>
            </select>
          </div>

          {/* Department Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              TARGET DEPARTMENT
            </label>
            <select
              className="input-field"
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. admin@campus360.edu"
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Quick Helper Badge */}
          <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            💡 Demo Admin Account: <code style={{ color: '#818cf8' }}>admin@campus360.edu</code> / <code style={{ color: '#818cf8' }}>admin123</code>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Sign In to Department →'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
