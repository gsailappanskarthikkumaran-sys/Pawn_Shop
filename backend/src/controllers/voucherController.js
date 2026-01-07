import Voucher from '../models/Voucher.js';

const addVoucher = async (req, res) => {
    const { type, category, amount, description, date } = req.body;

    try {
        const voucher = await Voucher.create({
            type,
            category,
            amount,
            description,
            date: date || new Date(),
            createdBy: req.user._id,
            branch: req.user.branch
        });

        res.status(201).json(voucher);
    } catch (error) {
        res.status(400).json({ message: 'Error adding voucher', error: error.message });
    }
};


const getVouchers = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};


        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        }

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const vouchers = await Voucher.find(query)
            .populate('createdBy', 'fullName')
            .sort({ date: -1 }); // Newest first

        res.json(vouchers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);

        if (voucher) {
            await Voucher.deleteOne({ _id: voucher._id });
            res.json({ message: 'Voucher removed' });
        } else {
            res.status(404).json({ message: 'Voucher not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateVoucher = async (req, res) => {
    try {
        const { type, category, amount, description, date } = req.body;
        const voucher = await Voucher.findById(req.params.id);

        if (voucher) {

            voucher.type = type || voucher.type;
            voucher.category = category || voucher.category;
            voucher.amount = amount || voucher.amount;
            voucher.description = description || voucher.description;
            voucher.date = date || voucher.date;

            const updatedVoucher = await voucher.save();
            res.json(updatedVoucher);
        } else {
            res.status(404).json({ message: 'Voucher not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating voucher', error: error.message });
    }
};

export { addVoucher, getVouchers, deleteVoucher, updateVoucher };
