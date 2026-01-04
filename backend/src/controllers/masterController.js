import GoldRate from '../models/GoldRate.js';
import Scheme from '../models/Scheme.js';

// @desc    Add Gold Rate
// @route   POST /api/masters/gold-rate
// @access  Admin
const addGoldRate = async (req, res) => {
    const { ratePerGram22k, ratePerGram24k, date } = req.body;

    try {
        const rate = await GoldRate.create({
            rateDate: date || new Date(),
            ratePerGram22k,
            ratePerGram24k,
            updatedBy: req.user._id,
        });
        res.status(201).json(rate);
    } catch (error) {
        res.status(400).json({ message: 'Error adding gold rate', error: error.message });
    }
};

// @desc    Get Latest Gold Rate
// @route   GET /api/masters/gold-rate/latest
// @access  Private
const getLatestGoldRate = async (req, res) => {
    try {
        const rate = await GoldRate.findOne().sort({ rateDate: -1 });
        if (rate) {
            res.json(rate);
        } else {
            // Return 200 with empty data instead of 404 to avoid console errors
            res.json(null);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add Scheme
// @route   POST /api/masters/schemes
// @access  Admin
const addScheme = async (req, res) => {
    try {
        const scheme = await Scheme.create(req.body);
        res.status(201).json(scheme);
    } catch (error) {
        res.status(400).json({ message: 'Error adding scheme', error: error.message });
    }
};

// @desc    Get All Schemes
// @route   GET /api/masters/schemes
// @access  Private
const getSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find({ isActive: true });
        res.json(schemes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Scheme (Soft Delete)
// @route   DELETE /api/masters/schemes/:id
// @access  Admin
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

export { addGoldRate, getLatestGoldRate, addScheme, getSchemes, deleteScheme };
