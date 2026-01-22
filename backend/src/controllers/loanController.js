import mongoose from 'mongoose';
import fs from 'fs';

import Loan from '../models/Loan.js';
import Item from '../models/Item.js';
import Scheme from '../models/Scheme.js';
import GoldRate from '../models/GoldRate.js';
import Payment from '../models/Payment.js';
import SchemeRequest from '../models/SchemeRequest.js';
import { notifyAdminsAndStaff } from '../services/notificationService.js';


const cleanupFiles = (files) => {
    if (!files) return;
    if (Array.isArray(files)) {
        files.forEach(file => {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error("Failed to delete file:", file.path, err);
            }
        });
    }
};

const createLoan = async (req, res) => {
    const { customerId, schemeId, items, requestedLoanAmount, preInterestAmount, isCustomScheme, customSchemeValues } = req.body;

    try {
        let itemsData;
        console.log("createLoan req.body:", req.body);
        console.log("createLoan req.files:", req.files);
        try {
            itemsData = typeof items === 'string' ? JSON.parse(items) : items;
            console.log("Parsed itemsData:", itemsData);
        } catch (e) {
            console.error("Failed to parse items:", e);
            itemsData = [];
        }


        const scheme = await Scheme.findById(schemeId);
        if (!scheme) {
            cleanupFiles(req.files);
            return res.status(404).json({ message: 'Scheme not found' });
        }

        let appliedInterestRate = scheme.interestRate;
        let appliedTenure = scheme.tenureMonths;
        let appliedMaxLoanPercent = scheme.maxLoanPercentage;

        if (isCustomScheme && isCustomScheme !== 'false') {
            const approvedRequest = await SchemeRequest.findOne({
                customerId,
                originalSchemeId: schemeId,
                status: 'approved'
            }).sort({ createdAt: -1 });

            if (!approvedRequest) {
                cleanupFiles(req.files);
                return res.status(400).json({ message: 'No approved custom scheme request found for this customer.' });
            }

            // Optional: verify the values match exactly what was approved, to prevent tampering
            // strictly enforced: use the values solely from the approved request, ensuring trust
            if (approvedRequest.proposedValues) {
                appliedInterestRate = approvedRequest.proposedValues.interestRate;
                appliedTenure = approvedRequest.proposedValues.tenureMonths;
                if (approvedRequest.proposedValues.maxLoanPercentage) {
                    appliedMaxLoanPercent = approvedRequest.proposedValues.maxLoanPercentage;
                }
            }
        }

        let goldRateObj = await GoldRate.findOne().sort({ rateDate: -1 });
        if (!goldRateObj) {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            goldRateObj = await GoldRate.findOne({
                rateDate: { $gte: startOfDay, $lte: endOfDay }
            });

            if (!goldRateObj || !(goldRateObj.ratePerGram22k > 0 || goldRateObj.ratePerGram20k > 0 || goldRateObj.ratePerGram18k > 0)) {
                console.log("Error: Gold Rate not set for today");
                cleanupFiles(req.files);
                return res.status(400).json({ message: "Today's gold rate not set by admin" });
            }
        }


        let totalWeight = 0;
        let totalValuation = 0;

        for (const item of itemsData) {
            totalWeight += parseFloat(item.netWeight);
            let rate = 0;
            if (item.purity === '22k') rate = goldRateObj.ratePerGram22k;
            else if (item.purity === '20k') rate = goldRateObj.ratePerGram20k;
            else if (item.purity === '18k') rate = goldRateObj.ratePerGram18k;

            if (!rate || rate <= 0) {
                cleanupFiles(req.files);
                return res.status(400).json({ message: `Gold rate for ${item.purity} is not set by admin` });
            }

            totalValuation += parseFloat(item.netWeight) * rate;
        }

        const maxLoan = totalValuation * (appliedMaxLoanPercent / 100);
        console.log("Valuation debug:", { totalValuation, maxLoan, requestedLoanAmount });

        if (requestedLoanAmount > maxLoan) {
            console.log("Error: Loan amount exceeds limit");
            cleanupFiles(req.files);
            return res.status(400).json({ message: `Loan amount exceeds limit of ${maxLoan}` });
        }


        // Use the current timestamp for due date calculations
        const loanNow = new Date();

        const dueDate = new Date(loanNow);
        dueDate.setMonth(dueDate.getMonth() + appliedTenure);

        const nextPaymentDate = new Date(loanNow);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);


        const loan = new Loan({
            loanId: `LN-${Date.now()}`,
            customer: customerId,
            scheme: schemeId,
            totalWeight,
            totalPurity: 'Mixed',
            goldRateAtPledge: goldRateObj.ratePerGram22k || goldRateObj.ratePerGram20k || goldRateObj.ratePerGram18k || 0,
            valuation: totalValuation,
            loanAmount: requestedLoanAmount,
            preInterestAmount: preInterestAmount || 0,
            interestRate: appliedInterestRate,
            monthlyInterest: ((requestedLoanAmount * appliedInterestRate) / 100) / appliedTenure,
            dueDate: dueDate,
            nextPaymentDate: nextPaymentDate,
            createdBy: req.user._id,
            branch: req.user.branch,
            currentBalance: requestedLoanAmount
        });

        const createdLoan = await loan.save();



        const photoPaths = req.files ? req.files.map(f => f.path.replace(/\\/g, "/")) : [];

        const itemDocs = itemsData.map((item, index) => ({
            loan: createdLoan._id,
            name: item.name,
            description: item.description,
            netWeight: item.netWeight,
            purity: item.purity,
            photos: index === 0 ? photoPaths : []
        }));

        const createdItems = await Item.insertMany(itemDocs);


        createdLoan.items = createdItems.map(i => i._id);
        await createdLoan.save();

        // Send Notifications
        await notifyAdminsAndStaff({
            title: 'New Loan Created',
            message: `A new loan ${createdLoan.loanId} of ₹${createdLoan.loanAmount} has been issued.`,
            type: 'success',
            branch: createdLoan.branch,
            referenceId: createdLoan.loanId,
            referenceType: 'Loan'
        });

        res.status(201).json(createdLoan);

    } catch (error) {
        cleanupFiles(req.files);
        res.status(400).json({ message: 'Error creating loan', error: error.message });
    }
};


