import express from 'express';
import { createLoan, getLoans, getLoanById, getDashboardStats, getStaffDashboardStats, incrementPrintCount } from '../controllers/loanController.js';
import { addPayment, getPaymentsByLoan, getPaymentById } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
const paymentRouter = express.Router();


router.route('/stats/dashboard').get(protect, getDashboardStats);
router.route('/stats/staff-dashboard').get(protect, getStaffDashboardStats);

router.route('/')
    .post(protect, upload.array('photos', 5), createLoan)
    .get(protect, getLoans);

router.route('/:id').get(protect, getLoanById);
router.route('/:id/print-count').put(protect, incrementPrintCount);

paymentRouter.route('/').post(protect, addPayment);
paymentRouter.route('/loan/:loanId').get(protect, getPaymentsByLoan);
paymentRouter.route('/:id').get(protect, getPaymentById);

export { router as loanRoutes, paymentRouter };
