import mongoose from 'mongoose';
import fs from 'fs';

import Loan from '../models/Loan.js';
import Item from '../models/Item.js';
import Scheme from '../models/Scheme.js';
import GoldRate from '../models/GoldRate.js';
import Deduction from '../models/Deduction.js';
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

const normalizeLoanPaths = (loan) => {
    if (!loan) return loan;

    if (loan.customer && typeof loan.customer === 'object') {
        const fields = ['photo', 'aadharCard', 'panCard'];
        fields.forEach(field => {
            if (loan.customer[field] && typeof loan.customer[field] === 'string') {
                const filename = loan.customer[field].split(/[/\\]/).pop();
                if (filename) {
                    loan.customer[field] = `src/uploads/${filename}`;
                }
            }
        });
    }
    if (loan.items && Array.isArray(loan.items)) {
        loan.items.forEach(item => {
            if (item.photos && Array.isArray(item.photos)) {
                item.photos = item.photos.map(photo => {
                    if (typeof photo === 'string') {
                        const filename = photo.split(/[/\\]/).pop();
                        return filename ? `src/uploads/${filename}` : photo;
                    }
                    return photo;
                });
            }
        });
    }
    return loan;
};

const calculateLoanPayables = (loan) => {
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    const nextPaymentDate = new Date(loan.nextPaymentDate);

    let penalty = { details: 'No penalty', amount: 0, daysOverdue: 0 };
    let totalInterestDue = 0;
    let monthsUnpaid = 0;
    let interestDetails = [];

    if (today >= nextPaymentDate) {
        const yearDiff = today.getFullYear() - nextPaymentDate.getFullYear();
        const monthDiff = today.getMonth() - nextPaymentDate.getMonth();
        monthsUnpaid = (yearDiff * 12) + monthDiff;

        if (today.getDate() < nextPaymentDate.getDate()) monthsUnpaid--;

        if (monthsUnpaid < 0 && today >= nextPaymentDate) monthsUnpaid = 0;
        else monthsUnpaid = Math.max(1, monthsUnpaid + 1);

        for (let i = 1; i <= monthsUnpaid; i++) {
            const monthKey = `m${i}`;
            let rate = loan.interestMonths[monthKey];
            if (i > 12 || rate === undefined) {
                rate = loan.interestMonths.afterValidity;
            }
            const monthlyInterest = (loan.currentBalance * rate) / 100;
            totalInterestDue += monthlyInterest;
            interestDetails.push({ month: i, rate: rate, amount: monthlyInterest });
        }
    }

    if (loan.status !== 'closed' && today > dueDate) {
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        penalty.daysOverdue = diffDays;
        penalty.amount = 0;
        penalty.details = `Overdue by ${diffDays} days. Penalty rate applies to future interest.`;
    }

    loan.penalty = penalty;
    loan.calculatedInterest = { monthsUnpaid, totalDue: totalInterestDue, details: interestDetails };
    loan.payableAmount = loan.currentBalance + totalInterestDue + penalty.amount;

    return loan;
};

