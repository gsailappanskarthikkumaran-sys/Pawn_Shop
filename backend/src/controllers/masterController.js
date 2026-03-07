import GoldRate from '../models/GoldRate.js';
import Deduction from '../models/Deduction.js';
import Scheme from '../models/Scheme.js';
import Loan from '../models/Loan.js';

const addGoldRate = async (req, res) => {
    const { ratePerGram22k, ratePerGram20k, ratePerGram18k, date } = req.body;

    try {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const updateData = {
            ratePerGram22k: ratePerGram22k || 0,
            ratePerGram20k: ratePerGram20k || 0,
            ratePerGram18k: ratePerGram18k || 0,
            updatedBy: req.user._id,
        };

        const rate = await GoldRate.findOneAndUpdate(
            { rateDate: targetDate },
            { $set: updateData },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(201).json(rate);
    } catch (error) {
        res.status(400).json({ message: 'Error adding gold rate', error: error.message });
    }
};


const getLatestGoldRate = async (req, res) => {
    try {
        const rate = await GoldRate.findOne().sort({ rateDate: -1 });
        const deduction = await Deduction.findOne();

        // Merge latest rate with deductions for compatibility
        const result = rate ? rate.toObject() : {};
        if (deduction) {
            result.deduction22k = deduction.deduction22k;
            result.deductionOrdinary = deduction.deductionOrdinary;
        } else {
            result.deduction22k = 0;
            result.deductionOrdinary = 0;
        }

        if (rate && (rate.ratePerGram22k > 0 || rate.ratePerGram20k > 0 || rate.ratePerGram18k > 0)) {
            res.json(result);
        } else {
            res.json(result.deduction22k || result.deductionOrdinary ? result : null);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateDeductions = async (req, res) => {
    const { deduction22k, deductionOrdinary } = req.body;
    try {
        const deduction = await Deduction.findOneAndUpdate(
            {},
            {
                deduction22k: deduction22k || 0,
                deductionOrdinary: deductionOrdinary || 0,
                updatedBy: req.user._id
            },
            { upsert: true, new: true }
        );
        res.json(deduction);
    } catch (error) {
        res.status(400).json({ message: 'Error updating deductions' });
    }
};

const getDeductions = async (req, res) => {
    try {
        const deduction = await Deduction.findOne();
        res.json(deduction || { deduction22k: 0, deductionOrdinary: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addScheme = async (req, res) => {
    try {
        const scheme = await Scheme.create(req.body);
        res.status(201).json(scheme);
    } catch (error) {
        res.status(400).json({ message: 'Error adding scheme', error: error.message });
    }
};

const getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({ isActive: true }).lean();

        const schemesWithCounts = await Promise.all(schemes.map(async (scheme) => {
            const activeLoanCount = await Loan.countDocuments({
                scheme: scheme._id,
                status: { $in: ['active', 'overdue'] }
            });
            return { ...scheme, activeLoanCount };
        }));

        res.json(schemesWithCounts);
    } catch (error) {
        console.error("Error fetching schemes:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);

        if (scheme) {
            scheme.isActive = false;
            await scheme.save();
            res.json({ message: 'Scheme removed' });
        } else {
            res.status(404).json({ message: 'Scheme not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteGoldRate = async (req, res) => {
    try {
        const { id } = req.params;
        await GoldRate.findByIdAndDelete(id);
        res.json({ message: 'Gold rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { addGoldRate, getLatestGoldRate, addScheme, getSchemes, deleteScheme, deleteGoldRate, updateDeductions, getDeductions };
