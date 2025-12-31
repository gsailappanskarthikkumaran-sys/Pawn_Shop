import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, User, Lock, Briefcase } from 'lucide-react';
import './Staff.css';

const AddStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchStaffData();
        }
    }, [id]);

    const fetchStaffData = async () => {
        try {
            // Since we don't have a single staff fetch endpoint, we find from the list
            // Or ideally, add GET /staff/:id
            // For now, let's fetch all and find
            const { data } = await api.get('/staff');
            const member = data.find(s => s._id === id);
            if (member) {
                setFormData({
                    fullName: member.fullName,
                    username: member.username,
                    password: '' // Keep empty, only send if changing
                });
            } else {
                alert('Staff not found');
                navigate('/staff');
            }
        } catch (error) {
            console.error(error);
            navigate('/staff');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                await api.put(`/staff/${id}`, formData);
                alert('Staff Updated Successfully!');
            } else {
                await api.post('/staff', formData);
                alert('Staff Added Successfully!');
            }
            navigate('/staff');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header">
                <div className="page-title">
                    <h1>{isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}</h1>
                    <p>{isEditMode ? 'Update access credentials' : 'Create credentials for a new employee'}</p>
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
                        <label className="form-label"><Lock size={16} style={{ display: 'inline', marginRight: '6px' }} /> Password {isEditMode && '(Leave blank to keep current)'}</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!isEditMode}
                            placeholder={isEditMode ? "Enter new password to change" : "Set initial password"}
                            minLength="6"
                        />
                    </div>

                    <div className="form-actions border-t pt-4 mt-6 flex justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/staff')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Account' : 'Create Account')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;
