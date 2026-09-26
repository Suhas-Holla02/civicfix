import { dbAdapter } from '../models/dbAdapter.js';
import { analyzeComplaint } from '../services/aiService.js';
import { detectDuplicates } from '../services/duplicateDetector.js';

export async function createComplaint(req, res, next) {
  try {
    const { description, address, latitude, longitude, image_url, forceSubmit = false } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Complaint description is required' });
    }

    const citizenId = req.user.id;
    const finalAddress = address?.trim() || 'Central City Area';
    const lat = parseFloat(latitude) || 12.9716;
    const lng = parseFloat(longitude) || 77.5946;

    // 1. Run AI analysis (Gemini or Resilient Local Fallback)
    const aiAnalysis = await analyzeComplaint(description, finalAddress);

    // 2. Fetch existing complaints for duplicate detection
    const existingComplaints = await dbAdapter.listComplaints({ limit: 500 });
    
    // Enrich with keywords for duplicate matching
    for (const item of existingComplaints) {
      item.keywords = await dbAdapter.getKeywordsByComplaintId(item.id);
    }

    // 3. Duplicate Detection
    const duplicateResults = detectDuplicates(
      {
        description,
        category: aiAnalysis.category,
        subcategory: aiAnalysis.subcategory,
        latitude: lat,
        longitude: lng,
        keywords: aiAnalysis.keywords
      },
      existingComplaints
    );

    // 4. Create the Complaint
    // Initial status workflow: REPORTED -> AI ANALYZED -> ASSIGNED
    const initialStatus = 'ASSIGNED';
    
    const complaint = await dbAdapter.createComplaint({
      user_id: citizenId,
      description: description.trim(),
      summary: aiAnalysis.summary,
      category: aiAnalysis.category,
      subcategory: aiAnalysis.subcategory,
      priority: aiAnalysis.priority,
      department: aiAnalysis.department,
      status: initialStatus,
      latitude: lat,
      longitude: lng,
      address: finalAddress,
      image_url: image_url || null
    });

    // 5. Store extracted keywords
    if (aiAnalysis.keywords && aiAnalysis.keywords.length > 0) {
      await dbAdapter.addKeywords(complaint.id, aiAnalysis.keywords);
    }

    // 6. Record Duplicate Relationships if found
    if (duplicateResults.hasDuplicates) {
      for (const dup of duplicateResults.matches) {
        await dbAdapter.addDuplicate(complaint.id, dup.id, dup.similarity_score);
      }
    }

    // 7. Record Status History for Workflow
    await dbAdapter.addStatusHistory(
      complaint.id,
      null,
      'REPORTED',
      citizenId,
      'Complaint reported by citizen.'
    );

    await dbAdapter.addStatusHistory(
      complaint.id,
      'REPORTED',
      'AI ANALYZED',
      null,
      `AI Analysis (${aiAnalysis.aiProvider === 'gemini' ? 'Google Gemini' : 'Local Fallback NLP'}): Classified as ${aiAnalysis.category} (${aiAnalysis.subcategory}) with ${aiAnalysis.priority} priority.`
    );

    await dbAdapter.addStatusHistory(
      complaint.id,
      'AI ANALYZED',
      'ASSIGNED',
      null,
      `Automatically routed to ${aiAnalysis.department} by CivicFix Department Dispatcher.`
    );

    // Fetch full complaint with history
    const fullComplaint = await dbAdapter.getComplaintByIdOrCode(complaint.id);

    res.status(201).json({
      message: 'Complaint submitted and AI routed successfully',
      complaint: fullComplaint,
      aiAnalysis,
      duplicates: duplicateResults
    });
  } catch (err) {
    next(err);
  }
}

export async function listComplaints(req, res, next) {
  try {
    const { status, priority, category, department, userId, search, limit } = req.query;

    // Citizens can see all public complaints or their own
    const filters = {
      status,
      priority,
      category,
      department,
      userId,
      search,
      limit: limit ? parseInt(limit, 10) : 100
    };

    const complaints = await dbAdapter.listComplaints(filters);
    res.json({ complaints, total: complaints.length });
  } catch (err) {
    next(err);
  }
}

export async function getComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const complaint = await dbAdapter.getComplaintByIdOrCode(id);

    if (!complaint) {
      return res.status(404).json({ error: `Complaint "${id}" not found.` });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['REPORTED', 'AI ANALYZED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await dbAdapter.updateComplaintStatus(id, status, req.user.id, notes);
    if (!updated) {
      return res.status(404).json({ error: `Complaint "${id}" not found.` });
    }

    res.json({
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await dbAdapter.updateComplaint(id, updates);
    if (!updated) {
      return res.status(404).json({ error: `Complaint "${id}" not found.` });
    }

    res.json({
      message: 'Complaint updated successfully',
      complaint: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const success = await dbAdapter.deleteComplaint(id);

    if (!success) {
      return res.status(404).json({ error: `Complaint "${id}" not found.` });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMapComplaints(req, res, next) {
  try {
    const { category, status } = req.query;
    const filters = {};
    if (category && category !== 'ALL') filters.category = category;
    if (status && status !== 'ALL') filters.status = status;

    const all = await dbAdapter.listComplaints(filters);

    const mapPoints = all.map(c => ({
      id: c.id,
      complaint_code: c.complaint_code,
      summary: c.summary,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      priority: c.priority,
      department: c.department,
      status: c.status,
      latitude: parseFloat(c.latitude),
      longitude: parseFloat(c.longitude),
      address: c.address,
      created_at: c.created_at,
      resolved_at: c.resolved_at
    }));

    res.json({ points: mapPoints, total: mapPoints.length });
  } catch (err) {
    next(err);
  }
}
