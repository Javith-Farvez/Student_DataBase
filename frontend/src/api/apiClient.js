/**
 * VSB SmartCampus — Central API Client
 * All API calls go through this module.
 * Base URL: http://127.0.0.1:8000/api/v1
 */

const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// ─── Token Management ───────────────────────────────────────────────────────
export const getToken = () =>
  localStorage.getItem('vsb_token') || sessionStorage.getItem('vsb_token');

export const setToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem('vsb_token', token);
  } else {
    sessionStorage.setItem('vsb_token', token);
  }
};

export const clearToken = () => {
  localStorage.removeItem('vsb_token');
  localStorage.removeItem('vsb_user_role');
  localStorage.removeItem('vsb_user_data');
  sessionStorage.removeItem('vsb_token');
  sessionStorage.removeItem('vsb_user_role');
};

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle empty responses (204 No Content)
  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}

// ─── Convenience Methods ─────────────────────────────────────────────────────
export const api = {
  get: (path, params) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
          )
        )}`
      : path;
    return apiFetch(url, { method: 'GET' });
  },

  post: (path, body) =>
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),

  put: (path, body) =>
    apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: (path, body) =>
    apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (path) => apiFetch(path, { method: 'DELETE' }),

  /** For multipart file uploads */
  upload: (path, formData) => {
    const token = getToken();
    return fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.detail) || `Upload failed: ${res.status}`);
      return data;
    });
  },
};

export { BASE_URL };
export default api;
