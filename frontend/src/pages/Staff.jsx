import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, User, Trash2, Shield } from 'lucide-react';
import './Staff.css';
import { useNavigate } from 'react-router-dom';

const Staff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await api.get('/staff');
            setStaff(data);
        } catch (error) {
            console.error("Failed to fetch staff", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/staff/${id}`);
            setStaff(staff.filter(s => s._id !== id));
        } catch (error) {
            alert('Failed to delete staff');
        }
    };

    return (
        <div className="staff-container p-8">
            <div className="page-header">
                <div className="page-title">
                    <h1>Staff Management</h1>
                    <p>Manage employee access and accounts</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/staff/add')}>
                    <UserPlus size={18} /> Add New Staff
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="staff-grid">
                    {staff.length === 0 ? (
                        <div className="empty-state">
                            <User size={48} className="mx-auto mb-4 text-slate-300" />
                            <h3>No Staff Members Yet</h3>
                            <p>Add your first staff member to get started managing access.</p>
                        </div>
                    ) : (
                        staff.map((member) => (
                            <div key={member._id} className="staff-card">
                                <div className="staff-card-header">
                                    <div className="staff-avatar-lg">
                                        {member.fullName.charAt(0)}
                                    </div>
                                    <div className="staff-meta">
                                        <h3>{member.fullName}</h3>
                                        <span className="staff-role-pill">Verified Staff</span>
                                    </div>
                                </div>

                                <div className="staff-body">
                                    <div className="info-row">
                                        <span className="info-label">
                                            <Shield size={16} /> Staff ID
                                        </span>
                                        <span className="info-value font-mono">{member.username}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">
                                            <User size={16} /> Role
                                        </span>
                                        <span className="info-value capitalize">{member.role}</span>
                                    </div>
                                </div>

                                <div className="staff-footer">
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(member._id)}
                                    >
                                        <Trash2 size={16} /> Remove Access
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Staff;
