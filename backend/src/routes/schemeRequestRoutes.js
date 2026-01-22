import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { createRequest, getRequests, updateRequestStatus, checkActiveRequest } from '../controllers/schemeRequestController.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/status', protect, admin, updateRequestStatus);
router.get('/check', protect, checkActiveRequest);

export default router;
