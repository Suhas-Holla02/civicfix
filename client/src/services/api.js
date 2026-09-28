// CivicFix API Client Service with Automatic Static Vercel Resilience
import { getClientStore, saveClientStore } from './mockData.js';
import { fallbackLocalAI } from './localAI.js';
import { detectDuplicates } from './duplicateDetector.js';
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
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    // If backend is unreachable (e.g. running on static Vercel preview), use client-side resilience
    return handleClientFallback(endpoint, options);
  }
}

function handleClientFallback(endpoint, options = {}) {
  const store = getClientStore();
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = store.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (user) {
      const token = 'mock_jwt_token_' + user.id;
      setAuthToken(token);
      setCurrentUser(user);
      return { user, token };
    }
    throw new Error('Invalid email or password');
  }

  // Auth: Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const newUser = {
      id: store.users.length + 1,
      name: body.name,
      email: body.email,
      role: body.role || 'CITIZEN',
      department: body.department || null
    };
    store.users.push(newUser);
    saveClientStore(store);
    const token = 'mock_jwt_token_' + newUser.id;
    setAuthToken(token);
    setCurrentUser(newUser);
    return { user: newUser, token };
  }

  // Auth: Me
  if (endpoint === '/auth/me') {
    const cur = getCurrentUser() || store.users[0];
    return { user: cur };
  }

  // AI: Analyze
  if (endpoint === '/ai/analyze' && method === 'POST') {
    const analysis = fallbackLocalAI(body.description, body.address);
    return { analysis };
  }

  // AI: Check Duplicates
  if (endpoint === '/ai/check-duplicates' && method === 'POST') {
    const duplicates = detectDuplicates(body, store.complaints);
    return { duplicates };
  }

  // Complaints: List
  if (endpoint.startsWith('/complaints') && method === 'GET' && !endpoint.includes('/map') && !endpoint.match(/\/complaints\/[^\?]+/)) {
    return { complaints: store.complaints, total: store.complaints.length };
  }

  // Complaints: Map
  if (endpoint.startsWith('/complaints/map')) {
    const points = store.complaints.map(c => ({
      id: c.id,
      complaint_code: c.complaint_code,
      summary: c.summary,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      priority: c.priority,
      department: c.department,
      status: c.status,
      latitude: c.latitude,
      longitude: c.longitude,
      address: c.address,
      created_at: c.created_at
    }));
    return { points, total: points.length };
  }

  // Complaints: Get Single
  const singleMatch = endpoint.match(/\/complaints\/([^\/\?]+)/);
  if (singleMatch && method === 'GET' && singleMatch[1] !== 'map') {
    const identifier = singleMatch[1];
    const found = store.complaints.find(c => 
      c.complaint_code.toUpperCase() === identifier.toUpperCase() || String(c.id) === String(identifier)
    );
    if (found) {
      return { complaint: found };
    }
    throw new Error('Complaint not found');
  }

  // Complaints: Create
  if (endpoint === '/complaints' && method === 'POST') {
    const analysis = fallbackLocalAI(body.description, body.address);
    const code = `CIV-2026-${String(store.complaints.length + 1).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newComp = {
      id: store.complaints.length + 1,
      complaint_code: code,
      user_id: getCurrentUser()?.id || 4,
      citizen_name: getCurrentUser()?.name || 'John Doe (Citizen)',
      description: body.description,
      summary: analysis.summary,
      category: analysis.category,
      subcategory: analysis.subcategory,
      priority: analysis.priority,
      department: analysis.department,
      status: 'ASSIGNED',
      latitude: body.latitude || 12.9716,
      longitude: body.longitude || 77.5946,
      address: body.address || 'Reported Location',
      image_url: body.image_url || null,
      created_at: now,
      resolved_at: null,
      keywords: analysis.keywords,
      status_history: [
        { old_status: null, new_status: 'REPORTED', changed_at: now, notes: 'Complaint submitted by citizen.' },
        { old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_at: now, notes: `AI classified as ${analysis.category} with ${analysis.priority} priority.` },
        { old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_at: now, notes: `Routed to ${analysis.department}.` }
      ]
    };
    store.complaints.unshift(newComp);
    saveClientStore(store);
    return { complaint: newComp, message: 'Complaint submitted successfully' };
  }

  // Complaints: Update Status
  const statusMatch = endpoint.match(/\/complaints\/([^\/]+)\/status/);
  if (statusMatch && method === 'PUT') {
    const id = statusMatch[1];
    const comp = store.complaints.find(c => String(c.id) === String(id) || c.complaint_code === id);
    if (comp) {
      const oldStatus = comp.status;
      comp.status = body.status;
      if (body.status === 'RESOLVED') comp.resolved_at = new Date().toISOString();
      comp.status_history = comp.status_history || [];
      comp.status_history.push({
        old_status: oldStatus,
        new_status: body.status,
        changed_at: new Date().toISOString(),
        notes: body.notes || `Status changed from ${oldStatus} to ${body.status}`
      });
      saveClientStore(store);
      return { complaint: comp, message: 'Status updated' };
    }
  }

  // Analytics: Summary
  if (endpoint === '/analytics/summary') {
    const total = store.complaints.length;
    const resolved = store.complaints.filter(c => c.status === 'RESOLVED').length;
    return {
      summary: {
        total,
        open: total - resolved,
        inProgress: store.complaints.filter(c => c.status === 'IN PROGRESS').length,
        resolved,
        highPriority: store.complaints.filter(c => c.priority === 'HIGH').length,
        resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
        avgResolutionDays: '3.2',
        avgResolutionHours: 76
      }
    };
  }

  // Analytics: Categories
  if (endpoint === '/analytics/categories') {
    const counts = {};
    store.complaints.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1; });
    const categories = Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / store.complaints.length) * 100)
    }));
    return { categories };
  }

  // Analytics: Departments
  if (endpoint === '/analytics/departments') {
    const depts = {};
    store.complaints.forEach(c => {
      if (!depts[c.department]) depts[c.department] = { total: 0, resolved: 0, open: 0 };
      depts[c.department].total += 1;
      if (c.status === 'RESOLVED') depts[c.department].resolved += 1;
      else depts[c.department].open += 1;
    });
    const departments = Object.entries(depts).map(([name, d]) => ({
      name,
      total: d.total,
      resolved: d.resolved,
      open: d.open,
      resolutionRate: d.total ? Math.round((d.resolved / d.total) * 100) : 0
    }));
    return { departments };
  }

  // Analytics: Trends
  if (endpoint === '/analytics/trends') {
    return {
      trends: {
        timeline: [
          { date: 'Sep 20', reported: 2, resolved: 1 },
          { date: 'Sep 21', reported: 3, resolved: 2 },
          { date: 'Sep 22', reported: 1, resolved: 1 },
          { date: 'Sep 23', reported: 4, resolved: 3 },
          { date: 'Sep 24', reported: 2, resolved: 2 },
          { date: 'Sep 25', reported: 5, resolved: 3 },
          { date: 'Sep 26', reported: 3, resolved: 2 }
        ],
        priorityBreakdown: [
          { name: 'HIGH', count: 3 },
          { name: 'MEDIUM', count: 2 },
          { name: 'LOW', count: 1 }
        ],
        statusBreakdown: [
          { name: 'REPORTED', count: 1 },
          { name: 'ASSIGNED', count: 2 },
          { name: 'IN PROGRESS', count: 2 },
          { name: 'RESOLVED', count: 3 }
        ],
        insights: [
          { title: 'Top Civic Concern', impact: 'High Visibility', description: 'Infrastructure and Streetlighting account for 40% of grievances.', metric: '40%' },
          { title: 'Department Workload Peak', impact: 'Action Needed', description: 'Electrical Department has highest ticket volume.', metric: 'High' }
        ],
        mostAffectedArea: 'Central Ward',
        topIssue: 'Infrastructure',
        topDepartment: 'Electrical Department'
      }
    };
  }

  return {};
}

export const api = {
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

  async getHealth() {
    return request('/health');
  }
};
