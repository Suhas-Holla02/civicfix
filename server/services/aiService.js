import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config.js';
import { routeToDepartment } from './routingService.js';

// High-priority emergency trigger keywords
const HIGH_PRIORITY_TRIGGERS = [
  'danger', 'dangerous', 'hazard', 'emergency', 'accident', 'sparking', 'electric shock',
  'exposed wire', 'exposed electrical', 'live wire', 'burst pipe', 'major water leak',
  'heavy flooding', 'flood', 'crater', 'cave in', 'collapsed', 'open manhole',
  'traffic signal failure', 'signal stuck', 'skidded', 'injury', 'hospital', 'school hazard'
];

// Low-priority triggers
const LOW_PRIORITY_TRIGGERS = [
  'minor', 'faded', 'cosmetic', 'aesthetic', 'paint', 'small scratch', 'graffiti',
  'suggestion', 'request for tree pruning', 'faded paint', 'timer countdown'
];

// Category classification rules
const CATEGORY_DEFINITIONS = [
  {
    category: 'Infrastructure',
    subcategory: 'Streetlight',
    keywords: ['streetlight', 'street light', 'lamp', 'light post', 'pole', 'darkness', 'dark road', 'night visibility', 'bulb', 'flickering', 'dim light', 'dark spot', 'illumination'],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Infrastructure',
    subcategory: 'Electrical Hazard',
    keywords: ['exposed wire', 'electric shock', 'sparking', 'transformer', 'high tension', 'hanging cable', 'electric pole', 'power failure'],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Roads & Infrastructure',
    subcategory: 'Pothole',
    keywords: ['pothole', 'road damage', 'crater', 'asphalt', 'caved in', 'broken road', 'tar', 'deep hole', 'rough road', 'skid', 'speed breaker'],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Roads & Infrastructure',
    subcategory: 'Footpath Damage',
    keywords: ['footpath', 'sidewalk', 'paver blocks', 'pedestrian walk', 'kerb', 'pavement broken'],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Sanitation',
    subcategory: 'Garbage Overflow',
    keywords: ['garbage', 'trash', 'waste', 'dumpster', 'bin', 'overflowing', 'smell', 'stench', 'litter', 'debris', 'filth', 'stray animals', 'collection missed', 'rotten'],
    defaultPriority: 'MEDIUM'
  },
  {
    category: 'Water Supply',
    subcategory: 'Water Leakage',
    keywords: ['water leak', 'pipe burst', 'pipeline', 'drinking water', 'tap broken', 'valve leak', 'gushing water', 'water supply', 'contamination', 'water wastage'],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Public Works',
    subcategory: 'Drainage & Sewage',
    keywords: ['drainage', 'sewage', 'manhole', 'gutter', 'clogged drain', 'foul water', 'sewer', 'storm drain', 'rain water blockage', 'overflowing drain', 'black water'],
    defaultPriority: 'HIGH'
  },
  {
    category: 'Traffic Management',
    subcategory: 'Traffic Signal',
    keywords: ['traffic signal', 'traffic light', 'junction signal', 'red light', 'green light', 'blinking signal', 'traffic jam', 'zebra crossing', 'pedestrian signal', 'signal timer'],
    defaultPriority: 'HIGH'
  }
];

/**
 * Local Fallback AI Classifier using Rule-based NLP
 */
