import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, X } from 'lucide-react';
import './Print.css';

const PrintView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [type, id]);

    const fetchData = async () => {
        try {
            let endpoint = '';
            if (type === 'loan') endpoint = `/loans/${id}`;
            else if (type === 'customer') endpoint = `/customers/${id}`;
            else if (type === 'payment') endpoint = `/payments/${id}`;
            else if (type === 'report-demand') {
                // Fetch demand report from reports API
                const { data } = await api.get('/reports/demand');
                setData(data);
                return; // Direct return as we set data differently
            }

            if (endpoint) {
                const { data } = await api.get(endpoint);
                setData(data);
            }
        } catch (error) {
            console.error("Print fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Preparing document...</div>;
    if (!data) return <div className="text-center p-10">Document not found.</div>;

    return (
        <div className="print-layout">
            <div className="screen-controls">
                <button onClick={() => window.close()} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
                    <X size={16} /> Close
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Printer size={16} /> Print
                </button>
            </div>

            <div className="paper-sheet">
                {/* Header */}
                <div className="print-header">
                    <div className="company-name">PAWN BROKING SYSTEM</div>
                    <div className="company-details">
                        123 Gold Street, Finance District, City - 560001<br />
                        Phone: +91 98765 43210 | Email: support@pawnshop.com
                    </div>
                </div>

                {/* Content based on Type */}
                {type === 'loan' && <LoanReceipt loan={data} />}
                {type === 'customer' && <CustomerProfile customer={data} />}
                {type === 'payment' && <PaymentReceipt payment={data} />}
                {type === 'report-demand' && <DemandReport report={data} />}
            </div>
        </div>
    );
};

// Sub-components for specific layouts
const LoanReceipt = ({ loan }) => (
    <div>
        <h2 className="document-title">PLEDGE RECEIPT</h2>

        <div className="grid-2">
            <div>
                <div className="detail-group mb-4">
                    <label>Loan ID</label>
                    <div className="text-xl">{loan.loanId}</div>
                </div>
                <div className="detail-group mb-4">
                    <label>Date</label>
                    <div>{new Date(loan.createdAt).toLocaleDateString()}</div>
                </div>
                {/* New: Customer Details here for better flow ? No, keep structure */}
            </div>
            <div className="text-right">
                <div className="detail-group mb-4">
                    <label>Principal Amount</label>
                    <div className="text-2xl font-bold">₹{loan.loanAmount}</div>
                </div>
                {loan.preInterestAmount > 0 && (
                    <div className="detail-group mb-4">
                        <label>Less: Pre-interest Deduction</label>
                        <div className="text-lg text-red-600">- ₹{loan.preInterestAmount}</div>
                        <div className="text-xs text-gray-500">
                            ({loan.scheme?.preInterestMonths || 0} months @ {loan.scheme?.interestRate}%)
                        </div>
                    </div>
                )}
                <div className="detail-group mb-4 border-t border-black pt-2">
                    <label>Net Cash Received</label>
                    <div className="text-2xl font-bold">
                        ₹{loan.loanAmount - (loan.preInterestAmount || 0)}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid-2 mt-4">
            <div>
                <div className="detail-group mb-4">
                    <label>Scheme</label>
                    <div>{loan.scheme?.schemeName} ({loan.scheme?.interestRate}%)</div>
                </div>
                <div className="detail-group mb-4">
                    <label>Maturity Date</label>
                    <div>{new Date(loan.dueDate).toLocaleDateString()}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="detail-group mb-4">
                    <label>Next Payment Due Date</label>
                    <div className="font-bold text-lg">
                        {new Date(loan.nextPaymentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                    </div>
                </div>
                <div className="detail-group mb-4">
                    <label>Next Due Amount (Interest)</label>
                    <div className="font-bold">
                        ₹{((loan.loanAmount * (loan.interestRate || 2)) / 100).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-bold border-b border-black mb-2 uppercase">Customer Details</h3>
            <div className="grid-2">
                <div className="detail-group">
                    <label>Name</label>
                    <div>{loan.customer?.name}</div>
                </div>
                <div className="detail-group">
                    <label>Phone</label>
                    <div>{loan.customer?.phone}</div>
                </div>
            </div>
            <div className="detail-group mt-2">
                <label>Address</label>
                <div>{loan.customer?.address}</div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-bold border-b border-black mb-2 uppercase">Item Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Item Name</th>
                        <th>Description</th>
                        <th>Purity</th>
                        <th>Net Weight (g)</th>
                    </tr>
                </thead>
                <tbody>
                    {loan.items?.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.name || 'Gold Item'}</td>
                            <td>{item.description || '-'}</td>
                            <td>{item.purity}</td>
                            <td>{item.netWeight}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="4" className="text-right font-bold">Total Weight</td>
                        <td className="font-bold">{loan.totalWeight}g</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="mb-8 p-4 border border-dashed border-gray-400 text-xs">
            <strong>Terms & Conditions:</strong>
            <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Interest must be paid monthly. Defaulting may attract penalty interest.</li>
                <li>The pledge is valid for {loan.scheme?.tenureMonths || 12} months.</li>
                <li>The company reserves the right to auction the pledged items if the loan is not redeemed within the period.</li>
                <li>Please produce this receipt at the time of redemption or interest payment.</li>
            </ul>
        </div>

        <div className="footer">
            <div className="signature-box">
                <div className="signature-line"></div>
                Customer Signature
            </div>
            <div className="signature-box">
                <div className="signature-line"></div>
                Authorized Signatory
            </div>
        </div>
    </div>
);

const CustomerProfile = ({ customer }) => (
    <div>
        <h2 className="document-title">CUSTOMER PROFILE</h2>
        <div className="grid-2">
            <div className="detail-group mb-4">
                <label>Customer ID</label>
                <div>{customer.customerId}</div>
            </div>
            <div className="detail-group mb-4">
                <label>Join Date</label>
                <div>{new Date(customer.createdAt).toLocaleDateString()}</div>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold border-b border-black mb-4 uppercase">Personal Information</h3>
            <div className="grid-2 gap-y-6">
                <div className="detail-group">
                    <label>Full Name</label>
                    <div>{customer.name}</div>
                </div>
                <div className="detail-group">
                    <label>Phone Number</label>
                    <div>{customer.phone}</div>
                </div>
                <div className="detail-group">
                    <label>Email Address</label>
                    <div>{customer.email || 'N/A'}</div>
                </div>
                <div className="detail-group">
                    <label>City/Location</label>
                    <div>{customer.city || 'N/A'}</div>
                </div>
            </div>
            <div className="detail-group mt-4">
                <label>Full Address</label>
                <div>{customer.address}</div>
            </div>
        </div>

        <div className="footer">
            <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                Report Generated on {new Date().toLocaleString()}
            </div>
        </div>
    </div>
);

const PaymentReceipt = ({ payment }) => (
    <div>
        <h2 className="document-title">PAYMENT RECEIPT</h2>
        <div className="grid-2">
            <div className="detail-group mb-4">
                <label>Receipt No</label>
                <div>{payment._id.substring(payment._id.length - 8).toUpperCase()}</div>
            </div>
            <div className="detail-group mb-4">
                <label>Date</label>
                <div>{new Date(payment.paymentDate).toLocaleDateString()}</div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-sm font-bold border-b border-black mb-4 uppercase">Payment Details</h3>
            <div className="grid-2 gap-y-6">
                <div className="detail-group">
                    <label>Amount Paid</label>
                    <div className="text-2xl font-bold">₹{payment.amount}</div>
                </div>
                <div className="detail-group">
                    <label>Payment Type</label>
                    <div style={{ textTransform: 'capitalize' }}>{payment.type.replace('_', ' ')}</div>
                </div>
                <div className="detail-group">
                    <label>Payment Mode</label>
                    <div style={{ textTransform: 'capitalize' }}>{payment.paymentMode || 'Cash'}</div>
                </div>
                <div className="detail-group">
                    <label>Loan ID</label>
                    <div>{payment.loan?.loanId || 'N/A'}</div>
                </div>
                <div className="detail-group">
                    <label>Remarks</label>
                    <div>{payment.remarks || '-'}</div>
                </div>
            </div>
        </div>

        {payment.loan && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                <h3 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Upcoming Payment</h3>
                <div className="grid-2">
                    <div className="detail-group">
                        <label>Next Due Date</label>
                        <div className="font-bold text-lg">
                            {/* Determine date based on current payment or loan next date */}
                            {new Date(payment.loan.nextPaymentDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="detail-group text-right">
                        <label>Next Interest Amount</label>
                        <div className="font-bold">
                            ₹{((payment.loan.loanAmount * (payment.loan.interestRate || 2)) / 100).toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                    Please pay by the due date to avoid penalty charges.
                </div>
            </div>
        )}
    </div>
);



const DemandReport = ({ report }) => (
    <div>
        <h2 className="document-title">DEMAND / OVERDUE REPORT</h2>
        <div className="mb-4 text-sm text-gray-500">
            Generated on: {new Date().toLocaleString()}
        </div>

        <table className="w-full text-xs text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2">Loan ID</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2 text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                {report.map((loan, idx) => (
                    <tr key={loan._id} className="border-b border-gray-200">
                        <td className="py-2">{loan.loanId}</td>
                        <td className="py-2">{loan.customer?.name} <br /><span className="text-gray-400">{loan.customer?.phone}</span></td>
                        <td className="py-2">{new Date(loan.createdAt).toLocaleDateString()}</td>
                        <td className="py-2">₹{loan.loanAmount}</td>
                        <td className="py-2 text-red-600 font-bold">{new Date(loan.dueDate || Date.now()).toLocaleDateString()}</td>
                        <td className="py-2 text-right font-bold">₹{loan.currentBalance}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="mt-8 pt-4 border-t border-black grid grid-cols-2">
            <div>
                <strong>Total Loans:</strong> {report.length}
            </div>
            <div className="text-right">
                <strong>Total Outstanding:</strong> ₹{report.reduce((sum, l) => sum + l.currentBalance, 0).toFixed(2)}
            </div>
        </div>
    </div>
);

export default PrintView;
