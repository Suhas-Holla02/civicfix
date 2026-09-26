import express from 'express';
import { getSummary, getCategories, getDepartments, getTrends } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/categories', getCategories);
router.get('/departments', getDepartments);
router.get('/trends', getTrends);

export default router;