export function fallbackLocalAI(text = '', locationHint = '') {
  const normalized = text.toLowerCase();
  
  // 1. Determine Category & Subcategory based on keyword density
  let bestMatch = null;
  let maxScore = 0;

  for (const def of CATEGORY_DEFINITIONS) {
    let score = 0;
    for (const kw of def.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 8 ? 3 : 2; // Weight multi-word/specific phrases higher
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = def;
    }
  }

  // Default fallback if no specific keyword matched
  if (!bestMatch) {
    if (normalized.includes('light') || normalized.includes('dark')) {
      bestMatch = CATEGORY_DEFINITIONS[0]; // Streetlight
    } else if (normalized.includes('road') || normalized.includes('hole')) {
      bestMatch = CATEGORY_DEFINITIONS[2]; // Pothole
    } else if (normalized.includes('waste') || normalized.includes('clean')) {
      bestMatch = CATEGORY_DEFINITIONS[4]; // Garbage
    } else {
      bestMatch = {
        category: 'Public Facilities',
        subcategory: 'General Infrastructure',
        keywords: ['infrastructure', 'maintenance'],
        defaultPriority: 'MEDIUM'
      };
    }
  }

  // 2. Determine Priority
  let priority = bestMatch.defaultPriority;
  const isHigh = HIGH_PRIORITY_TRIGGERS.some(trigger => normalized.includes(trigger));
  const isLow = LOW_PRIORITY_TRIGGERS.some(trigger => normalized.includes(trigger));

  if (isHigh) {
    priority = 'HIGH';
  } else if (isLow && !isHigh) {
    priority = 'LOW';
  }

  // 3. Extract Keywords
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near', 'by', 'my', 'for', 'to',
    'has', 'been', 'are', 'was', 'were', 'our', 'this', 'that', 'from', 'with', 'having', 'very',
    'have', 'had', 'we', 'they', 'it', 'its', 'be', 'of', 'so', 'can', 'will', 'do', 'not', 'but'
  ]);

  const rawWords = normalized
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const keywordCounts = {};
  rawWords.forEach(w => { keywordCounts[w] = (keywordCounts[w] || 0) + 1; });

  // Prioritize domain keywords and frequent words
  const extractedKeywords = Array.from(new Set([
    bestMatch.subcategory.toLowerCase(),
    ...rawWords.filter(w => bestMatch.keywords.some(k => k.includes(w))),
    ...Object.keys(keywordCounts).slice(0, 6)
  ])).slice(0, 7);

  // 4. Extract Location Information Hint if present
  let locationInfo = locationHint;
  const locMatch = text.match(/(?:near|opposite|behind|at|along|next to|in front of)\s+([a-zA-Z0-9\s,]{3,40})(?:\.|\band\b|,|$)/i);
  if (locMatch && locMatch[1]) {
    locationInfo = locMatch[1].trim();
  }

  // 5. Generate concise summary
  let summary = '';
  if (text.length <= 80) {
    summary = text;
  } else {
    // Generate intelligent summary
    const cleanSub = bestMatch.subcategory;
    const locSnippet = locationInfo ? ` near ${locationInfo}` : '';
    summary = `${cleanSub} issue reported${locSnippet}.`;
    if (summary.length > 80) {
      summary = text.substring(0, 77) + '...';
    }
  }

  // 6. Assign Department
  const department = routeToDepartment(bestMatch.category, bestMatch.subcategory);

  // 7. Estimated Severity
  const severityScore = priority === 'HIGH' ? 5 : (priority === 'MEDIUM' ? 3 : 1);

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

/**
 * Gemini API Classifier
 */
async function callGemini(text, locationHint = '') {
  const apiKey = config.geminiApiKey;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are the AI Civic Analysis Engine for CivicFix (aligned with UN SDG 11: Sustainable Cities).
Analyze this citizen civic complaint description:
"""${text}"""

Location context: "${locationHint || 'Not specified'}"

Return ONLY a valid JSON object with the exact keys:
{
  "category": "Infrastructure | Roads & Infrastructure | Sanitation | Water Supply | Public Works | Traffic Management | Public Facilities",
  "subcategory": "Streetlight | Pothole | Garbage Overflow | Water Leakage | Drainage & Sewage | Traffic Signal | Electrical Hazard | Footpath Damage | General",
  "priority": "HIGH | MEDIUM | LOW",
  "department": "Electrical Department | Roads & Infrastructure | Sanitation Department | Water Supply Department | Public Works Department | Traffic Department",
  "summary": "Concise 1-sentence summary under 80 characters",
  "keywords": ["array", "of", "4-7", "relevant", "keywords"],
  "estimatedSeverity": 1 to 5 number,
  "locationInfo": "Extracted location text from description or null",
  "aiExplanation": "Brief 1-sentence rationale for this classification and priority level"
}
Do not include markdown backticks or any preamble, only the raw JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text().trim();
    
    // Clean potential markdown wrap
    const cleaned = textOutput.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate and normalize
    return {
      category: parsed.category || 'Infrastructure',
      subcategory: parsed.subcategory || 'General',
      priority: ['HIGH', 'MEDIUM', 'LOW'].includes(parsed.priority?.toUpperCase()) ? parsed.priority.toUpperCase() : 'MEDIUM',
      department: parsed.department || routeToDepartment(parsed.category, parsed.subcategory),
      summary: parsed.summary || text.substring(0, 80),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(k => String(k).toLowerCase()) : ['civic', 'issue'],
      estimatedSeverity: parsed.estimatedSeverity || 3,
      locationInfo: parsed.locationInfo || locationHint || null,
      aiProvider: 'gemini',
      aiExplanation: parsed.aiExplanation || 'Analyzed via Google Gemini AI model.'
    };
  } catch (err) {
    console.warn('[CivicFix AI] Gemini API call failed or unavailable, falling back to local engine:', err.message);
    return null;
  }
}

/**
 * Main AI Analysis Service Abstraction
 */
export async function analyzeComplaint(description, locationHint = '') {
  if (!description || !description.trim()) {
    throw new Error('Complaint description cannot be empty');
  }

  // Attempt Gemini API if key is configured
  if (config.geminiApiKey && config.geminiApiKey !== 'your_api_key_here') {
    const geminiResult = await callGemini(description, locationHint);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // Resilient Local Fallback (guarantees zero demo crashes)
  return fallbackLocalAI(description, locationHint);
}
