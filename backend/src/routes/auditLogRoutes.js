import express from 'express';
import { getAuditLogsByEntity, getAllAuditLogs } from '../controllers/auditLogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get logs for a specific entity
router.get('/:entityType/:entityId', protect, getAuditLogsByEntity);

// Get all logs globally
router.get('/', protect, getAllAuditLogs);

export default router;
