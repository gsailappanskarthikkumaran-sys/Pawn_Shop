import cron from 'node-cron';
import Loan from '../models/Loan.js';

import { notifyAdminsAndStaff } from '../services/notificationService.js';

const startOverdueJob = () => {

    cron.schedule('0 0 * * *', async () => {
        console.log('Running Overdue Check Job...');
        try {
            const today = new Date();


            const overdueLoans = await Loan.find({
                status: 'active',
                dueDate: { $lt: today }
            });

            if (overdueLoans.length > 0) {
                console.log(`Found ${overdueLoans.length} loans to mark as overdue.`);


                for (const loan of overdueLoans) {
                    loan.status = 'overdue';
                    await loan.save();

                    // Send notifications using the service
                    await notifyAdminsAndStaff({
                        title: 'Loan Overdue Alert',
                        message: `Loan ${loan.loanId} (Amt: ₹${loan.loanAmount}) is now OVERDUE.`,
                        type: 'warning',
                        branch: loan.branch,
                        referenceId: loan.loanId,
                        referenceType: 'Loan'
                    });
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
