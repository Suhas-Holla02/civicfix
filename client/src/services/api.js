// CivicFix API Client Service

const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('civicfix_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('civicfix_token', token);
  } else {
    localStorage.removeItem('civicfix_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('civicfix_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('civicfix_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('civicfix_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    async register(name, email, password, role = 'CITIZEN', department = null) {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, department })
      });
      if (res.token) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
      }
      return res;
    },

    async login(email, password) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
      }
      return res;
    },

    async getMe() {
      return request('/auth/me');
    },

    logout() {
      setAuthToken(null);
      setCurrentUser(null);
    }
  },

  // Complaints
  complaints: {
    async list(filters = {}) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== 'ALL' && val !== '') {
          params.append(key, val);
        }
      });
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request(`/complaints${qs}`);
    },

    async get(idOrCode) {
      return request(`/complaints/${idOrCode}`);
    },

    async create(complaintData) {
      return request('/complaints', {
        method: 'POST',
        body: JSON.stringify(complaintData)
      });
    },

    async updateStatus(id, status, notes = '') {
      return request(`/complaints/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes })
      });
    },

    async update(id, updates) {
      return request(`/complaints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },

    async delete(id) {
      return request(`/complaints/${id}`, {
        method: 'DELETE'
      });
    },

    async getMapPoints(category = 'ALL', status = 'ALL') {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (status && status !== 'ALL') params.append('status', status);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return request(`/complaints/map${qs}`);
    }
  },

  // AI & NLP Services
  ai: {
    async analyze(description, address = '') {
      return request('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ description, address })
      });
    },

    async checkDuplicates(payload) {
      return request('/ai/check-duplicates', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  },

  // Analytics
  analytics: {
    async getSummary() {
      return request('/analytics/summary');
    },

    async getCategories() {
      return request('/analytics/categories');
    },

    async getDepartments() {
      return request('/analytics/departments');
    },

    async getTrends() {
      return request('/analytics/trends');
    }
  },

  // Health
  async getHealth() {
    return request('/health');
  }
};
