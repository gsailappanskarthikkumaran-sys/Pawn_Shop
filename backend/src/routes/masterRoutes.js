import express from 'express';
import { addGoldRate, getLatestGoldRate, addScheme, getSchemes, deleteScheme, deleteGoldRate } from '../controllers/masterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/gold-rate').post(protect, admin, addGoldRate);
router.route('/gold-rate/latest').get(protect, getLatestGoldRate);
router.route('/gold-rate/:id').delete(protect, admin, deleteGoldRate);

router.route('/schemes').post(protect, admin, addScheme).get(protect, getSchemes);
router.route('/schemes/:id').delete(protect, admin, deleteScheme);

export default router;
