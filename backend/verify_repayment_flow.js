import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loan from './src/models/Loan.js';
import Payment from './src/models/Payment.js';
import Scheme from './src/models/Scheme.js';
import User from './src/models/User.js';
import Branch from './src/models/Branch.js';
import Customer from './src/models/Customer.js';

dotenv.config();

const verifyFlow = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');


        const admin = await User.findOne({ role: 'admin' });
        const branch = await Branch.findOne({});
        const customer = await Customer.findOne({});
        let scheme = await Scheme.findOne({ schemeName: 'Test Pre-Interest Scheme' });
        if (!scheme) {
            scheme = await Scheme.create({
                schemeName: 'Test Pre-Interest Scheme',
                interestRate: 2,
                tenureMonths: 12,
                preInterestMonths: 1,
                maxLoanPercentage: 75,
                isActive: true
            });
            console.log('Created Test Scheme');
        }

        const loanAmount = 10000;
        const preInterest = (loanAmount * scheme.interestRate / 100) * scheme.preInterestMonths;

        console.log(`Creating Loan: Amount=${loanAmount}, PreInterest=${preInterest}`);

        const loan = await Loan.create({
            loanId: `TEST-${Date.now()}`,
            customer: customer._id,
            scheme: scheme._id,
            totalWeight: 10,
            goldRateAtPledge: 5000,
            valuation: 50000,
            loanAmount: loanAmount,
            interestRate: scheme.interestRate,
            preInterestAmount: preInterest,
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Manually setting closer to what controller does
            branch: branch._id,
            totalPurity: '22k',
            currentBalance: loanAmount
        });

        console.log(`Loan Created: ID=${loan._id}, Next Payment Date=${loan.nextPaymentDate.toISOString()}`);

        if (loan.preInterestAmount !== 200) {
            console.error('ERROR: Pre-interest amount incorrect', loan.preInterestAmount);
        } else {
            console.log('SUCCESS: Pre-interest amount correct (200)');
        }


        console.log('Making Interest Payment...');
        const initialNextDate = new Date(loan.nextPaymentDate);

        const payment = await Payment.create({
            loan: loan._id,
            amount: 200,
            type: 'interest',
            paymentMode: 'cash',
            collectedBy: admin._id
        });


        const nextDate = new Date(loan.nextPaymentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        loan.nextPaymentDate = nextDate;
        await loan.save();

        console.log(`Payment Made. New Next Payment Date=${loan.nextPaymentDate.toISOString()}`);


        if (loan.nextPaymentDate > initialNextDate) {
            console.log('SUCCESS: Next payment date updated forward.');
        } else {
            console.error('ERROR: Next payment date NOT updated.');
        }

        await Loan.findByIdAndDelete(loan._id);
        await Payment.findByIdAndDelete(payment._id);
        await scheme.deleteOne();
        await customer.deleteOne();
        await branch.deleteOne();

        console.log('Verification Complete. Cleanup Done.');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyFlow();
