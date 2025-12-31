import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser); // Open for initial setup, then can be protected

export default router;
