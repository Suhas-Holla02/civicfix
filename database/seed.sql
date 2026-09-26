-- CivicFix Demo Seed Data
-- Users: admin@civicfix.gov (admin123), citizen@example.com (citizen123)

USE civicfix;

-- Clean existing data
DELETE FROM status_history;
DELETE FROM complaint_duplicates;
DELETE FROM complaint_keywords;
DELETE FROM complaints;
DELETE FROM users;

-- 1. Users
INSERT INTO users (id, name, email, password_hash, role, department, created_at) VALUES
(1, 'Admin Officer', 'admin@civicfix.gov', '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', 'ADMIN', 'Municipal Administration', NOW() - INTERVAL 30 DAY),
(2, 'Priya Nair (Electrical Officer)', 'officer.electrical@civicfix.gov', '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', 'OFFICER', 'Electrical Department', NOW() - INTERVAL 30 DAY),
(3, 'David Chen (Roads Supervisor)', 'officer.roads@civicfix.gov', '$2a$10$Miw0RWPh0DhYg8E3GKXmQOW.zLTx7r7GI8Gxv4sBX3KMeBpJ4st.2', 'OFFICER', 'Roads & Infrastructure', NOW() - INTERVAL 30 DAY),
(4, 'John Doe (Citizen)', 'citizen@example.com', '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', 'CITIZEN', NULL, NOW() - INTERVAL 25 DAY),
(5, 'Sarah Jenkins', 'sarah.citizen@example.com', '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', 'CITIZEN', NULL, NOW() - INTERVAL 20 DAY),
(6, 'Rahul Sharma', 'rahul.sharma@example.com', '$2a$10$IDy0QHMg5WtaJ6V2ZVyeruAx1hrPrXcfRe2wnIcoXHHLGfZoSVSYm', 'CITIZEN', NULL, NOW() - INTERVAL 15 DAY);