const createLoan = async (req, res) => {
    const { customerId, schemeId, items, requestedLoanAmount, preInterestAmount, processingCharges, isCustomScheme, customSchemeValues, renewFromLoanId } = req.body;

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

        let appliedInterestMonths = scheme.interestMonths;
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

            if (approvedRequest.proposedValues) {
                appliedInterestMonths = approvedRequest.proposedValues.interestMonths;
                appliedTenure = approvedRequest.proposedValues.tenureMonths;
                if (approvedRequest.proposedValues.maxLoanPercentage) {
                    appliedMaxLoanPercent = approvedRequest.proposedValues.maxLoanPercentage;
                }
            }
        }

        let goldRateObj = await GoldRate.findOne().sort({ rateDate: -1 });
        let deductionObj = await Deduction.findOne();

        if (!goldRateObj || !(goldRateObj.ratePerGram22k > 0 || goldRateObj.ratePerGram20k > 0 || goldRateObj.ratePerGram18k > 0)) {
            console.log("Error: Gold Rate not set");
            cleanupFiles(req.files);
            return res.status(400).json({ message: "Gold rate not set by admin" });
        }

        let totalWeight = 0;
        let totalValuation = 0;

        const deduction22k = deductionObj?.deduction22k || 0;
        const deductionOrdinary = deductionObj?.deductionOrdinary || 0;

        // Group items by purity to calculate cumulative deduction based on total weight per purity
        const purityStats = {
            '22k': { totalWeight: 0, rate: goldRateObj.ratePerGram22k, deduction: deduction22k },
            '20k': { totalWeight: 0, rate: goldRateObj.ratePerGram20k, deduction: deductionOrdinary },
            '18k': { totalWeight: 0, rate: goldRateObj.ratePerGram18k, deduction: deductionOrdinary }
        };

        for (const item of itemsData) {
            const w = parseFloat(item.netWeight) || 0;
            totalWeight += w;
            if (purityStats[item.purity]) {
                purityStats[item.purity].totalWeight += w;
            }
        }

        for (const purity in purityStats) {
            const stats = purityStats[purity];
            if (stats.totalWeight > 0) {
                let currentRate = stats.rate;
                const totalDeductionPercent = stats.deduction * stats.totalWeight;
                if (totalDeductionPercent) currentRate -= currentRate * (totalDeductionPercent / 100);

                if (!currentRate || currentRate <= 0) {
                    console.error(`Validation Error: Effective Gold rate for ${purity} is missing or zero (Rate: ${currentRate})`);
                    cleanupFiles(req.files);
                    return res.status(400).json({ message: `Gold rate for ${purity} is not set correctly by admin or deduction exceeds 100%` });
                }
                totalValuation += stats.totalWeight * currentRate;
            }
        }

        const maxLoan = totalValuation * (appliedMaxLoanPercent / 100);
        console.log("Valuation debug:", { totalValuation, maxLoan, requestedLoanAmount });

        if (requestedLoanAmount > maxLoan) {
            console.error(`Validation Error: Requested ${requestedLoanAmount} > Max ${maxLoan}`);
            cleanupFiles(req.files);
            return res.status(400).json({ message: `Loan amount exceeds limit of ${maxLoan}` });
        }


        const loanNow = new Date();

        const dueDate = new Date(loanNow);
        dueDate.setMonth(dueDate.getMonth() + appliedTenure);

        const nextPaymentDate = new Date(loanNow);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);


        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        const countToday = await Loan.countDocuments({
            loanId: { $regex: `LN-${today}` }
        });

        const loanId = `LN-${today}-${String(countToday + 1).padStart(3, '0')}`;

        const loan = new Loan({
            loanId: loanId,
            customer: customerId,
            scheme: schemeId,
            totalWeight,
            totalPurity: 'Mixed',
            goldRateAtPledge: goldRateObj.ratePerGram22k || goldRateObj.ratePerGram20k || goldRateObj.ratePerGram18k || 0,
            valuation: totalValuation,
            loanAmount: requestedLoanAmount,
            preInterestAmount: preInterestAmount || 0,
            processingCharges: processingCharges || 0,
            interestMonths: appliedInterestMonths,
            dueDate: dueDate,
            nextPaymentDate: nextPaymentDate,
            createdBy: req.user._id,
            branch: req.user.branch,
            currentBalance: requestedLoanAmount
        });

        const createdLoan = await loan.save();



        const photoPaths = req.files ? req.files.map(f => `src/uploads/${f.filename}`) : [];

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

        // Handle Auto-Settlement of Old Loan if this is a Renewal / Top-up
        if (renewFromLoanId) {
            const oldLoan = await Loan.findById(renewFromLoanId);
            if (oldLoan && oldLoan.status !== 'closed') {
                const calculatedOldLoan = calculateLoanPayables(oldLoan);

                const settlementPayment = new Payment({
                    loan: oldLoan._id,
                    amount: calculatedOldLoan.payableAmount,
                    type: 'full_settlement',
                    paymentMode: 'renewal',
                    collectedBy: req.user._id,
                    remarks: `Auto-settled via Top-up Loan ${createdLoan.loanId}`
                });
                await settlementPayment.save();

                oldLoan.status = 'closed';
                oldLoan.currentBalance = 0;
                oldLoan.payableAmount = 0;
                await oldLoan.save();

                // Track renewal relationship if we wanted to, but the payment remark suffices.
            }
        }

        res.status(201).json(createdLoan);

    } catch (error) {
        console.error("createLoan Exception:", error);
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

        if (req.query.scheme) {
            query.scheme = req.query.scheme;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.customer) {
            query.customer = req.query.customer;
        }

        const loans = await Loan.find(query)
            .populate('customer', 'name phone photo')
            .populate('scheme', 'schemeName interestMonths')
            .sort({ createdAt: -1 })
            .lean();

        const normalizedLoans = loans.map(normalizeLoanPaths);
        res.json(normalizedLoans);
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
            .lean();

        if (!loan && !id.match(/^[0-9a-fA-F]{24}$/)) {
            // Search by customer name or phone if no exact ID match
            const Customer = mongoose.model('Customer');
            const matchingCustomers = await Customer.find({
                $or: [
                    { name: { $regex: id, $options: 'i' } },
                    { phone: { $regex: id, $options: 'i' } }
                ]
            }).select('_id');

            if (matchingCustomers.length > 0) {
                const customerIds = matchingCustomers.map(c => c._id);
                const matchingLoans = await Loan.find({
                    customer: { $in: customerIds },
                    status: { $ne: 'closed' } // Prefer active loans for payment search
                })
                    .populate('customer', 'name phone photo')
                    .populate('scheme', 'schemeName')
                    .sort({ createdAt: -1 });

                if (matchingLoans.length > 0) {
                    const normalizedMatches = matchingLoans.map(l => {
                        const loanObj = l.toObject ? l.toObject() : l;
                        return normalizeLoanPaths(loanObj);
                    });
                    return res.json(normalizedMatches);
                }
            }
        }

        if (loan) {
            loan = calculateLoanPayables(loan);
            normalizeLoanPaths(loan);
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
        const activeLoans = await Loan.countDocuments({ ...query, status: { $nin: ['closed', 'auctioned'] } });
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


        const totalActive = await Loan.countDocuments({ ...query, status: { $nin: ['closed', 'auctioned'] } });

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

const incrementPrintCount = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        loan.printCount = (loan.printCount || 0) + 1;
        await loan.save();

        res.json({ message: 'Print count updated', printCount: loan.printCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


export { createLoan, getLoans, getLoanById, getDashboardStats, getStaffDashboardStats, incrementPrintCount };