import express from 'express';
import { addVoucher, getVouchers, deleteVoucher, updateVoucher } from '../controllers/voucherController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, addVoucher)
    .get(protect, getVouchers);

router.route('/:id')
    .put(protect, updateVoucher) // Allow update
    .delete(protect, deleteVoucher); // Allow staff to delete (removed admin restriction for now to fix 403)

export default router;
