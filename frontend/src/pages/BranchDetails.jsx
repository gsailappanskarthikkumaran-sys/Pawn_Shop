import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, UserPlus, MapPin, Building2, User, Edit, Trash2 } from 'lucide-react';

const BranchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [branch, setBranch] = useState(null);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [branchRes, staffRes] = await Promise.all([
                api.get(`/branches/${id}`),
                api.get(`/staff?branch=${id}`)
            ]);
            setBranch(branchRes.data);
            setStaff(staffRes.data);
        } catch (error) {
            console.error("Error fetching branch details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (window.confirm('Are you sure you want to remove this staff member?')) {
            try {
                await api.delete(`/staff/${staffId}`);
                setStaff(staff.filter(s => s._id !== staffId));
            } catch (error) {
                console.error("Error deleting staff", error);
                alert('Failed to remove staff member');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading branch details...</div>;
    if (!branch) return <div className="p-8 text-center text-red-500">Branch not found</div>;

    return (
        <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/branches')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{branch.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        <MapPin size={14} /> {branch.address}
                    </div>
                </div>
            </div>

            <div className="section-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Staff Members</h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Employees assigned to this branch</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/staff/add?branchId=${branch._id}&returnUrl=/branches/${branch._id}`)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <UserPlus size={16} /> Add Staff
                    </button>
                </div>

                {staff.length > 0 ? (
                    <div className="staff-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {staff.map(member => (
                            <div key={member._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '0.5rem' }}>
                                    <button
                                        onClick={() => navigate(`/staff/edit/${member._id}?returnUrl=/branches/${branch._id}`)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                        title="Edit Staff"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteStaff(member._id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        title="Remove Staff"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{member.fullName}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{member.username}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.5rem' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <MapPin size={12} color="#94a3b8" /> {member.address?.substring(0, 30)}...
                                    </p>
                                    <p style={{ color: '#0ea5e9', fontWeight: 500 }}>{member.phoneNumber}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                        <p>No staff members found for this branch.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BranchDetails;
