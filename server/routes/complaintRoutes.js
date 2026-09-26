import express from 'express';
import {
  createComplaint,
  listComplaints,
  getComplaint,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  getMapComplaints
} from '../controllers/complaintController.js';
import { authenticateToken, requireAdminOrOfficer, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Map route must be placed before /:id parameter route
router.get('/map', getMapComplaints);

// Complaints CRUD
router.get('/', listComplaints);
router.get('/:id', getComplaint);
router.post('/', authenticateToken, createComplaint);
router.put('/:id/status', authenticateToken, requireAdminOrOfficer, updateComplaintStatus);
router.put('/:id', authenticateToken, requireAdminOrOfficer, updateComplaint);
router.delete('/:id', authenticateToken, requireAdmin, deleteComplaint);

export default router;
