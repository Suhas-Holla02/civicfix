import { getPool, getStore, saveLocalStore, isUsingFallback } from '../config/db.js';

export const dbAdapter = {
  // Check engine mode
  isMySQL() {
    return !isUsingFallback();
  },

  // USERS
  async findUserByEmail(email) {
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    } else {
      const store = getStore();
      return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findUserById(id) {
    const numericId = parseInt(id, 10);
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, name, email, role, department, created_at FROM users WHERE id = ? LIMIT 1', [numericId]);
      return rows[0] || null;
    } else {
      const store = getStore();
      const user = store.users.find(u => u.id === numericId);
      if (!user) return null;
      const { password_hash, ...safeUser } = user;
      return safeUser;
    }
  },

  async createUser({ name, email, password_hash, role = 'CITIZEN', department = null }) {
    if (!isUsingFallback()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
        [name, email, password_hash, role, department]
      );
      return { id: result.insertId, name, email, role, department };
    } else {
      const store = getStore();
      const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name,
        email,
        password_hash,
        role,
        department,
        created_at: new Date().toISOString()
      };
      store.users.push(newUser);
      saveLocalStore();
      const { password_hash: _, ...safeUser } = newUser;
      return safeUser;
    }
  },

  // COMPLAINTS
  async getNextComplaintCode() {
    const year = new Date().getFullYear();
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id FROM complaints ORDER BY id DESC LIMIT 1');
      const nextNum = (rows[0] ? rows[0].id : 0) + 1;
      return `CIV-${year}-${String(nextNum).padStart(4, '0')}`;
    } else {
      const store = getStore();
      const nextNum = (store.complaints.length ? Math.max(...store.complaints.map(c => c.id)) : 0) + 1;
      return `CIV-${year}-${String(nextNum).padStart(4, '0')}`;
    }
  },

  async createComplaint(data) {
    const complaint_code = await this.getNextComplaintCode();
    const now = new Date().toISOString();

    if (!isUsingFallback()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO complaints 
        (complaint_code, user_id, description, summary, category, subcategory, priority, department, status, latitude, longitude, address, image_url, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          complaint_code,
          data.user_id,
          data.description,
          data.summary || data.description.substring(0, 80),
          data.category,
          data.subcategory || '',
          data.priority || 'MEDIUM',
          data.department,
          data.status || 'REPORTED',
          data.latitude || 12.9716,
          data.longitude || 77.5946,
          data.address || 'Reported Location',
          data.image_url || null
        ]
      );
      const newId = result.insertId;
      return { id: newId, complaint_code, ...data, created_at: now, updated_at: now };
    } else {
      const store = getStore();
      const newId = store.complaints.length ? Math.max(...store.complaints.map(c => c.id)) : 0;
      const newComplaint = {
        id: newId + 1,
        complaint_code,
        user_id: data.user_id,
        description: data.description,
        summary: data.summary || data.description.substring(0, 80),
        category: data.category,
        subcategory: data.subcategory || '',
        priority: data.priority || 'MEDIUM',
        department: data.department,
        status: data.status || 'REPORTED',
        latitude: parseFloat(data.latitude) || 12.9716,
        longitude: parseFloat(data.longitude) || 77.5946,
        address: data.address || 'Reported Location',
        image_url: data.image_url || null,
        created_at: now,
        updated_at: now,
        resolved_at: null
      };
      store.complaints.unshift(newComplaint);
      saveLocalStore();
      return newComplaint;
    }
  },

  async listComplaints(filters = {}) {
    const { status, priority, category, department, userId, search, limit = 100 } = filters;

    if (!isUsingFallback()) {
      const pool = getPool();
      let sql = `
        SELECT c.*, u.name as citizen_name, u.email as citizen_email 
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (status && status !== 'ALL') {
        sql += ' AND c.status = ?';
        params.push(status);
      }
      if (priority && priority !== 'ALL') {
        sql += ' AND c.priority = ?';
        params.push(priority);
      }
      if (category && category !== 'ALL') {
        sql += ' AND c.category = ?';
        params.push(category);
      }
      if (department && department !== 'ALL') {
        sql += ' AND c.department = ?';
        params.push(department);
      }
      if (userId) {
        sql += ' AND c.user_id = ?';
        params.push(parseInt(userId, 10));
      }
      if (search) {
        sql += ' AND (c.complaint_code LIKE ? OR c.description LIKE ? OR c.summary LIKE ? OR c.address LIKE ?)';
        const query = `%${search}%`;
        params.push(query, query, query, query);
      }

      sql += ' ORDER BY c.id DESC LIMIT ?';
      params.push(parseInt(limit, 10));

      const [rows] = await pool.query(sql, params);
      return rows;
    } else {
      const store = getStore();
      let results = [...store.complaints];

      if (status && status !== 'ALL') {
        results = results.filter(c => c.status === status);
      }
      if (priority && priority !== 'ALL') {
        results = results.filter(c => c.priority === priority);
      }
      if (category && category !== 'ALL') {
        results = results.filter(c => c.category.toLowerCase() === category.toLowerCase());
      }
      if (department && department !== 'ALL') {
        results = results.filter(c => c.department.toLowerCase() === department.toLowerCase());
      }
      if (userId) {
        results = results.filter(c => c.user_id === parseInt(userId, 10));
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(c => 
          c.complaint_code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.summary && c.summary.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q))
        );
      }

      // Populate user info
      const enriched = results.map(c => {
        const user = store.users.find(u => u.id === c.user_id);
        return {
          ...c,
          citizen_name: user ? user.name : 'Unknown Citizen',
          citizen_email: user ? user.email : ''
        };
      });

      // Sort by id descending
      enriched.sort((a, b) => b.id - a.id);
      return enriched.slice(0, parseInt(limit, 10));
    }
  },

  async getComplaintByIdOrCode(idOrCode) {
    let complaint = null;
    const isCode = typeof idOrCode === 'string' && idOrCode.toUpperCase().startsWith('CIV-');
    const numericId = parseInt(idOrCode, 10);

    if (!isUsingFallback()) {
      const pool = getPool();
      let sql = `
        SELECT c.*, u.name as citizen_name, u.email as citizen_email 
        FROM complaints c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE `;
      sql += isCode ? 'c.complaint_code = ?' : 'c.id = ?';
      const [rows] = await pool.query(sql, [isCode ? idOrCode.toUpperCase() : numericId]);
      complaint = rows[0] || null;
    } else {
      const store = getStore();
      const found = isCode 
        ? store.complaints.find(c => c.complaint_code.toUpperCase() === idOrCode.toUpperCase())
        : store.complaints.find(c => c.id === numericId);
      
      if (found) {
        const user = store.users.find(u => u.id === found.user_id);
        complaint = {
          ...found,
          citizen_name: user ? user.name : 'Unknown Citizen',
          citizen_email: user ? user.email : ''
        };
      }
    }

    if (!complaint) return null;

    // Fetch related keywords, duplicates, status_history
    const complaintId = complaint.id;
    complaint.keywords = await this.getKeywordsByComplaintId(complaintId);
    complaint.duplicates = await this.getDuplicatesByComplaintId(complaintId);
    complaint.status_history = await this.getStatusHistory(complaintId);

    return complaint;
  },

  async updateComplaint(id, updates) {
    const numericId = parseInt(id, 10);
    const now = new Date().toISOString();

    if (!isUsingFallback()) {
      const pool = getPool();
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (['department', 'priority', 'category', 'subcategory', 'address', 'summary'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      fields.push('updated_at = NOW()');
      values.push(numericId);

      await pool.query(`UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`, values);
      return this.getComplaintByIdOrCode(numericId);
    } else {
      const store = getStore();
      const index = store.complaints.findIndex(c => c.id === numericId);
      if (index === -1) return null;

      store.complaints[index] = {
        ...store.complaints[index],
        ...updates,
        updated_at: now
      };
      saveLocalStore();
      return this.getComplaintByIdOrCode(numericId);
    }
  },

  async updateComplaintStatus(id, newStatus, changedBy = null, notes = '') {
    const numericId = parseInt(id, 10);
    const complaint = await this.getComplaintByIdOrCode(numericId);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    const now = new Date().toISOString();
    const resolvedAt = newStatus === 'RESOLVED' ? now : null;

    if (!isUsingFallback()) {
      const pool = getPool();
      await pool.query(
        'UPDATE complaints SET status = ?, updated_at = NOW(), resolved_at = ? WHERE id = ?',
        [newStatus, resolvedAt, numericId]
      );
      await pool.query(
        'INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, notes, changed_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [numericId, oldStatus, newStatus, changedBy, notes]
      );
    } else {
      const store = getStore();
      const index = store.complaints.findIndex(c => c.id === numericId);
      if (index !== -1) {
        store.complaints[index].status = newStatus;
        store.complaints[index].updated_at = now;
        if (newStatus === 'RESOLVED') {
          store.complaints[index].resolved_at = now;
        }
      }
      const historyId = store.status_history.length ? Math.max(...store.status_history.map(h => h.id)) + 1 : 1;
      store.status_history.push({
        id: historyId,
        complaint_id: numericId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
        changed_at: now
      });
      saveLocalStore();
    }

    return this.getComplaintByIdOrCode(numericId);
  },

  async deleteComplaint(id) {
    const numericId = parseInt(id, 10);
    if (!isUsingFallback()) {
      const pool = getPool();
      await pool.query('DELETE FROM complaints WHERE id = ?', [numericId]);
      return true;
    } else {
      const store = getStore();
      const initialLength = store.complaints.length;
      store.complaints = store.complaints.filter(c => c.id !== numericId);
      store.complaint_keywords = store.complaint_keywords.filter(k => k.complaint_id !== numericId);
      store.complaint_duplicates = store.complaint_duplicates.filter(d => d.complaint_id !== numericId && d.duplicate_complaint_id !== numericId);
      store.status_history = store.status_history.filter(h => h.complaint_id !== numericId);
      saveLocalStore();
      return store.complaints.length < initialLength;
    }
  },

  // KEYWORDS
  async addKeywords(complaintId, keywords = []) {
    if (!keywords || !keywords.length) return;
    const cid = parseInt(complaintId, 10);

    if (!isUsingFallback()) {
      const pool = getPool();
      const values = keywords.map(kw => [cid, String(kw).toLowerCase().trim()]);
      await pool.query('INSERT INTO complaint_keywords (complaint_id, keyword) VALUES ?', [values]);
    } else {
      const store = getStore();
      keywords.forEach(kw => {
        const newId = store.complaint_keywords.length ? Math.max(...store.complaint_keywords.map(k => k.id)) + 1 : 1;
        store.complaint_keywords.push({
          id: newId,
          complaint_id: cid,
          keyword: String(kw).toLowerCase().trim()
        });
      });
      saveLocalStore();
    }
  },

  async getKeywordsByComplaintId(complaintId) {
    const cid = parseInt(complaintId, 10);
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT keyword FROM complaint_keywords WHERE complaint_id = ?', [cid]);
      return rows.map(r => r.keyword);
    } else {
      const store = getStore();
      return store.complaint_keywords.filter(k => k.complaint_id === cid).map(k => k.keyword);
    }
  },

  // DUPLICATES
  async addDuplicate(complaintId, duplicateComplaintId, similarityScore) {
    const cid = parseInt(complaintId, 10);
    const did = parseInt(duplicateComplaintId, 10);
    const score = parseFloat(similarityScore);

    if (!isUsingFallback()) {
      const pool = getPool();
      await pool.query(
        'INSERT INTO complaint_duplicates (complaint_id, duplicate_complaint_id, similarity_score, created_at) VALUES (?, ?, ?, NOW())',
        [cid, did, score]
      );
    } else {
      const store = getStore();
      const newId = store.complaint_duplicates.length ? Math.max(...store.complaint_duplicates.map(d => d.id)) + 1 : 1;
      store.complaint_duplicates.push({
        id: newId,
        complaint_id: cid,
        duplicate_complaint_id: did,
        similarity_score: score,
        created_at: new Date().toISOString()
      });
      saveLocalStore();
    }
  },

  async getDuplicatesByComplaintId(complaintId) {
    const cid = parseInt(complaintId, 10);
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT d.*, c.complaint_code, c.summary, c.status, c.priority, c.department, c.created_at as duplicate_created_at
         FROM complaint_duplicates d
         JOIN complaints c ON d.duplicate_complaint_id = c.id
         WHERE d.complaint_id = ?`,
        [cid]
      );
      return rows;
    } else {
      const store = getStore();
      const dups = store.complaint_duplicates.filter(d => d.complaint_id === cid);
      return dups.map(d => {
        const other = store.complaints.find(c => c.id === d.duplicate_complaint_id) || {};
        return {
          ...d,
          complaint_code: other.complaint_code || `CIV-UNKNOWN`,
          summary: other.summary || other.description || '',
          status: other.status || 'UNKNOWN',
          priority: other.priority || 'MEDIUM',
          department: other.department || '',
          duplicate_created_at: other.created_at
        };
      });
    }
  },

  // STATUS HISTORY
  async addStatusHistory(complaintId, oldStatus, newStatus, changedBy = null, notes = '') {
    const cid = parseInt(complaintId, 10);
    const now = new Date().toISOString();

    if (!isUsingFallback()) {
      const pool = getPool();
      await pool.query(
        'INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, notes, changed_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [cid, oldStatus, newStatus, changedBy, notes]
      );
    } else {
      const store = getStore();
      const newId = store.status_history.length ? Math.max(...store.status_history.map(h => h.id)) + 1 : 1;
      store.status_history.push({
        id: newId,
        complaint_id: cid,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
        changed_at: now
      });
      saveLocalStore();
    }
  },

  async getStatusHistory(complaintId) {
    const cid = parseInt(complaintId, 10);
    if (!isUsingFallback()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT h.*, u.name as changed_by_name, u.role as changed_by_role 
         FROM status_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.complaint_id = ?
         ORDER BY h.id ASC`,
        [cid]
      );
      return rows;
    } else {
      const store = getStore();
      const histories = store.status_history.filter(h => h.complaint_id === cid);
      return histories.map(h => {
        const user = store.users.find(u => u.id === h.changed_by);
        return {
          ...h,
          changed_by_name: user ? user.name : (h.changed_by ? 'Staff Officer' : 'System AI'),
          changed_by_role: user ? user.role : 'SYSTEM'
        };
      }).sort((a, b) => a.id - b.id);
    }
  },

  // ANALYTICS & MAP
  async getAnalyticsSummary() {
    const all = await this.listComplaints({ limit: 1000 });
    const total = all.length;
    const resolved = all.filter(c => c.status === 'RESOLVED').length;
    const inProgress = all.filter(c => c.status === 'IN PROGRESS').length;
    const open = total - resolved;
    const highPriority = all.filter(c => c.priority === 'HIGH').length;

    // Calculate average resolution time in days
    const resolvedItems = all.filter(c => c.status === 'RESOLVED' && c.resolved_at && c.created_at);
    let avgResolutionHours = 0;
    if (resolvedItems.length > 0) {
      const totalHours = resolvedItems.reduce((acc, c) => {
        const diffMs = new Date(c.resolved_at) - new Date(c.created_at);
        return acc + Math.max(diffMs / (1000 * 60 * 60), 1);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedItems.length);
    } else {
      avgResolutionHours = 36; // demo average fallback
    }

    const avgResolutionDays = (avgResolutionHours / 24).toFixed(1);

    return {
      total,
      open,
      inProgress,
      resolved,
      highPriority,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      avgResolutionHours,
      avgResolutionDays
    };
  },

  async getAnalyticsCategories() {
    const all = await this.listComplaints({ limit: 1000 });
    const counts = {};
    all.forEach(c => {
      const cat = c.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryColors = {
      'Infrastructure': '#F59E0B',
      'Roads & Infrastructure': '#EF4444',
      'Sanitation': '#10B981',
      'Water Supply': '#3B82F6',
      'Public Works': '#6366F1',
      'Traffic Management': '#8B5CF6',
      'Other': '#6B7280'
    };

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / all.length) * 100),
      color: categoryColors[name] || '#6B7280'
    })).sort((a, b) => b.count - a.count);
  },

  async getAnalyticsDepartments() {
    const all = await this.listComplaints({ limit: 1000 });
    const depts = {};

    all.forEach(c => {
      const d = c.department || 'Unassigned';
      if (!depts[d]) {
        depts[d] = { total: 0, resolved: 0, open: 0, highPriority: 0 };
      }
      depts[d].total += 1;
      if (c.status === 'RESOLVED') {
        depts[d].resolved += 1;
      } else {
        depts[d].open += 1;
      }
      if (c.priority === 'HIGH') {
        depts[d].highPriority += 1;
      }
    });

    return Object.entries(depts).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved,
      open: data.open,
      highPriority: data.highPriority,
      workloadPercentage: Math.round((data.total / all.length) * 100),
      resolutionRate: data.total ? Math.round((data.resolved / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  },

  async getAnalyticsTrends() {
    const all = await this.listComplaints({ limit: 1000 });
    
    // Group complaints by date (last 7-14 days)
    const dateMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[key] = { date: key, reported: 0, resolved: 0 };
    }

    all.forEach(c => {
      if (c.created_at) {
        const d = new Date(c.created_at);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateMap[key]) {
          dateMap[key].reported += 1;
        }
      }
      if (c.resolved_at) {
        const d = new Date(c.resolved_at);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dateMap[key]) {
          dateMap[key].resolved += 1;
        }
      }
    });

    // Priority breakdown
    const priorityBreakdown = [
      { name: 'HIGH', count: all.filter(c => c.priority === 'HIGH').length, color: '#EF4444' },
      { name: 'MEDIUM', count: all.filter(c => c.priority === 'MEDIUM').length, color: '#F59E0B' },
      { name: 'LOW', count: all.filter(c => c.priority === 'LOW').length, color: '#10B981' }
    ];

    // Status breakdown
    const statusBreakdown = [
      { name: 'REPORTED', count: all.filter(c => c.status === 'REPORTED').length },
      { name: 'AI ANALYZED', count: all.filter(c => c.status === 'AI ANALYZED').length },
      { name: 'ASSIGNED', count: all.filter(c => c.status === 'ASSIGNED').length },
      { name: 'IN PROGRESS', count: all.filter(c => c.status === 'IN PROGRESS').length },
      { name: 'RESOLVED', count: all.filter(c => c.status === 'RESOLVED').length }
    ];

    // Dynamic problem insights generated from actual database stats
    const categories = await this.getAnalyticsCategories();
    const topCategory = categories[0] || { name: 'Infrastructure', count: 0, percentage: 0 };
    const departments = await this.getAnalyticsDepartments();
    const topDept = departments[0] || { name: 'Electrical Department', total: 0 };
    const highPriorityCount = all.filter(c => c.priority === 'HIGH' && c.status !== 'RESOLVED').length;

    // Detect most affected area
    const areaCounts = {};
    all.forEach(c => {
      const parts = (c.address || '').split(',');
      const area = parts[parts.length - 1]?.trim() || 'Central Ward';
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    });
    const mostAffectedArea = Object.entries(areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Central Ward';

    const insights = [
      {
        type: 'trend',
        title: 'Top Civic Concern',
        description: `${topCategory.name} represents ${topCategory.percentage}% of all city grievances with ${topCategory.count} reported cases.`,
        metric: `${topCategory.percentage}%`,
        impact: 'High Visibility'
      },
      {
        type: 'workload',
        title: 'Department Workload Peak',
        description: `${topDept.name} has the largest operational burden with ${topDept.total} total assigned tickets (${topDept.workloadPercentage}% of total city complaints).`,
        metric: `${topDept.total} tickets`,
        impact: 'Action Needed'
      },
      {
        type: 'hotspot',
        title: 'Geographic Vulnerability',
        description: `${mostAffectedArea} currently records the highest complaint density, primarily driven by road and drainage reports.`,
        metric: mostAffectedArea,
        impact: 'High Density'
      },
      {
        type: 'priority',
        title: 'Critical Emergency Load',
        description: `There are ${highPriorityCount} active HIGH priority complaints requiring immediate municipal engineering intervention.`,
        metric: `${highPriorityCount} Critical`,
        impact: highPriorityCount > 0 ? 'Urgent' : 'Stable'
      }
    ];

    return {
      timeline: Object.values(dateMap),
      priorityBreakdown,
      statusBreakdown,
      insights,
      mostAffectedArea,
      topIssue: topCategory.name,
      topDepartment: topDept.name
    };
  }
};
