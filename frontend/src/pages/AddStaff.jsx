import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, User, Lock, Briefcase } from 'lucide-react';
import './Staff.css'; // Reusing styles

const AddStaff = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/staff', formData);
            alert('Staff Member Added Successfully!');
            navigate('/staff');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <div className="page-title">
                    <h1>Add Staff Member</h1>
                    <p>Create credentials for a new employee</p>
                </div>
            </div>

            <div className="staff-card add-staff-form">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label"><Briefcase size={16} style={{ display: 'inline', marginRight: '6px' }} /> Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            placeholder="e.g. Jane Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><User size={16} style={{ display: 'inline', marginRight: '6px' }} /> Staff ID (Username)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            placeholder="e.g. STF001"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label"><Lock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Set initial password"
                            minLength="6"
                        />
                    </div>

                    <div className="form-actions border-t pt-4 mt-6 flex justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/staff')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;
