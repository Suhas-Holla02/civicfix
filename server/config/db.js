import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let useFallback = false;

// Path to data store file when MySQL is unavailable
const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'civicfix_db.json');

// Initial seed data generator for fallback engine
export function getInitialSeedData() {
  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  const users = [
    {
      id: 1,
      name: 'Admin Officer',
      email: 'admin@civicfix.gov',
      password_hash: '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', // admin123
      role: 'ADMIN',
      department: 'Municipal Administration',
      created_at: daysAgo(30)
    },
    {
      id: 2,
      name: 'Priya Nair (Electrical Officer)',
      email: 'officer.electrical@civicfix.gov',
      password_hash: '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', // admin123
      role: 'OFFICER',
      department: 'Electrical Department',
      created_at: daysAgo(30)
    },
    {
      id: 3,
      name: 'David Chen (Roads Supervisor)',
      email: 'officer.roads@civicfix.gov',
      password_hash: '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', // admin123
      role: 'OFFICER',
      department: 'Roads & Infrastructure',
      created_at: daysAgo(30)
    },
    {
      id: 4,
      name: 'John Doe (Citizen)',
      email: 'citizen@example.com',
      password_hash: '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', // citizen123
      role: 'CITIZEN',
      department: null,
      created_at: daysAgo(25)
    },
    {
      id: 5,
      name: 'Sarah Jenkins',
      email: 'sarah.citizen@example.com',
      password_hash: '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', // citizen123
      role: 'CITIZEN',
      department: null,
      created_at: daysAgo(20)
    },
    {
      id: 6,
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password_hash: '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', // citizen123
      role: 'CITIZEN',
      department: null,
      created_at: daysAgo(15)
    }
  ];

  const complaints = [
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
      image_url: null,
      created_at: daysAgo(14),
      updated_at: daysAgo(2),
      resolved_at: null
    },
    {
      id: 2,
      complaint_code: 'CIV-2026-0002',
      user_id: 5,
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
      image_url: null,
      created_at: daysAgo(5),
      updated_at: daysAgo(3),
      resolved_at: null
    },
    {
      id: 3,
      complaint_code: 'CIV-2026-0003',
      user_id: 6,
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
      image_url: null,
      created_at: daysAgo(10),
      updated_at: daysAgo(1),
      resolved_at: daysAgo(1)
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
      image_url: null,
      created_at: daysAgo(8),
      updated_at: daysAgo(3),
      resolved_at: daysAgo(3)
    },
    {
      id: 5,
      complaint_code: 'CIV-2026-0005',
      user_id: 5,
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
      image_url: null,
      created_at: daysAgo(3),
      updated_at: daysAgo(1),
      resolved_at: null
    },
    {
      id: 6,
      complaint_code: 'CIV-2026-0006',
      user_id: 6,
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
      image_url: null,
      created_at: daysAgo(6),
      updated_at: daysAgo(2),
      resolved_at: daysAgo(2)
    },
    {
      id: 7,
      complaint_code: 'CIV-2026-0007',
      user_id: 4,
      description: 'Streetlight pole tilted and sparking occasionally near residential society entrance during wind.',
      summary: 'Sparking and tilted streetlight pole.',
      category: 'Infrastructure',
      subcategory: 'Streetlight',
      priority: 'HIGH',
      department: 'Electrical Department',
      status: 'ASSIGNED',
      latitude: 12.976800,
      longitude: 77.598500,
      address: 'Sunrise Apartments, 8th Main, South Ward',
      image_url: null,
      created_at: daysAgo(2),
      updated_at: daysAgo(1),
      resolved_at: null
    },
    {
      id: 8,
      complaint_code: 'CIV-2026-0008',
      user_id: 5,
      description: 'Three continuous potholes forming a trench along 100 Feet Road right after the bus terminal.',
      summary: 'Multiple road potholes near bus terminal.',
      category: 'Roads & Infrastructure',
      subcategory: 'Pothole',
      priority: 'MEDIUM',
      department: 'Roads & Infrastructure',
      status: 'IN PROGRESS',
      latitude: 12.981200,
      longitude: 77.611000,
      address: '100 Feet Road, Near Bus Terminal, East Ward',
      image_url: null,
      created_at: daysAgo(4),
      updated_at: daysAgo(1),
      resolved_at: null
    },
    {
      id: 9,
      complaint_code: 'CIV-2026-0009',
      user_id: 6,
      description: 'Commercial market dumping untreated organic waste into open stormwater drain, clogging flow.',
      summary: 'Drainage blocked due to commercial dumping.',
      category: 'Public Works',
      subcategory: 'Drainage & Sewage',
      priority: 'MEDIUM',
      department: 'Public Works Department',
      status: 'AI ANALYZED',
      latitude: 12.968100,
      longitude: 77.592800,
      address: 'Old Market Lane, West Ward',
      image_url: null,
      created_at: hoursAgo(24),
      updated_at: hoursAgo(12),
      resolved_at: null
    },
    {
      id: 10,
      complaint_code: 'CIV-2026-0010',
      user_id: 4,
      description: 'Water supply pipeline leaking underground causing asphalt swelling and damp road surface.',
      summary: 'Underground water pipeline leak.',
      category: 'Water Supply',
      subcategory: 'Water Leakage',
      priority: 'LOW',
      department: 'Water Supply Department',
      status: 'REPORTED',
      latitude: 12.974900,
      longitude: 77.587300,
      address: '5th Cross, Malleshwaram, North Ward',
      image_url: null,
      created_at: hoursAgo(18),
      updated_at: hoursAgo(18),
      resolved_at: null
    },
    {
      id: 11,
      complaint_code: 'CIV-2026-0011',
      user_id: 5,
      description: 'Pedestrian zebra crossing paint completely faded and signal countdown timer display broken.',
      summary: 'Faded pedestrian zebra crossing and broken timer.',
      category: 'Traffic Management',
      subcategory: 'Traffic Signal',
      priority: 'LOW',
      department: 'Traffic Department',
      status: 'RESOLVED',
      latitude: 12.970500,
      longitude: 77.604200,
      address: 'Koramangala 4th Block Signal, South Ward',
      image_url: null,
      created_at: daysAgo(12),
      updated_at: daysAgo(5),
      resolved_at: daysAgo(5)
    },
    {
      id: 12,
      complaint_code: 'CIV-2026-0012',
      user_id: 6,
      description: 'Public park perimeter light fixtures vandalized, non-functional for past one week.',
      summary: 'Park pathway light fixtures non-functional.',
      category: 'Infrastructure',
      subcategory: 'Streetlight',
      priority: 'LOW',
      department: 'Electrical Department',
      status: 'IN PROGRESS',
      latitude: 12.977100,
      longitude: 77.603400,
      address: 'Cubbon Park South Gate, Central Ward',
      image_url: null,
      created_at: daysAgo(7),
      updated_at: daysAgo(2),
      resolved_at: null
    },
    {
      id: 13,
      complaint_code: 'CIV-2026-0013',
      user_id: 4,
      description: 'Waste pickup truck missed collection for 3 consecutive days in Sector 3 residential area.',
      summary: 'Residential waste collection missed.',
      category: 'Sanitation',
      subcategory: 'Garbage Overflow',
      priority: 'MEDIUM',
      department: 'Sanitation Department',
      status: 'RESOLVED',
      latitude: 12.982500,
      longitude: 77.596000,
      address: 'Sector 3 Layout, North Ward',
      image_url: null,
      created_at: daysAgo(9),
      updated_at: daysAgo(4),
      resolved_at: daysAgo(4)
    },
    {
      id: 14,
      complaint_code: 'CIV-2026-0014',
      user_id: 5,
      description: 'Exposed high tension electrical cable laying across pedestrian sidewalk after storm.',
      summary: 'Exposed high-voltage electrical cable on sidewalk.',
      category: 'Infrastructure',
      subcategory: 'Electrical Hazard',
      priority: 'HIGH',
      department: 'Electrical Department',
      status: 'RESOLVED',
      latitude: 12.971900,
      longitude: 77.599100,
      address: 'Church Street Walkway, Central Ward',
      image_url: null,
      created_at: daysAgo(11),
      updated_at: daysAgo(7),
      resolved_at: daysAgo(7)
    },
    {
      id: 15,
      complaint_code: 'CIV-2026-0015',
      user_id: 6,
      description: 'Storm drain overflow flooding ground floor residences after moderate evening rain.',
      summary: 'Stormwater drain overflowing into houses.',
      category: 'Public Works',
      subcategory: 'Drainage & Sewage',
      priority: 'HIGH',
      department: 'Public Works Department',
      status: 'ASSIGNED',
      latitude: 12.969200,
      longitude: 77.595400,
      address: 'Lakeview Layout, South Ward',
      image_url: null,
      created_at: hoursAgo(36),
      updated_at: hoursAgo(10),
      resolved_at: null
    },
    {
      id: 16,
      complaint_code: 'CIV-2026-0016',
      user_id: 4,
      description: 'Lamp post opposite College Gate 2 blinking continuously then completely turning off.',
      summary: 'Streetlight flickering and turning off near College.',
      category: 'Infrastructure',
      subcategory: 'Streetlight',
      priority: 'MEDIUM',
      department: 'Electrical Department',
      status: 'ASSIGNED',
      latitude: 12.971700,
      longitude: 77.594700,
      address: '46 College Road, Gate 2, Central Ward',
      image_url: null,
      created_at: daysAgo(3),
      updated_at: daysAgo(1),
      resolved_at: null
    }
  ];

  const complaint_keywords = [
    { id: 1, complaint_id: 1, keyword: 'streetlight' },
    { id: 2, complaint_id: 1, keyword: 'college' },
    { id: 3, complaint_id: 1, keyword: 'broken' },
    { id: 4, complaint_id: 1, keyword: 'night' },
    { id: 5, complaint_id: 1, keyword: 'visibility' },
    { id: 6, complaint_id: 2, keyword: 'pothole' },
    { id: 7, complaint_id: 2, keyword: 'mg road' },
    { id: 8, complaint_id: 2, keyword: 'crater' },
    { id: 9, complaint_id: 2, keyword: 'skidding' },
    { id: 10, complaint_id: 2, keyword: 'accident hazard' },
    { id: 11, complaint_id: 3, keyword: 'garbage' },
    { id: 12, complaint_id: 3, keyword: 'overflow' },
    { id: 13, complaint_id: 3, keyword: 'smell' },
    { id: 14, complaint_id: 3, keyword: 'market' },
    { id: 15, complaint_id: 4, keyword: 'water leak' },
    { id: 16, complaint_id: 4, keyword: 'pipeline burst' },
    { id: 17, complaint_id: 4, keyword: 'flooding' },
    { id: 18, complaint_id: 5, keyword: 'manhole' },
    { id: 19, complaint_id: 5, keyword: 'open sewage' },
    { id: 20, complaint_id: 5, keyword: 'school' },
    { id: 21, complaint_id: 6, keyword: 'traffic signal' },
    { id: 22, complaint_id: 6, keyword: 'red light' },
    { id: 23, complaint_id: 6, keyword: 'traffic jam' },
    { id: 24, complaint_id: 7, keyword: 'streetlight' },
    { id: 25, complaint_id: 7, keyword: 'sparking' },
    { id: 26, complaint_id: 8, keyword: 'pothole' },
    { id: 27, complaint_id: 8, keyword: 'road damage' },
    { id: 28, complaint_id: 9, keyword: 'drainage' },
    { id: 29, complaint_id: 9, keyword: 'waste dumping' },
    { id: 30, complaint_id: 10, keyword: 'water leak' },
    { id: 31, complaint_id: 11, keyword: 'traffic signal' },
    { id: 32, complaint_id: 12, keyword: 'park light' },
    { id: 33, complaint_id: 13, keyword: 'garbage pickup' },
    { id: 34, complaint_id: 14, keyword: 'exposed wire' },
    { id: 35, complaint_id: 15, keyword: 'drainage overflow' },
    { id: 36, complaint_id: 16, keyword: 'streetlight' },
    { id: 37, complaint_id: 16, keyword: 'college' }
  ];

  const complaint_duplicates = [
    {
      id: 1,
      complaint_id: 16,
      duplicate_complaint_id: 1,
      similarity_score: 0.88,
      created_at: daysAgo(3)
    }
  ];

  const status_history = [
    { id: 1, complaint_id: 1, old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_by: null, notes: 'Classified as Infrastructure (Streetlight) with MEDIUM priority by CivicFix AI.', changed_at: daysAgo(14) },
    { id: 2, complaint_id: 1, old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_by: 1, notes: 'Assigned to Electrical Department team.', changed_at: daysAgo(12) },
    { id: 3, complaint_id: 1, old_status: 'ASSIGNED', new_status: 'IN PROGRESS', changed_by: 2, notes: 'Work order #EL-894 generated. Technician dispatched.', changed_at: daysAgo(2) },
    { id: 4, complaint_id: 2, old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_by: null, notes: 'Classified as Roads & Infrastructure with HIGH priority.', changed_at: daysAgo(5) },
    { id: 5, complaint_id: 2, old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_by: 1, notes: 'Forwarded to road repair quick response squad.', changed_at: daysAgo(3) },
    { id: 6, complaint_id: 3, old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_by: null, notes: 'Classified as Sanitation with MEDIUM priority.', changed_at: daysAgo(10) },
    { id: 7, complaint_id: 3, old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_by: 1, notes: 'Assigned to Sanitation Inspector.', changed_at: daysAgo(8) },
    { id: 8, complaint_id: 3, old_status: 'ASSIGNED', new_status: 'IN PROGRESS', changed_by: 1, notes: 'Compactor truck dispatched.', changed_at: daysAgo(3) },
    { id: 9, complaint_id: 3, old_status: 'IN PROGRESS', new_status: 'RESOLVED', changed_by: 1, notes: 'Area cleared, secondary bin installed and sanitized.', changed_at: daysAgo(1) },
    { id: 10, complaint_id: 4, old_status: 'REPORTED', new_status: 'AI ANALYZED', changed_by: null, notes: 'Classified as Water Supply with HIGH priority.', changed_at: daysAgo(8) },
    { id: 11, complaint_id: 4, old_status: 'AI ANALYZED', new_status: 'ASSIGNED', changed_by: 1, notes: 'Emergency valve control dispatched.', changed_at: daysAgo(7) },
    { id: 12, complaint_id: 4, old_status: 'ASSIGNED', new_status: 'IN PROGRESS', changed_by: 1, notes: 'Excavation and pipe replacement in progress.', changed_at: daysAgo(5) },
    { id: 13, complaint_id: 4, old_status: 'IN PROGRESS', new_status: 'RESOLVED', changed_by: 1, notes: 'Burst joint replaced with ductile iron pipe.', changed_at: daysAgo(3) }
  ];

  return { users, complaints, complaint_keywords, complaint_duplicates, status_history };
}

