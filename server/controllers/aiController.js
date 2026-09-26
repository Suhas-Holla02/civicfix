import { analyzeComplaint } from '../services/aiService.js';
import { detectDuplicates } from '../services/duplicateDetector.js';
import { dbAdapter } from '../models/dbAdapter.js';

export async function analyzePreview(req, res, next) {
  try {
    const { description, address } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required for AI analysis' });
    }

    const analysis = await analyzeComplaint(description, address);
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

export async function checkDuplicatesPreview(req, res, next) {
  try {
    const { description, category, subcategory, latitude, longitude, keywords } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const existingComplaints = await dbAdapter.listComplaints({ limit: 500 });
    for (const item of existingComplaints) {
      item.keywords = await dbAdapter.getKeywordsByComplaintId(item.id);
    }

    const duplicates = detectDuplicates(
      {
        description,
        category,
        subcategory,
        latitude: parseFloat(latitude) || 12.9716,
        longitude: parseFloat(longitude) || 77.5946,
        keywords: keywords || []
      },
      existingComplaints
    );

    res.json({ duplicates });
  } catch (err) {
    next(err);
  }
}
