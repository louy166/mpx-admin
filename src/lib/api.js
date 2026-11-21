const BACKEND_URL = 'http://31.97.69.178:8082';
const API_BASE = BACKEND_URL;

class ApiService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('mpx_access_token');
      this.refreshToken = localStorage.getItem('mpx_refresh_token');
    }
  }

  setTokens(access, refresh) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mpx_access_token', access);
      localStorage.setItem('mpx_refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mpx_access_token');
      localStorage.removeItem('mpx_refresh_token');
    }
  }

  async request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this.doRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retry = await fetch(url, { ...options, headers });
        if (!retry.ok) throw new Error(await retry.text());
        return retry.status === 204 ? null : retry.json();
      }
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  }

  async doRefresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  resolveFileUrl(url) {
    if (!url) return null;
    if (url.startsWith('http://localhost:8080')) {
      return url.replace('http://localhost:8080', BACKEND_URL);
    }
    if (url.startsWith('/uploads/')) {
      return `${BACKEND_URL}${url}`;
    }
    return url;
  }

  // Auth
  requestOtp(telephone) {
    return this.request('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ telephone }),
    });
  }

  verifyOtp(telephone, otp) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ telephone, otp }),
    });
  }

  logout() {
    return this.request('/auth/logout', { method: 'POST' }).finally(() => this.clearTokens());
  }

  // Users
  getMe() {
    return this.request('/users/me');
  }

  updateProfile(data) {
    return this.request('/users/me', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Properties
  getProperties(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/properties${q ? '?' + q : ''}`);
  }

  getFeaturedProperties() {
    return this.request('/properties/featured');
  }

  getProperty(id) {
    return this.request(`/properties/${id}`);
  }

  createProperty(data) {
    return this.request('/properties', { method: 'POST', body: JSON.stringify(data) });
  }

  updateProperty(id, data) {
    return this.request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  updatePropertyStatus(id, status) {
    return this.request(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut: status }),
    });
  }

  // Admin-specific
  getAllUsers(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/users${q ? '?' + q : ''}`);
  }

  getStats() {
    return this.request('/admin/stats');
  }

  getPlans() {
    return this.request('/plans');
  }

  // Notifications
  getNotifications(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request(`/notifications${q ? '?' + q : ''}`);
  }
}

const api = new ApiService();
export default api;
export { BACKEND_URL as API_BASE };