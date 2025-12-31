import cron from 'node-cron';
import Loan from '../models/Loan.js';

import Notification from '../models/Notification.js';
import User from '../models/User.js';

const startOverdueJob = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Overdue Check Job...');
        try {
            const today = new Date();

            // 1. Find active loans that are past due date
            const overdueLoans = await Loan.find({
                status: 'active',
                dueDate: { $lt: today }
            });

            if (overdueLoans.length > 0) {
                console.log(`Found ${overdueLoans.length} loans to mark as overdue.`);

                // Get all Admin users to notify
                const admins = await User.find({ role: 'admin' });

                for (const loan of overdueLoans) {
                    // Update Status
                    loan.status = 'overdue';
                    await loan.save();

                    // Create Notification for Admins
                    const notifications = admins.map(admin => ({
                        recipient: admin._id,
                        title: 'Loan Overdue Alert',
                        message: `Loan ${loan.loanId} (Amt: ${loan.loanAmount}) is now OVERDUE.`,
                        type: 'warning',
                        referenceId: loan.loanId,
                        referenceType: 'Loan'
                    }));

                    if (notifications.length > 0) {
                        await Notification.insertMany(notifications);
                    }
                }
                console.log(`Updated ${overdueLoans.length} loans and sent notifications.`);
            } else {
                console.log('No new overdue loans found.');
            }

        } catch (error) {
            console.error('Error in Overdue Job:', error);
        }
    });
};

export default startOverdueJob;
