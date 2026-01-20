import cron from 'node-cron';
import axios from 'axios';
import GoldRate from '../models/GoldRate.js';


const BASE_RATE_22K = 12600;
const VARIANCE = 50;

const GOLD_API_URL = 'http://metals-api.com/api/latest';

const fetchMarketRate = async () => {
    try {
        if (!process.env.GOLD_API_KEY) {
            console.warn("GOLD_API_KEY not found in environment variables. Using random variance.");
            return null;
        }

        const response = await axios.get(GOLD_API_URL, {
            params: {
                access_key: process.env.GOLD_API_KEY,
                base: 'XAU',
                symbols: 'INR'
            }
        });

        if (response.data && response.data.rates && response.data.rates.INR) {
            // Price is per Troy Ounce (approx 31.1035 grams)
            const pricePerOunce = response.data.rates.INR;
            const pricePerGram24k = pricePerOunce / 31.1035;
            return Math.round(pricePerGram24k);
        }
    } catch (error) {
        console.error("Error fetching gold rate from API:", error.message);
        if (error.response) {
            console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
        }
    }
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
            // Standard calculation: 22k is roughly 91.6% of 24k
            // However, market practice often varies. Using 0.916 as standard multiplier.
            rate22k = Math.round(marketRate * 0.916);
        } else {
            console.log("Using fallback random variance logic.");
            const fluctuation = (Math.random() * VARIANCE * 2) - VARIANCE;
            // Fallback base calculation if API fails
            rate22k = Math.round(BASE_RATE_22K + fluctuation); // This might be too low compared to real rates, but keeping existing logic as fallback
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
