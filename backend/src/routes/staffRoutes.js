import express from 'express';
import { getAllStaff, addStaff, deleteStaff, updateStaff } from '../controllers/staffController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, admin, getAllStaff)
    .post(protect, admin, addStaff);

router.route('/:id')
    .put(protect, admin, updateStaff)
    .delete(protect, admin, deleteStaff);

export default router;
