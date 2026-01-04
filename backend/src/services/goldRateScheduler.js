import cron from 'node-cron';
import axios from 'axios';
import GoldRate from '../models/GoldRate.js';

// Configuration
const BASE_RATE_22K = 12600; // Base rate for Current Location (approx)
const VARIANCE = 50; // Max daily fluctuation in INR

const fetchMarketRate = async () => {
    // Placeholder for Real API call
    // const response = await axios.get('API_URL');
    // return response.data.price;
    return null; // Force simulation for now
};

const updateDailyGoldRate = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('Checking daily market rates...');

        let rate22k = 0;
        let rate24k = 0;

        const marketRate = await fetchMarketRate();

        if (marketRate) {
            rate24k = marketRate;
            rate22k = marketRate * 0.916;
        } else {
            // SIMULATION: Use Chennai Base Rate with slight variance
            const fluctuation = (Math.random() * VARIANCE * 2) - VARIANCE;
            rate22k = Math.round(BASE_RATE_22K + fluctuation);
            rate24k = Math.round(rate22k * (24 / 22));
        }

        // Upsert: Update if exists for today, else create
        // Define day start and end
        const startOfDay = new Date(today);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        await GoldRate.findOneAndUpdate(
            { rateDate: { $gte: startOfDay, $lte: endOfDay } },
            {
                rateDate: new Date(),
                ratePerGram22k: rate22k,
                ratePerGram24k: rate24k,
                updatedBy: null
            },
            { upsert: true, new: true }
        );

        console.log(`Daily Gold Rate Updated: 22k=₹${rate22k}, 24k=₹${rate24k}`);

    } catch (error) {
        console.error('Error updating daily gold rate:', error);
    }
};

const initScheduler = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
        updateDailyGoldRate();
    });

    // Also try to run immediately on server start (if missed)
    updateDailyGoldRate();
};

export default initScheduler;
