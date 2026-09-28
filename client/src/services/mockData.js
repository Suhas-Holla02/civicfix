// Fallback client-side data engine for static Vercel / Netlify deployments

const STORAGE_KEY = 'civicfix_client_db';

export function getClientStore() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {}
  }

  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const initial = {
    users: [
      { id: 1, name: 'Admin Officer', email: 'admin@civicfix.gov', role: 'ADMIN', department: 'Municipal Administration' },
      { id: 2, name: 'Priya Nair (Electrical Officer)', email: 'officer.electrical@civicfix.gov', role: 'OFFICER', department: 'Electrical Department' },
      { id: 3, name: 'David Chen (Roads Supervisor)', email: 'officer.roads@civicfix.gov', role: 'OFFICER', department: 'Roads & Infrastructure' },
      { id: 4, name: 'John Doe (Citizen)', email: 'citizen@example.com', role: 'CITIZEN', department: null }
    ],
    complaints: [
      {
        id: 1,
        complaint_code: 'CIV-2026-0001',
        user_id: 4,
        description: 'Streetlight near City College campus gate has been completely broken for 2 weeks, causing dark spots and safety concerns for night students.',
        summary: 'Broken streetlight near City College gate.',
        category: 'Infrastructure',
        subcategory: 'Streetlight',
        priority: 'MEDIUM',
        department: 'Electrical Department',
        status: 'IN PROGRESS',
        latitude: 12.971598,
        longitude: 77.594562,
        address: '42 College Road, Near North Gate, Central Ward',
        created_at: daysAgo(14),
        resolved_at: null,
        keywords: ['streetlight', 'college', 'broken', 'night', 'visibility'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(14), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_at: daysAgo(14), notes: 'AI Triage: Infrastructure (Streetlight) with MEDIUM priority.' },
          { old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_at: daysAgo(12), notes: 'Assigned to Electrical Department.' },
          { old_status: 'ASSIGNED', new_status: 'IN PROGRESS', changed_at: daysAgo(2), notes: 'Technician dispatched for LED fixture replacement.' }
        ]
      },
      {
        id: 2,
        complaint_code: 'CIV-2026-0002',
        user_id: 4,
        description: 'Dangerous deep pothole on MG Road near Metro Pillar 142. Two two-wheelers skidded yesterday during rain.',
        summary: 'Severe crater pothole near Metro Pillar 142.',
        category: 'Roads & Infrastructure',
        subcategory: 'Pothole',
        priority: 'HIGH',
        department: 'Roads & Infrastructure',
        status: 'ASSIGNED',
        latitude: 12.975420,
        longitude: 77.608310,
        address: 'MG Road, Opposite Metro Station, East Ward',
        created_at: daysAgo(5),
        resolved_at: null,
        keywords: ['pothole', 'mg road', 'crater', 'skidding', 'accident hazard'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(5), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_at: daysAgo(5), notes: 'AI Triage: Roads & Infrastructure with HIGH priority.' },
          { old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_at: daysAgo(3), notes: 'Forwarded to road repair quick response squad.' }
        ]
      },
      {
        id: 3,
        complaint_code: 'CIV-2026-0003',
        user_id: 4,
        description: 'Huge municipal garbage container overflowing for 4 days. Waste spilled onto footpath attracting stray animals and foul smell.',
        summary: 'Garbage overflow in Market Square.',
        category: 'Sanitation',
        subcategory: 'Garbage Overflow',
        priority: 'MEDIUM',
        department: 'Sanitation Department',
        status: 'RESOLVED',
        latitude: 12.969850,
        longitude: 77.589410,
        address: '12 Market Square, Near Gandhi Circle, West Ward',
        created_at: daysAgo(10),
        resolved_at: daysAgo(1),
        keywords: ['garbage', 'overflow', 'smell', 'market', 'waste'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(10), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_at: daysAgo(10), notes: 'AI Triage: Sanitation with MEDIUM priority.' },
          { old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_at: daysAgo(8), notes: 'Assigned to Sanitation Inspector.' },
          { old_status: 'ASSIGNED', new_status: 'IN PROGRESS', changed_at: daysAgo(3), notes: 'Compactor truck dispatched.' },
          { old_status: 'IN PROGRESS', new_status: 'RESOLVED', changed_at: daysAgo(1), notes: 'Area cleared, secondary bin installed and sanitized.' }
        ]
      },
      {
        id: 4,
        complaint_code: 'CIV-2026-0004',
        user_id: 4,
        description: 'High pressure municipal water pipe burst flooding the entire residential lane and wasting drinking water continuously.',
        summary: 'Burst water supply pipe flooding residential lane.',
        category: 'Water Supply',
        subcategory: 'Water Leakage',
        priority: 'HIGH',
        department: 'Water Supply Department',
        status: 'RESOLVED',
        latitude: 12.978200,
        longitude: 77.592100,
        address: 'Lane 4, Green Park Colony, North Ward',
        created_at: daysAgo(8),
        resolved_at: daysAgo(3),
        keywords: ['water leak', 'pipeline burst', 'flooding', 'drinking water'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(8), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'ASSIGNED', changed_at: daysAgo(7), notes: 'Emergency valve control dispatched.' },
          { old_status: 'ASSIGNED', new_status: 'RESOLVED', changed_at: daysAgo(3), notes: 'Burst joint replaced with 150mm ductile iron pipe.' }
        ]
      },
      {
        id: 5,
        complaint_code: 'CIV-2026-0005',
        user_id: 4,
        description: 'Open sewage manhole cover broken near Primary School. Extremely dangerous for small children walking to school.',
        summary: 'Uncovered dangerous manhole near primary school.',
        category: 'Public Works',
        subcategory: 'Drainage & Sewage',
        priority: 'HIGH',
        department: 'Public Works Department',
        status: 'IN PROGRESS',
        latitude: 12.973410,
        longitude: 77.601200,
        address: 'School Road, Near St. Anne School, Central Ward',
        created_at: daysAgo(3),
        resolved_at: null,
        keywords: ['manhole', 'open sewage', 'school', 'child hazard'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(3), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'IN PROGRESS', changed_at: daysAgo(1), notes: 'Safety barricade placed. Precast concrete cover order scheduled.' }
        ]
      },
      {
        id: 6,
        complaint_code: 'CIV-2026-0006',
        user_id: 4,
        description: 'Traffic signal at Brigade Junction stuck on red in all directions, causing massive 2km traffic jam during morning peak hours.',
        summary: 'Traffic signal failure at major Brigade Junction.',
        category: 'Traffic Management',
        subcategory: 'Traffic Signal',
        priority: 'HIGH',
        department: 'Traffic Department',
        status: 'RESOLVED',
        latitude: 12.972300,
        longitude: 77.607100,
        address: 'Brigade Road Junction, Central Ward',
        created_at: daysAgo(6),
        resolved_at: daysAgo(2),
        keywords: ['traffic signal', 'red light', 'traffic jam', 'junction'],
        status_history: [
          { old_status: null, new_status: 'REPORTED', changed_at: daysAgo(6), notes: 'Submitted by citizen.' },
          { old_status: 'REPORTED', new_status: 'RESOLVED', changed_at: daysAgo(2), notes: 'Microcontroller relay replaced and timing synchronized.' }
        ]
      }
    ]
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveClientStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
