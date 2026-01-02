import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Save, X, User, Lock, Briefcase, MapPin, CreditCard, Phone, Building2, Mail, CheckCircle } from 'lucide-react';
import './Staff.css';
import './AddStaff.css';

const AddStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!id;

    // Get returnUrl from query params
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        address: '',
        phoneNumber: '',
        idProofNumber: '',
        username: '',
        password: '',
        branch: ''
    });
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    // State for showing generated credentials
    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        fetchBranches();
        if (isEditMode) {
            fetchStaffData();
        } else {
            const branchId = searchParams.get('branchId');
            if (branchId) {
                setFormData(prev => ({ ...prev, branch: branchId }));
            }
        }
    }, [id, location.search]);

    const fetchBranches = async () => {
        try {
            const { data } = await api.get('/branches');
            setBranches(data);
        } catch (error) {
            console.error('Failed to fetch branches', error);
        }
    };

    const fetchStaffData = async () => {
        try {
            const { data } = await api.get('/staff');
            const member = data.find(s => s._id === id);
            if (member) {
                setFormData({
                    fullName: member.fullName,
                    email: member.email || '',
                    address: member.address || '',
                    phoneNumber: member.phoneNumber || '',
                    idProofNumber: member.idProofNumber || '',
                    username: member.username,
                    password: '',
                    branch: member.branch?._id || member.branch || '' // Handle populated or raw ID
                });
            } else {
                alert('Staff not found');
                handleNavigateBack();
            }
        } catch (error) {
            console.error(error);
            handleNavigateBack();
        }
    };

    const handleNavigateBack = () => {
        if (returnUrl) {
            navigate(returnUrl);
        } else {
            navigate('/staff');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            idProofNumber: formData.idProofNumber,
            branch: formData.branch
        };

        // Always include username/password
        if (formData.username) payload.username = formData.username;
        if (formData.password) payload.password = formData.password;

        try {
            if (isEditMode) {
                await api.put(`/staff/${id}`, payload);
                alert('Staff Updated Successfully!');
                handleNavigateBack();
            } else {
                const { data } = await api.post('/staff', payload);
                // Show generated credentials
                setCreatedCredentials(null); // Ensure this is cleared
                alert('Staff Added Successfully!');
                handleNavigateBack();
            }
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
                    <p>{isEditMode ? 'Update staff details' : 'Onboard a new staff member'}</p>
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

                    {/* 1.5 Email Address (New) */}
                    <div className="form-group">
                        <label className="form-label"><Mail size={16} style={{ display: 'inline', marginRight: '6px' }} /> Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="e.g. jane@example.com"
                        />
                    </div>

                    {/* 2. Address */}
                    <div className="form-group">
                        <label className="form-label"><MapPin size={16} style={{ display: 'inline', marginRight: '6px' }} /> Address</label>
                        <textarea
                            className="input-field"
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full residential address"
                        ></textarea>
                    </div>

                    {/* 3. Phone Number */}
                    <div className="form-group">
                        <label className="form-label"><Phone size={16} style={{ display: 'inline', marginRight: '6px' }} /> Phone Number</label>
                        <input
                            type="tel"
                            className="input-field"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="e.g. 9876543210"
                        />
                    </div>

                    {/* 4. Branch Selection */}
                    <div className="form-group">
                        <label className="form-label"><Building2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Branch</label>
                        <select
                            className="input-field"
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        >
                            <option value="">Select Branch (Optional)</option>
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 5. Aadhar Card Number */}
                    <div className="form-group">
                        <label className="form-label"><CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} /> Aadhar Card Number (ID Proof)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.idProofNumber}
                            onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                            placeholder="Enter 12-digit Aadhar Number"
                        />
                    </div>


                    {/* Username Field */}
                    <div className="form-group">
                        <label className="form-label"><User size={16} style={{ display: 'inline', marginRight: '6px' }} /> Staff ID (Login Username)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            placeholder="e.g. STF001"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label"><Lock size={16} style={{ display: 'inline', marginRight: '6px' }} /> {isEditMode ? 'Reset Password' : 'Password'}</label>
                        <input
                            type="password"
                            className="input-field"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={isEditMode ? "Enter new password to change" : "Enter password"}
                            required={!isEditMode}
                            minLength="6"
                        />
                    </div>

                    <div className="form-actions border-t pt-4 mt-6 flex justify-end gap-3">
                        <button type="button" className="btn-secondary" onClick={handleNavigateBack}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEditMode ? 'Update Staff Member' : 'Add Staff Member')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;
