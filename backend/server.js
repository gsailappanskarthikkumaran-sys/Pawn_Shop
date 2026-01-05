import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Starting Server...'); 
const app = express();
import initScheduler from './src/services/goldRateScheduler.js';
initScheduler();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/src/uploads', express.static(path.join(__dirname, 'src/uploads')));
import authRoutes from './src/routes/authRoutes.js';
import masterRoutes from './src/routes/masterRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import { loanRoutes, paymentRouter } from './src/routes/loanRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

import notificationRoutes from './src/routes/notificationRoutes.js';
import auctionRoutes from './src/routes/auctionRoutes.js';
import branchRoutes from './src/routes/branchRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/branches', branchRoutes);

app.get('/', (req, res) => {
    res.send('Pawn Broking API is running');
});

import startOverdueJob from './src/jobs/overdueJob.js';

const startServer = async () => {
    try {
        await connectDB();
        startOverdueJob();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to database', error);
        process.exit(1);
    }
};

startServer();
