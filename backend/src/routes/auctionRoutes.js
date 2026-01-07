import express from 'express';
import { getEligibleLoans, recordAuctionSale } from '../controllers/auctionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/eligible', protect, getEligibleLoans);
router.post('/:id/sell', protect, admin, recordAuctionSale);

export default router;
