import express from 'express';
import { analyzePreview, checkDuplicatesPreview } from '../controllers/aiController.js';

const router = express.Router();

router.post('/analyze', analyzePreview);
router.post('/check-duplicates', checkDuplicatesPreview);

export default router;
