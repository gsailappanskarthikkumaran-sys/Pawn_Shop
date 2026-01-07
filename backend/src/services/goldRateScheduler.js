import cron from 'node-cron';
import axios from 'axios';
import GoldRate from '../models/GoldRate.js';


const BASE_RATE_22K = 12600;
const VARIANCE = 50;

const fetchMarketRate = async () => {

    return null;
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
            const fluctuation = (Math.random() * VARIANCE * 2) - VARIANCE;
            rate22k = Math.round(BASE_RATE_22K + fluctuation);
            rate24k = Math.round(rate22k * (24 / 22));
        }

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

    cron.schedule('0 9 * * *', () => {
        updateDailyGoldRate();
    });


    updateDailyGoldRate();
};

export default initScheduler;
