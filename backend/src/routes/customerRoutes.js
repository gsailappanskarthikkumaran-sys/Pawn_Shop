import express from 'express';
import { createCustomer, getCustomers, getCustomerById, updateCustomer } from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'aadharCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 }
    ]), createCustomer)
    .get(protect, getCustomers);

router.route('/:id')
    .get(protect, getCustomerById)
    .put(protect, upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'aadharCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 }
    ]), updateCustomer);

export default router;
