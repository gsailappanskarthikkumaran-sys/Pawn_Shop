import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, Plus, User, Phone, Mail, MapPin, ChevronRight, Filter } from 'lucide-react';
import './Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Customers</h1>
                    <p>Manage KYC and customer profiles</p>
                </div>
                <button className="btn-add" onClick={() => window.location.href = '/customers/add'}>
                    <Plus size={20} strokeWidth={2.5} /> Add New Customer
                </button>
            </div>

            <div className="customers-card">
                <div className="card-toolbar">
                    <div className="search-wrapper">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, phone or ID..."
                            className="search-input"
                        />
                    </div>
                    <button className="filter-btn">
                        <Filter size={18} /> Filters
                    </button>
                </div>

                <div className="table-container">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Customer Profile</th>
                                <th>Contact Info</th>
                                <th>Address</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading customers...</td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No customers found. Add one to get started.</td></tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id}>
                                        <td>
                                            <div className="customer-cell">
                                                <div className="customer-avatar">
                                                    {customer.photo ? <img src={`http://localhost:5000/${customer.photo}`} alt={customer.name} /> : <User size={24} color="#94a3b8" />}
                                                </div>
                                                <div className="customer-info">
                                                    <h3>{customer.name}</h3>
                                                    <span className="customer-id-badge">{customer.customerId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <p>
                                                    <Phone size={14} color="#94a3b8" /> {customer.phone}
                                                </p>
                                                {customer.email && (
                                                    <p>
                                                        <Mail size={14} color="#94a3b8" /> {customer.email}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="address-cell">
                                                <MapPin size={16} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
                                                <span>{customer.address}</span>
                                            </div>
                                        </td>
                                        <td className="action-cell">
                                            <button
                                                className="action-arrow-btn"
                                                onClick={() => navigate(`/customers/${customer._id}`)}
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Customers;
