// CivicFix - Client-Side Local AI Fallback
// Used only when the backend is unavailable.

const HIGH_PRIORITY_TRIGGERS = [
  'danger',
  'dangerous',
  'hazard',
  'emergency',
  'accident',
  'sparking',
  'electric shock',
  'exposed wire',
  'exposed electrical',
  'live wire',
  'burst pipe',
  'major water leak',
  'heavy flooding',
  'flood',
  'crater',
  'cave in',
  'collapsed',
  'open manhole',
  'traffic signal failure',
  'signal stuck',
  'skidded',
  'injury',
  'hospital',
  'school hazard'
];

const LOW_PRIORITY_TRIGGERS = [
  'minor',
  'faded',
  'cosmetic',
  'aesthetic',
  'paint',
  'small scratch',
  'graffiti',
  'suggestion',
  'request for tree pruning',
  'faded paint',
  'timer countdown'
];

const CATEGORY_DEFINITIONS = [
  {
    category: 'Infrastructure',
    subcategory: 'Streetlight',
    keywords: [
      'streetlight',
      'street light',
      'lamp',
      'light post',
      'pole',
      'darkness',
      'dark road',
      'night visibility',
      'bulb',
      'flickering',
      'dim light',
      'dark spot',
      'illumination'
    ],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Infrastructure',
    subcategory: 'Electrical Hazard',
    keywords: [
      'exposed wire',
      'electric shock',
      'sparking',
      'transformer',
      'high tension',
      'hanging cable',
      'electric pole',
      'power failure'
    ],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Roads & Infrastructure',
    subcategory: 'Pothole',
    keywords: [
      'pothole',
      'road damage',
      'crater',
      'asphalt',
      'caved in',
      'broken road',
      'tar',
      'deep hole',
      'rough road',
      'skid',
      'speed breaker'
    ],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Roads & Infrastructure',
    subcategory: 'Footpath Damage',
    keywords: [
      'footpath',
      'sidewalk',
      'paver blocks',
      'pedestrian walk',
      'kerb',
      'pavement broken'
    ],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Sanitation',
    subcategory: 'Garbage Overflow',
    keywords: [
      'garbage',
      'trash',
      'waste',
      'dumpster',
      'bin',
      'overflowing',
      'smell',
      'stench',
      'litter',
      'debris',
      'filth',
      'stray animals',
      'collection missed',
      'rotten'
    ],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Water Supply',
    subcategory: 'Water Leakage',
    keywords: [
      'water leak',
      'pipe burst',
      'pipeline',
      'drinking water',
      'tap broken',
      'valve leak',
      'gushing water',
      'water supply',
      'contamination',
      'water wastage'
    ],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Public Works',
    subcategory: 'Drainage & Sewage',
    keywords: [
      'drainage',
      'sewage',
      'manhole',
      'gutter',
      'clogged drain',
      'foul water',
      'sewer',
      'storm drain',
      'rain water blockage',
      'overflowing drain',
      'black water'
    ],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Traffic Management',
    subcategory: 'Traffic Signal',
    keywords: [
      'traffic signal',
      'traffic light',
      'junction signal',
      'red light',
      'green light',
      'blinking signal',
      'traffic jam',
      'zebra crossing',
      'pedestrian signal',
      'signal timer'
    ],
    defaultPriority: 'HIGH'
  }
];

