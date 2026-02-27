import Loan from '../models/Loan.js';
import Voucher from '../models/Voucher.js';


const getEligibleLoans = async (req, res) => {
    try {
        const loans = await Loan.find({
            $or: [
                { status: 'overdue' },
                { status: 'active', dueDate: { $lt: new Date() } }
            ]
        })
            .populate('customer', 'name phone')
            .populate('scheme', 'schemeName text');

        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching eligible loans', error: error.message });
    }
};


const recordAuctionSale = async (req, res) => {
    const { id } = req.params;
    const { auctionAmount, bidderName, bidderContact, remarks } = req.body;

    try {
        const loan = await Loan.findById(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });

        const isOverdue = loan.status === 'overdue' || (loan.status === 'active' && new Date() > new Date(loan.dueDate));

        if (!isOverdue) {
            return res.status(400).json({ message: 'Loan must be active and past due, or marked overdue to auction' });
        }


        loan.status = 'auctioned';
        loan.currentBalance = 0;
        loan.auctionDetails = {
            auctionDate: new Date(),
            auctionAmount,
            bidderName,
            bidderContact,
            remarks
        };

        await loan.save();


        await Voucher.create({
            type: 'income',
            category: 'Auction Proceeds',
            description: `Auction of Loan ${loan.loanId} (Bidder: ${bidderName})`,
            amount: parseFloat(auctionAmount),
            createdBy: req.user._id,
            date: new Date()
        });



        res.json({ message: 'Auction recorded successfully', loan });

    } catch (error) {
        res.status(500).json({ message: 'Error recording auction', error: error.message });
    }
};

export { getEligibleLoans, recordAuctionSale };
