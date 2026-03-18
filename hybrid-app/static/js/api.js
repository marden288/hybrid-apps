// =====================================================
//  api.js — Centralized API helper
// =====================================================

const API = {
  base: '/api',

  // ── Core request wrapper ────────────────────────
  async request(endpoint, method = 'GET', body = null, isFormData = false) {
    const headers = {};
    const token   = Auth.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData && body) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    const res  = await fetch(this.base + endpoint, opts);
    const data = await res.json();

    if (!res.ok) {
      // Token expired — force logout
      if (res.status === 401 && token) Auth.logout();
      throw new Error(data.error || `Server error (${res.status})`);
    }
    return data;
  },

  // ── Auth ────────────────────────────────────────
  auth: {
    register: (name, email, password, adminCode) =>
      API.request('/auth/register', 'POST', { name, email, password, adminCode }),
    login: (email, password) =>
      API.request('/auth/login', 'POST', { email, password }),
    me: () =>
      API.request('/auth/me')
  },

  // ── Videos ──────────────────────────────────────
  videos: {
    getAll: (category) =>
      API.request('/videos/' + (category ? `?category=${category}` : '')),
    upload: (formData) =>
      API.request('/videos/', 'POST', formData, true),
    delete: (id) =>
      API.request(`/videos/${id}`, 'DELETE'),
    view: (id) =>
      API.request(`/videos/${id}/view`, 'PATCH')
  },

  // ── Contact ─────────────────────────────────────
  contact: {
    send: (name, email, subject, message) =>
      API.request('/contact/', 'POST', { name, email, subject, message }),
    getAll: () =>
      API.request('/contact/')
  }
};
