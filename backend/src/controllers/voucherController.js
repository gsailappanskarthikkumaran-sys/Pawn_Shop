import Voucher from '../models/Voucher.js';

// @desc    Add a new voucher (Expense/Income)
// @route   POST /api/vouchers
// @access  Private (Admin/Staff)
const addVoucher = async (req, res) => {
    const { type, category, amount, description, date } = req.body;

    try {
        const voucher = await Voucher.create({
            type,
            category,
            amount,
            description,
            date: date || new Date(),
            createdBy: req.user._id
        });

        res.status(201).json(voucher);
    } catch (error) {
        res.status(400).json({ message: 'Error adding voucher', error: error.message });
    }
};

// @desc    Get all vouchers (with optional date filtering)
// @route   GET /api/vouchers
// @access  Private
const getVouchers = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};

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

// @desc    Delete voucher
// @route   DELETE /api/vouchers/:id
// @access  Private (Admin only or Creator?) - Let's allow Admin only for now or strict ownership
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

export { addVoucher, getVouchers, deleteVoucher };