// Local store memory & disk sync
let localStore = null;

function loadLocalStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(dataFilePath)) {
    try {
      const content = fs.readFileSync(dataFilePath, 'utf8');
      localStore = JSON.parse(content);
      return localStore;
    } catch (e) {
      console.warn('[CivicFix DB] Corrupted local store, re-seeding...');
    }
  }

  localStore = getInitialSeedData();
  saveLocalStore();
  return localStore;
}

export function saveLocalStore() {
  if (!localStore) return;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(localStore, null, 2), 'utf8');
}

export async function initDatabase() {
  try {
    console.log(`[CivicFix DB] Attempting connection to MySQL at ${config.db.host}:${config.db.port}...`);
    
    // First try connecting to MySQL server directly
    const tempConnection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      port: config.db.port,
      connectTimeout: 2000
    });

    // Create database if not exists
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\`;`);
    await tempConnection.end();

    // Now initialize pool with the specific database
    pool = mysql.createPool(config.db);
    
    // Execute schema if tables don't exist
    const [tables] = await pool.query('SHOW TABLES;');
    if (tables.length === 0) {
      console.log('[CivicFix DB] Initializing MySQL tables from schema.sql...');
      const schemaPath = path.join(__dirname, '../../database/schema.sql');
      const seedPath = path.join(__dirname, '../../database/seed.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));
        for (const statement of statements) {
          await pool.query(statement);
        }
      }

      if (fs.existsSync(seedPath)) {
        console.log('[CivicFix DB] Seeding MySQL database from seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));
        for (const statement of seedStatements) {
          try {
            await pool.query(statement);
          } catch (err) {
            // Ignore minor constraint noise on bulk insert
          }
        }
      }
    }

    useFallback = false;
    console.log(`[CivicFix DB] Connected successfully to MySQL database "${config.db.database}".`);
    return { type: 'mysql', pool };
  } catch (error) {
    useFallback = true;
    console.warn(`[CivicFix DB] MySQL not available (${error.message}).`);
    console.log('[CivicFix DB] Activating resilient built-in JSON/Relational storage engine for seamless out-of-the-box hackathon demo!');
    loadLocalStore();
    return { type: 'local', store: localStore };
  }
}

export function isUsingFallback() {
  return useFallback;
}

export function getPool() {
  return pool;
}

export function getStore() {
  if (!localStore) {
    loadLocalStore();
  }
  return localStore;
}
