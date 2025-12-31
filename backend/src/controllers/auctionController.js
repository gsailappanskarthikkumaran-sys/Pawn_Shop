import Loan from '../models/Loan.js';
import Voucher from '../models/Voucher.js';

// @desc    Get Loans Eligible for Auction (Overdue > X days)
// @route   GET /api/auctions/eligible
const getEligibleLoans = async (req, res) => {
    try {
        // Fetch all overdue loans
        // Ideally filter by how long they have been overdue, but for now just all 'overdue'
        const loans = await Loan.find({ status: 'overdue' })
            .populate('customer', 'name phone')
            .populate('scheme', 'schemeName text');

        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching eligible loans', error: error.message });
    }
};

// @desc    Record Auction Sale
// @route   POST /api/auctions/:id/sell
const recordAuctionSale = async (req, res) => {
    const { id } = req.params;
    const { auctionAmount, bidderName, bidderContact, remarks } = req.body;

    try {
        const loan = await Loan.findById(id);
        if (!loan) return res.status(404).json({ message: 'Loan not found' });
        if (loan.status !== 'overdue') return res.status(400).json({ message: 'Loan must be overdue to auction' });

        // Update Loan Status
        loan.status = 'auctioned';
        loan.currentBalance = 0; // Settled via auction
        loan.auctionDetails = {
            auctionDate: new Date(),
            auctionAmount,
            bidderName,
            bidderContact,
            remarks
        };

        await loan.save();

        // 2. Create an Income Voucher for the Auction Proceeds
        await Voucher.create({
            type: 'income',
            category: 'Auction Proceeds',
            description: `Auction of Loan ${loan.loanId} (Bidder: ${bidderName})`,
            amount: parseFloat(auctionAmount),
            createdBy: req.user._id,
            date: new Date()
        });

        // 3. Optional: Create an Expense Voucher if Auction Amount < Principal (Loss)
        // Or if Auction Amount > Liability (Surplus payable to customer)
        // This is complex business logic. 
        // Simple Logic: just record the cash IN from auction.

        res.json({ message: 'Auction recorded successfully', loan });

    } catch (error) {
        res.status(500).json({ message: 'Error recording auction', error: error.message });
    }
};

export { getEligibleLoans, recordAuctionSale };
