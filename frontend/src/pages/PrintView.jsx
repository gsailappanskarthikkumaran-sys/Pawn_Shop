import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Printer, ArrowLeft, X } from 'lucide-react';
import './Print.css';

const PrintView = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasPrinted = useRef(false);

    useEffect(() => {
        fetchData();
        // Reset hasPrinted when id/type changes
        return () => { hasPrinted.current = false; };
    }, [type, id]);

    const fetchData = async () => {
        try {
            let endpoint = '';
            if (type === 'loan') endpoint = `/loans/${id}`;
            else if (type === 'customer') endpoint = `/customers/${id}`;
            else if (type === 'payment') endpoint = `/payments/${id}`;
            else if (type === 'day-book') {
                const { data } = await api.get(`/reports/day-book?date=${id}`);
                setData(data);
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }
            else if (type === 'report-demand') {
                const { data } = await api.get('/reports/demand');
                setData(data);
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }
            else if (type === 'mini-statement') {
                const [loanRes, paymentsRes] = await Promise.all([
                    api.get(`/loans/${id}`),
                    api.get(`/payments/loan/${id}`)
                ]);
                setData({ loan: loanRes.data, payments: paymentsRes.data });
                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => window.print(), 500);
                }
                return;
            }

            if (endpoint) {
                const { data } = await api.get(endpoint);
                setData(data);

                if (!hasPrinted.current) {
                    hasPrinted.current = true;
                    setTimeout(() => {
                        window.print();
                    }, 500);
                }
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

                <div className="print-header">
                    <div className="company-name">MAHES BANKERS</div>
                    <div className="company-details">
                        2005/1, P.K.N. Road, Srinivasa Mess, SIVAKASI - 626 123
                        SIVAKASI - 626 189 | Phone No.8838543387 | Email: support@pawnshop.com
                    </div>
                </div>


                {type === 'loan' && <LoanReceipt loan={data} />}
                {type === 'customer' && <CustomerProfile customer={data} />}
                {type === 'payment' && <PaymentReceipt payment={data} />}
                {type === 'day-book' && <DayBookReport data={data} date={id} />}
                {type === 'report-demand' && <DemandReport report={data} />}
                {type === 'mini-statement' && <MiniStatement data={data} />}
            </div>
        </div>
    );
};


