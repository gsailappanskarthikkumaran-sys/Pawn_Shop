import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import './AdminRequests.css';

const AdminRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // Fetch only pending requests for actionable view, or all for history
            const { data } = await api.get('/scheme-requests');
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const comment = prompt("Enter a response/reason for this action:", status === 'approved' ? 'Approved' : 'Rejected');
        if (comment === null) return; // Cancelled

        try {
            await api.put(`/scheme-requests/${id}/status`, {
                status,
                adminComment: comment
            });
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error(error);
            alert("Failed to update status. You might not have permission.");
        }
    };

    if (loading) return <div className="p-8">Loading Requests...</div>;

    return (
        <div className="admin-requests-container">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold">{user?.role === 'admin' ? 'Scheme Customization Requests' : 'My Scheme Requests'}</h1>
                    <p className="text-gray-600">
                        {user?.role === 'admin'
                            ? 'Approve or reject special scheme parameter overrides requested by staff.'
                            : 'Track the status of your customization requests.'}
                    </p>
                </div>
            </div>

            <div className="requests-table-wrapper">
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>Date</th>
                            <th>Staff Member</th>
                            <th>Customer</th>
                            <th>Scheme</th>
                            <th>Proposed Changes</th>
                            <th style={{ width: '25%' }}>Reason & Response</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No requests found.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req._id}>
                                    <td>{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                                    <td style={{ fontWeight: 500 }}>{req.staffId?.fullName || 'Unknown'}</td>
                                    <td className="customer-info-cell">
                                        <div>{req.customerId?.name}</div>
                                        <div>{req.customerId?.customerId}</div>
                                    </td>
                                    <td>{req.originalSchemeId?.schemeName}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className="change-tag tag-blue">
                                                Int: {req.proposedValues.interestRate}%
                                            </span>
                                            <span className="change-tag tag-purple">
                                                Tenure: {req.proposedValues.tenureMonths}m
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontStyle: 'italic', color: '#334155' }}>"{req.reason}"</div>
                                        {req.adminComment && (
                                            <div className="admin-comment">
                                                <strong>Response:</strong> {req.adminComment}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${req.status}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {req.status === 'pending' && (
                                            <div className="action-btn-group">
                                                <button
                                                    onClick={() => handleAction(req._id, 'approved')}
                                                    className="btn-action btn-approve"
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req._id, 'rejected')}
                                                    className="btn-action btn-reject"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRequests;
