import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import Voucher from '../models/Voucher.js';


const getDayBook = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();

        const start = new Date(targetDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(targetDate);
        end.setHours(23, 59, 59, 999);

        let query = {};
        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        }

        const loans = await Loan.find({
            ...query,
            createdAt: { $gte: start, $lte: end }
        }).select('loanId loanAmount customer createdAt').populate('customer', 'name');


        let paymentQuery = { paidAt: { $gte: start, $lte: end } };

        if (query.branch) {
            const branchLoanIds = await Loan.find({ branch: query.branch }).distinct('_id');
            paymentQuery.loan = { $in: branchLoanIds };
        }

        const payments = await Payment.find(paymentQuery).select('amount type loanId paidAt');

        const vouchers = await Voucher.find({
            ...query,
            date: { $gte: start, $lte: end }
        });


        let transactions = [];


        loans.forEach(l => {
            transactions.push({
                type: 'DEBIT',
                category: 'Loan Issue',
                description: `Loan to ${l.customer?.name} (${l.loanId})`,
                amount: l.loanAmount,
                time: l.createdAt
            });
        });


        payments.forEach(p => {
            transactions.push({
                type: 'CREDIT',
                category: 'Loan Payment',
                description: `Payment for Loan`,
                amount: p.amount,
                time: p.paidAt
            });
        });


        vouchers.forEach(v => {
            if (['expense', 'Payment', 'Purchase'].includes(v.type)) {
                transactions.push({
                    type: 'DEBIT',
                    category: v.category,
                    description: v.description || `${v.type} Voucher`,
                    amount: v.amount,
                    time: v.date
                });
            } else if (['income', 'Receipt', 'Sales'].includes(v.type)) {
                transactions.push({
                    type: 'CREDIT',
                    category: v.category,
                    description: v.description || `${v.type} Voucher`,
                    amount: v.amount,
                    time: v.date
                });
            }
        });


        transactions.sort((a, b) => new Date(b.time) - new Date(a.time));


        const totalCredit = transactions.filter(t => t.type === 'CREDIT').reduce((acc, t) => acc + t.amount, 0);
        const totalDebit = transactions.filter(t => t.type === 'DEBIT').reduce((acc, t) => acc + t.amount, 0);

        res.json({
            date: targetDate,
            transactions,
            summary: {
                totalIn: totalCredit,
                totalOut: totalDebit,
                netChange: totalCredit - totalDebit
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching Day Book', error: error.message });
    }
};

const getFinancialStats = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        }

        const activeLoans = await Loan.find({ ...query, status: { $ne: 'closed' } });
        const outstandingPrincipal = activeLoans.reduce((acc, l) => acc + l.loanAmount, 0);
        let paymentMatch = {};
        if (query.branch) {
            const branchLoanIds = await Loan.find({ branch: query.branch }).distinct('_id');
            paymentMatch.loan = { $in: branchLoanIds };
        }

        const allPayments = await Payment.aggregate([
            { $match: paymentMatch },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const allLoans = await Loan.aggregate([
            { $match: query },
            { $group: { _id: null, total: { $sum: "$loanAmount" } } }
        ]);
        const allExpenseVouchers = await Voucher.aggregate([
            { $match: { ...query, type: { $in: ['expense', 'Payment', 'Purchase'] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const allIncomeVouchers = await Voucher.aggregate([
            { $match: { ...query, type: { $in: ['income', 'Receipt', 'Sales'] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalIn = (allPayments[0]?.total || 0) + (allIncomeVouchers[0]?.total || 0);
        const totalOut = (allLoans[0]?.total || 0) + (allExpenseVouchers[0]?.total || 0);
        const cashInHand = totalIn - totalOut;


        const totalExpenses = allExpenseVouchers[0]?.total || 0;
        const totalOtherIncome = allIncomeVouchers[0]?.total || 0;

        const interestIncome = await Payment.aggregate([
            { $match: { ...paymentMatch, type: 'interest' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const profitLossLocal = {
            income: {
                interest: interestIncome[0]?.total || 0,
                otherIncome: totalOtherIncome
            },
            expenses: {
                operating: totalExpenses,
                badDebts: 0
            },
            netProfit: (interestIncome[0]?.total || 0) + totalOtherIncome - totalExpenses
        };

        res.json({
            balanceSheet: {
                assets: {
                    cashInHand,
                    outstandingLoans: outstandingPrincipal,
                    goldStockValuation: 0
                },
                liabilities: {
                    capital: 0
                }
            },
            profitAndLoss: profitLossLocal
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching Financials', error: error.message });
    }
};

const getBusinessReport = async (req, res) => {
    try {

        const activeLoans = await Loan.aggregate([
            { $match: { status: { $ne: 'closed' } } },
            { $group: { _id: null, totalPrincipal: { $sum: "$loanAmount" }, totalBalance: { $sum: "$currentBalance" } } }
        ]);


        const interestPayments = await Payment.aggregate([
            { $match: { type: 'interest' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);


        const allPayments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const allLoans = await Loan.aggregate([{ $group: { _id: null, total: { $sum: "$loanAmount" } } }]);
        const allExpense = await Voucher.aggregate([{ $match: { type: { $in: ['expense', 'Payment', 'Purchase'] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
        const allIncome = await Voucher.aggregate([{ $match: { type: { $in: ['income', 'Receipt', 'Sales'] } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);

        const totalIn = (allPayments[0]?.total || 0) + (allIncome[0]?.total || 0);
        const totalOut = (allLoans[0]?.total || 0) + (allExpense[0]?.total || 0);

        res.json({
            loanPortfolio: {
                principalOutstanding: activeLoans[0]?.totalBalance || 0,
                totalDisbursed: allLoans[0]?.total || 0
            },
            revenue: {
                interestCollected: interestPayments[0]?.total || 0,
                otherIncome: allIncome[0]?.total || 0
            },
            cashPosition: {
                cashInHand: totalIn - totalOut,
                totalIn,
                totalOut
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Business Report', error: error.message });
    }
};


const getDemandReport = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + parseInt(days));


        const loans = await Loan.find({
            status: { $in: ['active', 'overdue'] }
        }).populate('customer', 'name phone city').populate('scheme', 'schemeName tenureMonths');

        const demandList = loans.filter(l => {
            if (l.status === 'overdue') return true;

            const startDate = new Date(l.createdAt);
            const tenureMonths = l.scheme?.tenureMonths || 12;
            const maturityDate = new Date(startDate.setMonth(startDate.getMonth() + tenureMonths));

            return maturityDate <= futureDate;
        }).map(l => {
            const startDate = new Date(l.createdAt);
            const tenureMonths = l.scheme?.tenureMonths || 12;
            const maturityDate = new Date(startDate.setMonth(startDate.getMonth() + tenureMonths));

            return {
                _id: l._id,
                loanId: l.loanId,
                customer: l.customer,
                amount: l.loanAmount,
                balance: l.currentBalance,
                maturityDate,
                status: l.status
            };
        });

        res.json(demandList);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching Demand Report', error: error.message });
    }
};

export { getDayBook, getFinancialStats, getBusinessReport, getDemandReport };
