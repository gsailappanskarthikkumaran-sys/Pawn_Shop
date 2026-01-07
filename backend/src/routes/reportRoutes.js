import express from 'express';
import { getDayBook, getFinancialStats, getBusinessReport, getDemandReport } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/day-book', protect, getDayBook);
router.get('/financials', protect, getFinancialStats);
router.get('/business', protect, getBusinessReport);
router.get('/demand', protect, getDemandReport);

export default router;
