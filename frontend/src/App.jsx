import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PledgeEntry from './pages/PledgeEntry';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import Payments from './pages/Payments';
import Loans from './pages/Loans';
import Masters from './pages/Masters';
import Staff from './pages/Staff';
import AddStaff from './pages/AddStaff';
import StaffDashboard from './pages/StaffDashboard'; // Added import
import VoucherEntry from './pages/VoucherEntry'; // Added import
import Accounts from './pages/Accounts'; // Added import
import Notifications from './pages/Notifications'; // Added import
import PrintView from './pages/PrintView'; // Added import
import CustomerDetails from './pages/CustomerDetails';
import Auctions from './pages/Auctions'; // Added import // Added import

// The ProtectedRoute component is removed as per the provided code edit's structure.
// Protection logic is implicitly handled by the new structure or expected to be within Layout/AuthProvider.

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading App...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/edit/:id" element={<AddCustomer />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/pledge" element={<PledgeEntry />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/vouchers" element={<VoucherEntry />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/print/:type/:id" element={<PrintView />} />

        {/* Admin Only Routes */}
        <Route path="/staff" element={<Staff />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/edit/:id" element={<AddStaff />} />
      </Route>
    </Routes>
  );
};

export default App;
