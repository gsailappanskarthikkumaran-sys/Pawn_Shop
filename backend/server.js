import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';

// Load Config
dotenv.config();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Message
console.log('Starting Server...'); // Trigger restart

// App Init
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static folder for uploads
app.use('/src/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Routes
import authRoutes from './src/routes/authRoutes.js';
import masterRoutes from './src/routes/masterRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import { loanRoutes, paymentRouter } from './src/routes/loanRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import voucherRoutes from './src/routes/voucherRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import auctionRoutes from './src/routes/auctionRoutes.js';

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

app.get('/', (req, res) => {
    res.send('Pawn Broking API is running');
});

import startOverdueJob from './src/jobs/overdueJob.js';

// Database Connection & Server Start
const startServer = async () => {
    try {
        await connectDB();

        // Start Cron Jobs
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
