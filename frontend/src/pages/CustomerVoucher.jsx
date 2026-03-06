import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Printer, FileText, User } from 'lucide-react';
import SearchableDropdown from '../components/SearchableDropdown';
import './CustomerVoucher.css';

const CustomerVoucher = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [loans, setLoans] = useState([]);
    const [selectedLoanId, setSelectedLoanId] = useState('');
    const [loadingLoans, setLoadingLoans] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomerId) {
            fetchCustomerLoans(selectedCustomerId);
        } else {
            setLoans([]);
            setSelectedLoanId('');
        }
    }, [selectedCustomerId]);

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };

    const fetchCustomerLoans = async (customerId) => {
        setLoadingLoans(true);
        try {
            const { data } = await api.get(`/loans?customer=${customerId}`);
            setLoans(data);
            setLoadingLoans(false);
        } catch (error) {
            console.error("Failed to fetch loans", error);
            setLoadingLoans(false);
        }
    };

    const handlePrint = (loanId) => {
        window.open(`/print/customer-voucher/${loanId}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="voucher-page-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Customer Voucher</h1>
                    <p>Search customer and print loan voucher</p>
                </div>
            </div>

            <div className="voucher-search-card">
                <div className="search-section">
                    <label className="input-label-bold">Find Customer</label>
                    <SearchableDropdown
                        options={customers.map(c => ({
                            label: `${c.name} (${c.customerId})`,
                            value: c._id
                        }))}
                        value={selectedCustomerId}
                        onChange={value => setSelectedCustomerId(value)}
                        placeholder="Search by name, phone or ID..."
                    />
                </div>

                {selectedCustomerId && (
                    <div className="loans-section">
                        <h3>Customer Loans</h3>
                        {loadingLoans ? (
                            <p>Loading loans...</p>
                        ) : loans.length === 0 ? (
                            <div className="no-loans">No loans found for this customer.</div>
                        ) : (
                            <div className="loans-grid">
                                {loans.map(loan => (
                                    <div key={loan._id} className="loan-item-card">
                                        <div className="loan-info-brief">
                                            <div className="loan-id-tag">ID: {loan.loanId}</div>
                                            <div className="loan-amount-tag">₹{loan.loanAmount}</div>
                                        </div>
                                        <div className="loan-date-brief">
                                            {new Date(loan.createdAt).toLocaleDateString('en-IN')}
                                        </div>
                                        <div className="loan-status-brief">
                                            Status: <span className={`status-${loan.status}`}>{loan.status}</span>
                                        </div>
                                        <button
                                            className="btn-print-voucher"
                                            onClick={() => handlePrint(loan._id)}
                                        >
                                            <Printer size={16} /> Print Voucher
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerVoucher;
