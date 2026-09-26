import { dbAdapter } from '../models/dbAdapter.js';

export async function getSummary(req, res, next) {
  try {
    const summary = await dbAdapter.getAnalyticsSummary();
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await dbAdapter.getAnalyticsCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function getDepartments(req, res, next) {
  try {
    const departments = await dbAdapter.getAnalyticsDepartments();
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

export async function getTrends(req, res, next) {
  try {
    const trends = await dbAdapter.getAnalyticsTrends();
    res.json({ trends });
  } catch (err) {
    next(err);
  }
}