export function fallbackLocalAI(text = '', locationHint = '') {
  const normalized = text.toLowerCase();

  // 1. Find category
  let bestMatch = null;
  let maxScore = 0;

  for (const def of CATEGORY_DEFINITIONS) {
    let score = 0;

    for (const kw of def.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 8 ? 3 : 2;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = def;
    }
  }

  // Default category
  if (!bestMatch) {
    if (normalized.includes('light') || normalized.includes('dark')) {
      bestMatch = CATEGORY_DEFINITIONS[0];
    } else if (
      normalized.includes('road') ||
      normalized.includes('hole')
    ) {
      bestMatch = CATEGORY_DEFINITIONS[2];
    } else if (
      normalized.includes('waste') ||
      normalized.includes('clean')
    ) {
      bestMatch = CATEGORY_DEFINITIONS[4];
    } else {
      bestMatch = {
        category: 'Public Facilities',
        subcategory: 'General Infrastructure',
        keywords: ['infrastructure', 'maintenance'],
        defaultPriority: 'MEDIUM'
      };
    }
  }

  // 2. Determine priority
  let priority = bestMatch.defaultPriority;

  const isHigh = HIGH_PRIORITY_TRIGGERS.some(trigger =>
    normalized.includes(trigger)
  );

  const isLow = LOW_PRIORITY_TRIGGERS.some(trigger =>
    normalized.includes(trigger)
  );

  if (isHigh) {
    priority = 'HIGH';
  } else if (isLow && !isHigh) {
    priority = 'LOW';
  }

  // 3. Extract keywords
  const stopWords = new Set([
    'the',
    'is',
    'at',
    'which',
    'on',
    'a',
    'an',
    'and',
    'or',
    'in',
    'near',
    'by',
    'my',
    'for',
    'to',
    'has',
    'been',
    'are',
    'was',
    'were',
    'our',
    'this',
    'that',
    'from',
    'with',
    'having',
    'very',
    'have',
    'had',
    'we',
    'they',
    'it',
    'its',
    'be',
    'of',
    'so',
    'can',
    'will',
    'do',
    'not',
    'but'
  ]);

  const rawWords = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  const keywordCounts = {};

  rawWords.forEach(word => {
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });

  const extractedKeywords = Array.from(
    new Set([
      bestMatch.subcategory.toLowerCase(),
      ...rawWords.filter(word =>
        bestMatch.keywords.some(keyword => keyword.includes(word))
      ),
      ...Object.keys(keywordCounts).slice(0, 6)
    ])
  ).slice(0, 7);

  // 4. Extract location
  let locationInfo = locationHint;

  const locMatch = text.match(
    /(?:near|opposite|behind|at|along|next to|in front of)\s+([a-zA-Z0-9\s,]{3,40})(?:\.|\band\b|,|$)/i
  );

  if (locMatch && locMatch[1]) {
    locationInfo = locMatch[1].trim();
  }

  // 5. Generate summary
  let summary = '';

  if (text.length <= 80) {
    summary = text;
  } else {
    const cleanSub = bestMatch.subcategory;
    const locSnippet = locationInfo
      ? ` near ${locationInfo}`
      : '';

    summary = `${cleanSub} issue reported${locSnippet}.`;

    if (summary.length > 80) {
      summary = text.substring(0, 77) + '...';
    }
  }

  // 6. Assign department
  const departmentMap = {
    Streetlight: 'Electrical Department',
    'Electrical Hazard': 'Electrical Department',
    Pothole: 'Roads & Infrastructure',
    'Footpath Damage': 'Roads & Infrastructure',
    'Garbage Overflow': 'Sanitation Department',
    'Water Leakage': 'Water Supply Department',
    'Drainage & Sewage': 'Public Works Department',
    'Traffic Signal': 'Traffic Department',
    'General Infrastructure': 'Public Works Department'
  };

  const department =
    departmentMap[bestMatch.subcategory] ||
    'Public Works Department';

  // 7. Severity
  const severityScore =
    priority === 'HIGH'
      ? 5
      : priority === 'MEDIUM'
      ? 3
      : 1;

  return {
    category: bestMatch.category,
    subcategory: bestMatch.subcategory,
    priority,
    department,
    summary,
    keywords: extractedKeywords,
    estimatedSeverity: severityScore,
    locationInfo: locationInfo || null,
    aiProvider: 'local_fallback',
    aiExplanation: `Determined ${bestMatch.subcategory} in ${bestMatch.category} based on contextual civic cues with ${priority} urgency.`
  };
}