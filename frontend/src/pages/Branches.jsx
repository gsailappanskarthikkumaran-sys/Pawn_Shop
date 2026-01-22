import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Trash2, MapPin, Building2, Users } from 'lucide-react';
import './Branches.css';

const Branches = () => {
    const navigate = useNavigate();
    const [branches, setBranches] = useState([]);
    const [newBranch, setNewBranch] = useState({ id: '', name: '', address: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleAddBranch = async (e) => {
        e.preventDefault();
        if (!newBranch.id || !newBranch.name || !newBranch.address) return;

        setLoading(true);
        try {
            await api.post('/branches', newBranch);
            setNewBranch({ id: '', name: '', address: '' });
            fetchBranches();
            alert('Branch Added Successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add branch');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await api.delete(`/branches/${id}`);
                fetchBranches();
            } catch (error) {
                console.error('Error deleting branch:', error);
            }
        }
    };

    return (
        <div className="branches-container">
            <h1 className="page-title">Manage Branches</h1>

            <div className="branch-section">
                <div className="add-branch-form">
                    <h3>Add New Branch</h3>
                    <form onSubmit={handleAddBranch} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Branch ID</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newBranch.id}
                                onChange={(e) => setNewBranch({ ...newBranch, id: e.target.value })}
                                placeholder="Enter Branch ID"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Branch Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newBranch.name}
                                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                placeholder="Enter Branch Name"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                className="input-field"
                                value={newBranch.address}
                                onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                                placeholder="123 Street Name"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ height: '42px' }}>
                            <Plus size={18} /> Add Branch
                        </button>
                    </form>
                </div>

                <div className="branch-list">
                    <h3>All Branches</h3>
                    {branches.length === 0 ? (
                        <p className="no-data">No branches found.</p>
                    ) : (
                        <div className="branch-param-grid">
                            {branches.map((branch) => (
                                <div key={branch._id} className="branch-param-card">
                                    <div
                                        className="branch-param-info"
                                        onClick={() => navigate(`/branches/${branch._id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <Building2 size={16} className="text-primary" />
                                            <span className="branch-param-name">{branch.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <MapPin size={14} />
                                            <span>{branch.address}</span>
                                        </div>
                                    </div>
                                    <div className="branch-actions" style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/staff/add?branchId=${branch._id}`); }}
                                            title="Add Staff"
                                            style={{ color: '#0f172a' }}
                                        >
                                            <Users size={18} />
                                        </button>
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => handleDelete(branch._id)}
                                            title="Delete Branch"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Branches;