const LoanReceipt = ({ loan }) => (
    <div>
        <h2 className="document-title">RECEIPT</h2>

        <div className="grid-2">
            <div>
                <div className="detail-group mb-4">
                    <label>Loan ID</label>
                    <div className="text-xl">{loan.loanId}</div>
                    <div className="text-xs text-gray-500">Branch: {loan.branch || 'N/A'}</div>
                </div>
                <div className="detail-group mb-4">
                    <label>Date</label>
                    <div>{new Date(loan.createdAt).toLocaleDateString()}</div>
                </div>

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
                        ₹{loan.monthlyInterest ? loan.monthlyInterest.toFixed(2) : ((loan.loanAmount * (loan.interestRate || 2)) / 100).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="S1">Customer Details</h3>
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
            <div className="detail-group">
                <label>Address</label>
                <div>{loan.customer?.address}</div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="Item">Item Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
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
                <div>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</div>
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
            <div className="detail-group mt-4">
                <label>Branch ID</label>
                <div>{customer.branch || 'N/A'}</div>
            </div>

        </div>

        <div className="footer">
            <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                Report Generated on {new Date().toLocaleString('en-IN')}
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
                <div>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</div>
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

                            {new Date(payment.loan.nextPaymentDate).toLocaleDateString('en-IN')}
                        </div>
                    </div>
                    <div className="detail-group text-right">
                        <label>Next Interest Amount</label>
                        <div className="font-bold">
                            ₹{payment.loan.monthlyInterest ? payment.loan.monthlyInterest.toFixed(2) : ((payment.loan.loanAmount * (payment.loan.interestRate || 2)) / 100).toFixed(2)}
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
                        <td className="py-2">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2">₹{loan.loanAmount}</td>
                        <td className="py-2 text-red-600 font-bold">{new Date(loan.dueDate || Date.now()).toLocaleDateString('en-IN')}</td>
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

const DayBookReport = ({ data, date }) => (
    <div>
        <h2 className="document-title">DAY BOOK REPORT</h2>
        <div className="mb-4 text-sm text-gray-500">
            Date: {new Date(date).toLocaleDateString('en-IN')}
        </div>

        <div className="summary-section mb-6 border p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-gray-500 text-xs uppercase">Money In</div>
                    <div className="font-bold text-green-600">₹{data.summary?.totalIn?.toLocaleString() || 0}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs uppercase">Money Out</div>
                    <div className="font-bold text-red-600">₹{data.summary?.totalOut?.toLocaleString() || 0}</div>
                </div>
                <div>
                    <div className="text-gray-500 text-xs uppercase">Net Change</div>
                    <div className="font-bold">₹{data.summary?.netChange?.toLocaleString() || 0}</div>
                </div>
            </div>
        </div>

        <table className="w-full text-xs text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2">Time</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                {data.transactions?.map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${t.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {t.type}
                            </span>
                        </td>
                        <td className="py-2">{t.category}</td>
                        <td className="py-2">{t.description}</td>
                        <td className={`py-2 text-right font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MiniStatement = ({ data }) => {
    const { loan, payments } = data;
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div>
            <h2 className="document-title">LOAN MINI STATEMENT</h2>
            <div className="mb-4 text-xs text-gray-500 text-center">
                Generated on: {new Date().toLocaleString()}
            </div>

            <div className="grid-2 mb-6">
                <div>
                    <div className="detail-group mb-2">
                        <label>Loan ID</label>
                        <div className="font-bold">{loan.loanId}</div>
                    </div>
                    <div className="detail-group mb-2">
                        <label>Customer</label>
                        <div>{loan.customer?.name}</div>
                        <div className="text-xs text-gray-500">{loan.customer?.phone}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="detail-group mb-2">
                        <label>Loan Amount</label>
                        <div className="font-bold">₹{loan.loanAmount}</div>
                    </div>
                    <div className="detail-group mb-2">
                        <label>Date</label>
                        <div>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                </div>
            </div>

            <div className="mb-6 p-2 bg-gray-50 border border-dashed border-gray-300 rounded">
                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500 block">Scheme</span>
                        <span className="font-bold">{loan.scheme?.schemeName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Interest Rate</span>
                        <span className="font-bold">{loan.interestRate}%</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Weight</span>
                        <span className="font-bold">{loan.totalWeight}g</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 block">Current Balance</span>
                        <span className="font-bold text-red-600">₹{loan.currentBalance}</span>
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold border-b border-black mb-3 uppercase">Transaction History</h3>
            <table className="w-full text-xs text-left border-collapse mb-6">
                <thead>
                    <tr className="border-b border-gray-400">
                        <th className="py-2">Date</th>
                        <th className="py-2">Type</th>
                        <th className="py-2">Mode</th>
                        <th className="py-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Initial Loan */}
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="py-2">{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-2">LOAN DISBURSED</td>
                        <td className="py-2">CASH</td>
                        <td className="py-2 text-right font-bold">₹{loan.loanAmount}</td>
                    </tr>
                    {payments.map(p => (
                        <tr key={p._id} className="border-b border-gray-100">
                            <td className="py-2">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                            <td className="py-2 capitalize">{p.type.replace('_', ' ')}</td>
                            <td className="py-2 capitalize">{p.paymentMode || 'Cash'}</td>
                            <td className="py-2 text-right font-bold text-green-600">-₹{p.amount}</td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500 italic">No payments made yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-end border-t border-black pt-4">
                <div className="w-1/2">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Total Principal Received:</span>
                        <span className="font-bold">₹{payments.filter(p => p.type !== 'interest').reduce((s, p) => s + p.amount, 0)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Total Interest Received:</span>
                        <span className="font-bold">₹{payments.filter(p => p.type === 'interest').reduce((s, p) => s + p.amount, 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-dashed border-gray-400 pt-2 mt-2">
                        <span>Outstanding Balance:</span>
                        <span>₹{loan.currentBalance}</span>
                    </div>
                </div>
            </div>

            <div className="footer">
                <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                    This is a computer generated statement.
                </div>
            </div>
        </div>
    );
};

export default PrintView;
