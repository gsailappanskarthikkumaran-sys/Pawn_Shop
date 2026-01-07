import Loan from '../models/Loan.js';
import Voucher from '../models/Voucher.js';


const getEligibleLoans = async (req, res) => {
    try {

        const loans = await Loan.find({ status: 'overdue' })
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
        if (loan.status !== 'overdue') return res.status(400).json({ message: 'Loan must be overdue to auction' });


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
