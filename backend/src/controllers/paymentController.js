import Payment from '../models/Payment.js';
import Loan from '../models/Loan.js';

// @desc    Add Payment
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res) => {
    const { loanId, amount, type, remarks, paymentMode } = req.body;

    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        if (loan.status === 'closed') return res.status(400).json({ message: 'Loan is already closed' });

        // Create Payment
        const payment = await Payment.create({
            loan: loanId,
            amount,
            type,
            paymentMode: paymentMode || 'cash', // Default to cash if not sent
            remarks,
            collectedBy: req.user._id
        });

        // Update Loan Balance
        // Logic: If 'interest', it pays off accrued interest (not tracked in balance explicitly in this simple model, 
        // usually interest is calculated on fly or added).
        // If 'principal' or 'full_settlement', it reduces requests.
        // Simplified Logic: 
        // If full_settlement, mark closed, balance 0.
        // If principal, reduce balance.
        // Interest payment is just logged, doesn't reduce principal balance usually.

        if (type === 'full_settlement') {
            loan.status = 'closed';
            loan.currentBalance = 0;
        } else if (type === 'principal') {
            loan.currentBalance -= amount;
            if (loan.currentBalance <= 0) {
                loan.status = 'closed';
                loan.currentBalance = 0;
            }
        }
        // For interest, we assume it handles offline calc or separate field, but for now we just log it.

        await loan.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: 'Error adding payment', error: error.message });
    }
};

// @desc    Get Payments for a Loan
// @route   GET /api/payments/loan/:loanId
// @access  Private
const getPaymentsByLoan = async (req, res) => {
    try {
        const payments = await Payment.find({ loan: req.params.loanId }).sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Single Payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('loan');
        if (payment) res.json(payment);
        else res.status(404).json({ message: 'Payment not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { addPayment, getPaymentsByLoan, getPaymentById };
