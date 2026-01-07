import Payment from '../models/Payment.js';
import Loan from '../models/Loan.js';


const addPayment = async (req, res) => {
    const { loanId, amount, type, remarks, paymentMode, paymentDate } = req.body;

    try {
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        if (loan.status === 'closed') return res.status(400).json({ message: 'Loan is already closed' });

        const payment = await Payment.create({
            loan: loanId,
            amount,
            type,
            paymentMode: paymentMode || 'cash',
            remarks,
            collectedBy: req.user._id,
            paymentDate: paymentDate || Date.now()
        });

        if (type === 'full_settlement') {
            loan.status = 'closed';
            loan.currentBalance = 0;
        } else if (type === 'principal') {
            loan.currentBalance -= amount;
            if (loan.currentBalance <= 0) {
                loan.status = 'closed';
                loan.currentBalance = 0;
            }
        } else if (type === 'interest') {

            const nextDate = new Date(loan.nextPaymentDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            loan.nextPaymentDate = nextDate;
        }

        await loan.save();

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: 'Error adding payment', error: error.message });
    }
};


const getPaymentsByLoan = async (req, res) => {
    try {
        const payments = await Payment.find({ loan: req.params.loanId }).sort({ paymentDate: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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
