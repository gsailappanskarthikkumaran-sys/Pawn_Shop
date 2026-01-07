
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import Loan from './src/models/Loan.js';
import Payment from './src/models/Payment.js';

dotenv.config();

const debug = async () => {
    try {
        await connectDB();

        console.log('Connected to DB');

        const loan = await Loan.findOne().populate('branch');
        if (!loan) {
            console.log('No loans found');
            process.exit();
        }

        console.log('Sample Loan ID:', loan._id);
        console.log('Loan Branch:', loan.branch);
        console.log('Loan Branch Type in Doc:', typeof loan.branch);


        const rawLoan = await Loan.collection.findOne({ _id: loan._id });
        console.log('Raw Loan Branch:', rawLoan.branch);
        console.log('Raw Loan Branch Constructor:', rawLoan.branch ? rawLoan.branch.constructor.name : 'N/A');
        console.log('Raw CurrentBalance:', rawLoan.currentBalance, typeof rawLoan.currentBalance);

        const branchId = rawLoan.branch;

        console.log('Testing Aggregation with BranchId:', branchId);

        const totals = await Loan.aggregate([
            { $match: { branch: branchId } },
            {
                $group: {
                    _id: null,
                    totalOutstanding: { $sum: "$currentBalance" }
                }
            }
        ]);
        console.log('Aggregation (ObjectId) Result:', totals);

        const totalsString = await Loan.aggregate([
            { $match: { branch: branchId.toString() } },
            {
                $group: {
                    _id: null,
                    totalOutstanding: { $sum: "$currentBalance" }
                }
            }
        ]);
        console.log('Aggregation (String) Result:', totalsString);

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

debug();
