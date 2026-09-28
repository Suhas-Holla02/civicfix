// CivicFix - Duplicate Complaint Detection Engine
// Uses Category Matching + Haversine Geo Proximity + Keyword Jaccard + Text Token Overlap

/**
 * Calculates geographic distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;

  const R = 6371000; // Earth radius in meters
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Extracts normalized tokens from text
 */
function tokenizeText(text = '') {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near', 'by', 'my', 'for', 'to',
    'has', 'been', 'are', 'was', 'were', 'our', 'this', 'that', 'from', 'with', 'having', 'very',
    'have', 'had', 'we', 'they', 'it', 'its', 'be', 'of', 'so', 'can', 'will', 'do', 'not', 'but'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(arr1 = [], arr2 = []) {
  if (!arr1.length || !arr2.length) return 0;
  const set1 = new Set(arr1.map(w => w.toLowerCase().trim()));
  const set2 = new Set(arr2.map(w => w.toLowerCase().trim()));

  let intersectionCount = 0;
  for (const item of set1) {
    if (set2.has(item)) intersectionCount++;
  }

  const unionSize = new Set([...set1, ...set2]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Detects duplicate or highly similar complaints from the database
 */
export function detectDuplicates(newComplaint, existingComplaints = []) {
  const {
    category = '',
    subcategory = '',
    latitude,
    longitude,
    keywords = [],
    description = ''
  } = newComplaint;

  const newTokens = tokenizeText(description);
  const matches = [];

  for (const existing of existingComplaints) {
    // Exclude resolved complaints older than 30 days if desired, but keep active ones
    if (existing.id === newComplaint.id) continue;

    // 1. Category Score
    let categoryScore = 0;
    if (existing.subcategory && subcategory && existing.subcategory.toLowerCase() === subcategory.toLowerCase()) {
      categoryScore = 1.0;
    } else if (existing.category && category && existing.category.toLowerCase() === category.toLowerCase()) {
      categoryScore = 0.8;
    }

    // 2. Geographic Distance Score
    const distanceMeters = calculateDistanceMeters(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(existing.latitude),
      parseFloat(existing.longitude)
    );

    let distanceScore = 0;
    if (distanceMeters <= 300) {
      distanceScore = 1.0;
    } else if (distanceMeters <= 800) {
      distanceScore = 0.8;
    } else if (distanceMeters <= 1500) {
      distanceScore = 0.5;
    } else if (distanceMeters <= 3000) {
      distanceScore = 0.2;
    } else {
      distanceScore = 0.0;
    }

    // 3. Keyword Jaccard Score
    const existingKeywords = existing.keywords || [];
    const keywordScore = jaccardSimilarity(keywords, existingKeywords);

    // 4. Description Text Overlap Score
    const existingTokens = tokenizeText(existing.description || existing.summary || '');
    const textOverlap = jaccardSimilarity(newTokens, existingTokens);

    // 5. Composite Weighted Score (0.0 to 1.0)
    let compositeScore = 
      (categoryScore * 0.30) + 
      (distanceScore * 0.35) + 
      (keywordScore * 0.20) + 
      (textOverlap * 0.15);

    // Proximity boost: if same category and within 500m
    if (categoryScore >= 0.8 && distanceMeters <= 500) {
      compositeScore = Math.max(compositeScore, 0.72);
    }

    // Round to 2 decimals
    compositeScore = Math.min(1.0, Math.round(compositeScore * 100) / 100);

    // Threshold: 0.55+ constitutes a duplicate warning candidate
    if (compositeScore >= 0.55) {
      matches.push({
        id: existing.id,
        complaint_code: existing.complaint_code,
        summary: existing.summary || existing.description.substring(0, 75),
        category: existing.category,
        subcategory: existing.subcategory,
        priority: existing.priority,
        status: existing.status,
        department: existing.department,
        distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null,
        similarity_score: compositeScore,
        created_at: existing.created_at
      });
    }
  }

  // Sort by highest similarity
  matches.sort((a, b) => b.similarity_score - a.similarity_score);

  return {
    hasDuplicates: matches.length > 0,
    count: matches.length,
    matches: matches.slice(0, 5), // Return top 5 matches
    warningMessage: matches.length > 0
      ? `Possible duplicate complaint found. ${matches.length} similar complaint${matches.length > 1 ? 's were' : ' was'} reported in this vicinity.`
      : null
  };
}