const getLoans = async (req, res) => {
    try {
        let query = {};


        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        } else if (req.query.branch) {
            query.branch = req.query.branch;
        }

        const loans = await Loan.find(query)
            .populate('customer', 'name phone')
            .populate('scheme', 'schemeName interestRate')
            .sort({ createdAt: -1 });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;
        let query;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: id };
        } else {
            query = { loanId: id };
        }

        let loan = await Loan.findOne(query)
            .populate('customer')
            .populate('scheme')
            .populate('items')
            .lean(); // Use lean to allow modifying the object

        if (loan) {
            // Dynamic Penalty Calculation
            const today = new Date();
            const dueDate = new Date(loan.dueDate);

            let penalty = {
                details: 'No penalty',
                amount: 0,
                daysOverdue: 0
            };

            // Only calculate if loan is NOT closed and is OVERDUE
            if (loan.status !== 'closed' && today > dueDate) {
                const diffTime = Math.abs(today - dueDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                penalty.daysOverdue = diffDays;

                let penalInterestAmount = 0;
                let flatFine = 0;

                // 1. Penal Interest (on default principal balance)
                // If scheme has penalInterestRate (e.g. 6% p.a extra)
                if (loan.scheme && loan.scheme.penalInterestRate > 0) {
                    // Calculate extra interest for the overdue period
                    // Formula: (Balance * PenalRate * (OverdueDays/365)) / 100
                    const annualPenalRate = loan.scheme.penalInterestRate;
                    penalInterestAmount = (loan.currentBalance * annualPenalRate * (diffDays / 365)) / 100;
                }

                // 2. Flat Overdue Fine
                if (loan.scheme && loan.scheme.overdueFine > 0) {
                    flatFine = loan.scheme.overdueFine;
                }

                penalty.amount = Math.ceil(penalInterestAmount + flatFine);
                penalty.details = `Overdue by ${diffDays} days. Fine: ₹${flatFine}, Penal Interest: ₹${penalInterestAmount.toFixed(2)}`;
            }

            loan.penalty = penalty;
            loan.payableAmount = loan.currentBalance + penalty.amount; // Note: This is simplified. Ideally should include accrued normal interest too.

            res.json(loan);
        }
        else res.status(404).json({ message: 'Loan not found' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        let query = {};
        let branchId = null;

        if (req.user.role === 'staff' && req.user.branch) {
            branchId = req.user.branch;
        } else if (req.query.branch) {
            branchId = req.query.branch;
        }

        if (branchId) {
            try {
                const oid = new mongoose.Types.ObjectId(branchId);
                query.$or = [{ branch: oid }, { branch: branchId.toString() }];
            } catch (e) {
                query.branch = branchId;
            }
        }

        const totalLoans = await Loan.countDocuments(query);
        const activeLoans = await Loan.countDocuments({ ...query, status: { $ne: 'closed' } });
        const overdueLoans = await Loan.countDocuments({ ...query, status: 'overdue' });


        const totals = await Loan.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalDisbursed: { $sum: "$loanAmount" },
                    totalOutstanding: { $sum: "$currentBalance" }
                }
            }
        ]);


        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const paymentMatch = {
            paymentDate: { $gte: todayStart, $lte: todayEnd },
            type: 'interest'
        };


        let loanBranchMatch = {};
        if (query.$or) {
            loanBranchMatch.$or = query.$or.map(cond => ({
                'loanDetails.branch': cond.branch
            }));
        } else if (query.branch) {
            loanBranchMatch['loanDetails.branch'] = query.branch;
        }

        const interestAgg = await Payment.aggregate([
            {
                $lookup: {
                    from: 'loans',
                    localField: 'loan',
                    foreignField: '_id',
                    as: 'loanDetails'
                }
            },
            { $unwind: '$loanDetails' },
            {
                $match: {
                    ...paymentMatch,
                    ...loanBranchMatch
                }
            },
            {
                $group: {
                    _id: null,
                    totalInterest: { $sum: "$amount" }
                }
            }
        ]);

        const schemeStats = await Loan.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'schemes',
                    localField: 'scheme',
                    foreignField: '_id',
                    as: 'schemeDetails'
                }
            },
            { $unwind: "$schemeDetails" },
            {
                $group: {
                    _id: "$schemeDetails.schemeName",
                    value: { $sum: 1 },
                    amount: { $sum: "$loanAmount" }
                }
            }
        ]);

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrend = await Loan.aggregate([
            { $match: { ...query, createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    loans: { $sum: 1 },
                    amount: { $sum: "$loanAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const recentLoans = await Loan.find(query)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name');

        res.json({
            counts: {
                total: totalLoans,
                active: activeLoans,
                closed: await Loan.countDocuments({ ...query, status: 'closed' }),
                overdue: overdueLoans
            },
            financials: {
                disbursed: totals[0]?.totalDisbursed || 0,
                outstanding: totals[0]?.totalOutstanding || 0,
                interestToday: interestAgg[0]?.totalInterest || 0
            },
            schemeStats: schemeStats.map(s => ({ name: s._id, value: s.value, amount: s.amount })),
            monthlyTrend: monthlyTrend.map(m => ({
                month: new Date(0, m._id - 1).toLocaleString('default', { month: 'short' }),
                amount: m.amount,
                count: m.loans
            })),
            recentLoans
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const getStaffDashboardStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        let query = {};
        if (req.user.role === 'staff' && req.user.branch) {
            query.branch = req.user.branch;
        }

        const loansIssuedToday = await Loan.find({
            ...query,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        });
        const loansIssuedCount = loansIssuedToday.length;
        const loansIssuedAmount = loansIssuedToday.reduce((acc, loan) => acc + loan.loanAmount, 0);


        const paymentsToday = await Payment.aggregate([
            {
                $lookup: {
                    from: 'loans',
                    localField: 'loan',
                    foreignField: '_id',
                    as: 'loanDetails'
                }
            },
            { $unwind: '$loanDetails' },
            {
                $match: {
                    paymentDate: { $gte: todayStart, $lte: todayEnd },
                    ...(query.branch ? { 'loanDetails.branch': query.branch } : {})
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    interestAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "interest"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        const totalReceivedToday = paymentsToday[0]?.totalAmount || 0;
        const interestCollectedToday = paymentsToday[0]?.interestAmount || 0;


        const totalActive = await Loan.countDocuments({ ...query, status: { $ne: 'closed' } });

        const outstandingAgg = await Loan.aggregate([
            { $match: { ...query, status: { $ne: 'closed' } } },
            { $group: { _id: null, total: { $sum: "$currentBalance" } } }
        ]);
        const totalOutstanding = outstandingAgg[0]?.total || 0;


        const dueThreshold = new Date();
        dueThreshold.setDate(dueThreshold.getDate() + 7);

        const pendingRedemptions = await Loan.countDocuments({
            ...query,
            status: { $ne: 'closed' },
            dueDate: { $lte: dueThreshold }
        });

        res.json({
            today: {
                loansCount: loansIssuedCount,
                loansAmount: loansIssuedAmount,
                paymentsReceived: totalReceivedToday,
                interestCollected: interestCollectedToday,
                pendingRedemptions: pendingRedemptions
            },
            stats: {
                activeLoans: totalActive,
                outstandingAmount: totalOutstanding
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export { createLoan, getLoans, getLoanById, getDashboardStats, getStaffDashboardStats };