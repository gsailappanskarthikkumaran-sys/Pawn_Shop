import express from 'express';
import { addVoucher, getVouchers, deleteVoucher } from '../controllers/voucherController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addVoucher)
    .get(protect, getVouchers);

router.route('/:id')
    .delete(protect, admin, deleteVoucher); // Only admin can delete for safety

export default router;