-- 2. Complaints (16 realistic records)
INSERT INTO complaints (id, complaint_code, user_id, description, summary, category, subcategory, priority, department, status, latitude, longitude, address, created_at, updated_at, resolved_at) VALUES
(1, 'CIV-2026-0001', 4, 'Streetlight near City College campus gate has been completely broken for 2 weeks, causing dark spots and safety concerns for night students.', 'Broken streetlight near City College gate.', 'Infrastructure', 'Streetlight', 'MEDIUM', 'Electrical Department', 'IN PROGRESS', 12.971598, 77.594562, '42 College Road, Near North Gate, Central Ward', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 2 DAY, NULL),
(2, 'CIV-2026-0002', 5, 'Dangerous deep pothole on MG Road near Metro Pillar 142. Two two-wheelers skidded yesterday during rain.', 'Severe crater pothole near Metro Pillar 142.', 'Roads & Infrastructure', 'Pothole', 'HIGH', 'Roads & Infrastructure', 'ASSIGNED', 12.975420, 77.608310, 'MG Road, Opposite Metro Station, East Ward', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 3 DAY, NULL),
(3, 'CIV-2026-0003', 6, 'Huge municipal garbage container overflowing for 4 days. Waste spilled onto footpath attracting stray animals and foul smell.', 'Garbage overflow in Market Square.', 'Sanitation', 'Garbage Overflow', 'MEDIUM', 'Sanitation Department', 'RESOLVED', 12.969850, 77.589410, '12 Market Square, Near Gandhi Circle, West Ward', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
(4, 'CIV-2026-0004', 4, 'High pressure municipal water pipe burst flooding the entire residential lane and wasting drinking water continuously.', 'Burst water supply pipe flooding residential lane.', 'Water Supply', 'Water Leakage', 'HIGH', 'Water Supply Department', 'RESOLVED', 12.978200, 77.592100, 'Lane 4, Green Park Colony, North Ward', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(5, 'CIV-2026-0005', 5, 'Open sewage manhole cover broken near Primary School. Extremely dangerous for small children walking to school.', 'Uncovered dangerous manhole near primary school.', 'Public Works', 'Drainage & Sewage', 'HIGH', 'Public Works Department', 'IN PROGRESS', 12.973410, 77.601200, 'School Road, Near St. Anne School, Central Ward', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, NULL),
(6, 'CIV-2026-0006', 6, 'Traffic signal at Brigade Junction stuck on red in all directions, causing massive 2km traffic jam during morning peak hours.', 'Traffic signal failure at major Brigade Junction.', 'Traffic Management', 'Traffic Signal', 'HIGH', 'Traffic Department', 'RESOLVED', 12.972300, 77.607100, 'Brigade Road Junction, Central Ward', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
(7, 'CIV-2026-0007', 4, 'Streetlight pole tilted and sparking occasionally near residential society entrance during wind.', 'Sparking and tilted streetlight pole.', 'Infrastructure', 'Streetlight', 'HIGH', 'Electrical Department', 'ASSIGNED', 12.976800, 77.598500, 'Sunrise Apartments, 8th Main, South Ward', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, NULL),
(8, 'CIV-2026-0008', 5, 'Three continuous potholes forming a trench along 100 Feet Road right after the bus terminal.', 'Multiple road potholes near bus terminal.', 'Roads & Infrastructure', 'Pothole', 'MEDIUM', 'Roads & Infrastructure', 'IN PROGRESS', 12.981200, 77.611000, '100 Feet Road, Near Bus Terminal, East Ward', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 1 DAY, NULL),
(9, 'CIV-2026-0009', 6, 'Commercial market dumping untreated organic waste into open stormwater drain, clogging flow.', 'Drainage blocked due to commercial dumping.', 'Public Works', 'Drainage & Sewage', 'MEDIUM', 'Public Works Department', 'AI ANALYZED', 12.968100, 77.592800, 'Old Market Lane, West Ward', NOW() - INTERVAL 24 HOUR, NOW() - INTERVAL 12 HOUR, NULL),
(10, 'CIV-2026-0010', 4, 'Water supply pipeline leaking underground causing asphalt swelling and damp road surface.', 'Underground water pipeline leak.', 'Water Supply', 'Water Leakage', 'LOW', 'Water Supply Department', 'REPORTED', 12.974900, 77.587300, '5th Cross, Malleshwaram, North Ward', NOW() - INTERVAL 18 HOUR, NOW() - INTERVAL 18 HOUR, NULL),
(11, 'CIV-2026-0011', 5, 'Pedestrian zebra crossing paint completely faded and signal countdown timer display broken.', 'Faded pedestrian zebra crossing and broken timer.', 'Traffic Management', 'Traffic Signal', 'LOW', 'Traffic Department', 'RESOLVED', 12.970500, 77.604200, 'Koramangala 4th Block Signal, South Ward', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(12, 'CIV-2026-0012', 6, 'Public park perimeter light fixtures vandalized, non-functional for past one week.', 'Park pathway light fixtures non-functional.', 'Infrastructure', 'Streetlight', 'LOW', 'Electrical Department', 'IN PROGRESS', 12.977100, 77.603400, 'Cubbon Park South Gate, Central Ward', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 2 DAY, NULL),
(13, 'CIV-2026-0013', 4, 'Waste pickup truck missed collection for 3 consecutive days in Sector 3 residential area.', 'Residential waste collection missed.', 'Sanitation', 'Garbage Overflow', 'MEDIUM', 'Sanitation Department', 'RESOLVED', 12.982500, 77.596000, 'Sector 3 Layout, North Ward', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY),
(14, 'CIV-2026-0014', 5, 'Exposed high tension electrical cable laying across pedestrian sidewalk after storm.', 'Exposed high-voltage electrical cable on sidewalk.', 'Infrastructure', 'Electrical Hazard', 'HIGH', 'Electrical Department', 'RESOLVED', 12.971900, 77.599100, 'Church Street Walkway, Central Ward', NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
(15, 'CIV-2026-0015', 6, 'Storm drain overflow flooding ground floor residences after moderate evening rain.', 'Stormwater drain overflowing into houses.', 'Public Works', 'Drainage & Sewage', 'HIGH', 'Public Works Department', 'ASSIGNED', 12.969200, 77.595400, 'Lakeview Layout, South Ward', NOW() - INTERVAL 36 HOUR, NOW() - INTERVAL 10 HOUR, NULL),
(16, 'CIV-2026-0016', 4, 'Lamp post opposite College Gate 2 blinking continuously then completely turning off.', 'Streetlight flickering and turning off near College.', 'Infrastructure', 'Streetlight', 'MEDIUM', 'Electrical Department', 'ASSIGNED', 12.971700, 77.594700, '46 College Road, Gate 2, Central Ward', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 1 DAY, NULL);

-- 3. Keywords
INSERT INTO complaint_keywords (complaint_id, keyword) VALUES
(1, 'streetlight'), (1, 'college'), (1, 'broken'), (1, 'night'), (1, 'visibility'),
(2, 'pothole'), (2, 'mg road'), (2, 'crater'), (2, 'skidding'), (2, 'accident hazard'),
(3, 'garbage'), (3, 'overflow'), (3, 'smell'), (3, 'market'), (3, 'waste'),
(4, 'water leak'), (4, 'pipeline burst'), (4, 'flooding'), (4, 'drinking water'),
(5, 'manhole'), (5, 'open sewage'), (5, 'school'), (5, 'child hazard'),
(6, 'traffic signal'), (6, 'red light'), (6, 'traffic jam'), (6, 'junction'),
(7, 'streetlight'), (7, 'sparking'), (7, 'tilted pole'), (7, 'electrical'),
(8, 'pothole'), (8, 'road damage'), (8, 'bus terminal'), (8, '100 feet road'),
(9, 'drainage'), (9, 'waste dumping'), (9, 'market'), (9, 'clogged'),
(10, 'water leak'), (10, 'underground pipe'), (10, 'malleshwaram'),
(11, 'traffic signal'), (11, 'pedestrian crossing'), (11, 'faded paint'),
(12, 'park light'), (12, 'streetlight'), (12, 'cubbon park'),
(13, 'garbage pickup'), (13, 'waste collection'), (13, 'residential layout'),
(14, 'exposed wire'), (14, 'electrical hazard'), (14, 'sidewalk'), (14, 'high tension'),
(15, 'drainage overflow'), (15, 'flooding'), (15, 'storm drain'),
(16, 'streetlight'), (16, 'college'), (16, 'flickering'), (16, 'broken');

-- 4. Duplicates (CIV-2026-0001 and CIV-2026-0016 are duplicate college streetlight issues)
INSERT INTO complaint_duplicates (complaint_id, duplicate_complaint_id, similarity_score, created_at) VALUES
(16, 1, 0.88, NOW() - INTERVAL 3 DAY);

-- 5. Status History
INSERT INTO status_history (complaint_id, old_status, new_status, changed_by, notes, changed_at) VALUES
(1, 'REPORTED', 'AI ANALYZED', NULL, 'Classified as Infrastructure (Streetlight) with MEDIUM priority by CivicFix AI.', NOW() - INTERVAL 14 DAY),
(1, 'AI ANALYZED', 'ASSIGNED', 1, 'Assigned to Electrical Department team.', NOW() - INTERVAL 12 DAY),
(1, 'ASSIGNED', 'IN PROGRESS', 2, 'Work order #EL-894 generated. Technician scheduled for ballast & LED replacement.', NOW() - INTERVAL 2 DAY),
(2, 'REPORTED', 'AI ANALYZED', NULL, 'Classified as Roads & Infrastructure with HIGH priority due to accident risk.', NOW() - INTERVAL 5 DAY),
(2, 'AI ANALYZED', 'ASSIGNED', 1, 'Forwarded to East Ward road repair quick response squad.', NOW() - INTERVAL 3 DAY),
(3, 'REPORTED', 'AI ANALYZED', NULL, 'Classified as Sanitation with MEDIUM priority.', NOW() - INTERVAL 10 DAY),
(3, 'AI ANALYZED', 'ASSIGNED', 1, 'Assigned to Sanitation Department Area Inspector.', NOW() - INTERVAL 8 DAY),
(3, 'ASSIGNED', 'IN PROGRESS', 1, 'Compactor truck dispatched for clearing dump site.', NOW() - INTERVAL 3 DAY),
(3, 'IN PROGRESS', 'RESOLVED', 1, 'Area cleared, secondary bin installed and sanitized with bleaching powder.', NOW() - INTERVAL 1 DAY),
(4, 'REPORTED', 'AI ANALYZED', NULL, 'Classified as Water Supply with HIGH priority.', NOW() - INTERVAL 8 DAY),
(4, 'AI ANALYZED', 'ASSIGNED', 1, 'Emergency valve control dispatched.', NOW() - INTERVAL 7 DAY),
(4, 'ASSIGNED', 'IN PROGRESS', 1, 'Excavation and pipe replacement in progress.', NOW() - INTERVAL 5 DAY),
(4, 'IN PROGRESS', 'RESOLVED', 1, 'Burst joint replaced with 150mm ductile iron pipe. Pressure restored.', NOW() - INTERVAL 3 DAY);
