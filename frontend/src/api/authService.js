/**
 * VSB SmartCampus — Auth Service
 * Handles login for Admin, Principal, HOD, Staff, Student, Parent roles.
 */
import api, { setToken, clearToken } from './apiClient';

// ─── Staff / HOD / Principal / Admin Login ───────────────────────────────────
export async function staffLogin({ loginId, password, portalRole, departmentCode }) {
  const data = await api.post('/auth/login', {
    login_id: loginId,
    password,
    portal_role: portalRole,
    department_code: departmentCode || undefined,
  });
  return data; // { access_token, token_type, employee_id, role, full_name, department_code, ... }
}

// ─── Student Portal Login ────────────────────────────────────────────────────
export async function studentLogin({ registerNumber, password }) {
  const data = await api.post('/auth/student-login', {
    register_number: registerNumber,
    password,
  });
  return data;
}

// ─── Parent Portal Login ─────────────────────────────────────────────────────
export async function parentLogin({ registerNumber, password }) {
  const data = await api.post('/auth/parent-login', {
    register_number: registerNumber,
    password,
  });
  return data;
}

// ─── Change Password ─────────────────────────────────────────────────────────
export async function changePassword({ currentPassword, newPassword }) {
  return api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
}

// ─── Logout (client-side only) ───────────────────────────────────────────────
export function logout() {
  clearToken();
}

// ─── Helper: store login session ─────────────────────────────────────────────
export function storeSession(data, rememberMe = true) {
  if (data.access_token) {
    setToken(data.access_token, rememberMe);
  }
  const sessionData = {
    token: data.access_token,
    employeeId: data.employee_id,
    userName: data.full_name,
    role: data.role,
    departmentCode: data.department_code,
    rememberMe,
  };
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('vsb_user_data', JSON.stringify(sessionData));
  storage.setItem('vsb_user_role', data.role || '');
  return sessionData;
}
