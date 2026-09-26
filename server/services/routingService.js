// CivicFix - Configurable Department Routing Service

export const DEPARTMENT_MAP = {
  // Category / Subcategory to Department mapping
  'Streetlight': 'Electrical Department',
  'Electrical Hazard': 'Electrical Department',
  'Power Outage': 'Electrical Department',
  'Pothole': 'Roads & Infrastructure',
  'Road Damage': 'Roads & Infrastructure',
  'Footpath': 'Roads & Infrastructure',
  'Bridge Damage': 'Roads & Infrastructure',
  'Garbage Overflow': 'Sanitation Department',
  'Waste Dumping': 'Sanitation Department',
  'Public Cleanliness': 'Sanitation Department',
  'Water Leakage': 'Water Supply Department',
  'Pipeline Burst': 'Water Supply Department',
  'Water Contamination': 'Water Supply Department',
  'Drainage & Sewage': 'Public Works Department',
  'Open Manhole': 'Public Works Department',
  'Stormwater Flooding': 'Public Works Department',
  'Traffic Signal': 'Traffic Department',
  'Pedestrian Crossing': 'Traffic Department',
  'Road Signage': 'Traffic Department'
};

export const CATEGORY_DEPARTMENT_MAP = {
  'Infrastructure': 'Electrical Department',
  'Roads & Infrastructure': 'Roads & Infrastructure',
  'Sanitation': 'Sanitation Department',
  'Water Supply': 'Water Supply Department',
  'Public Works': 'Public Works Department',
  'Traffic Management': 'Traffic Department',
  'Public Facilities': 'Public Works Department'
};

export function routeToDepartment(category, subcategory) {
  if (subcategory && DEPARTMENT_MAP[subcategory]) {
    return DEPARTMENT_MAP[subcategory];
  }
  if (category && CATEGORY_DEPARTMENT_MAP[category]) {
    return CATEGORY_DEPARTMENT_MAP[category];
  }
  return 'Municipal Administration';
}

export const ALL_DEPARTMENTS = [
  'Electrical Department',
  'Roads & Infrastructure',
  'Sanitation Department',
  'Water Supply Department',
  'Public Works Department',
  'Traffic Department',
  'Municipal Administration'
];
