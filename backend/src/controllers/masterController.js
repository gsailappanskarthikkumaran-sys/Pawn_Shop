import GoldRate from '../models/GoldRate.js';
import Scheme from '../models/Scheme.js';

const addGoldRate = async (req, res) => {
    const { ratePerGram22k, ratePerGram20k, ratePerGram18k, date } = req.body;

    try {
        const rate = await GoldRate.create({
            rateDate: date || new Date(),
            ratePerGram22k,
            ratePerGram20k,
            ratePerGram18k,
            updatedBy: req.user._id,
        });
        res.status(201).json(rate);
    } catch (error) {
        res.status(400).json({ message: 'Error adding gold rate', error: error.message });
    }
};


const getLatestGoldRate = async (req, res) => {
    try {
        const rate = await GoldRate.findOne().sort({ rateDate: -1 });

        if (rate && (rate.ratePerGram22k > 0 || rate.ratePerGram20k > 0 || rate.ratePerGram18k > 0)) {
            res.json(rate);
        } else {
            res.json(null);
        }
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
        const schemes = await Scheme.find({ isActive: true });
        res.json(schemes);
    } catch (error) {
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

export { addGoldRate, getLatestGoldRate, addScheme, getSchemes, deleteScheme, deleteGoldRate };
