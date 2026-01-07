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
import StaffDashboard from './pages/StaffDashboard';
import VoucherEntry from './pages/VoucherEntry';
import Accounts from './pages/Accounts';
import Notifications from './pages/Notifications';
import PrintView from './pages/PrintView';
import CustomerDetails from './pages/CustomerDetails';
import Auctions from './pages/Auctions';


import Contact from './pages/Contact';
import About from './pages/About';
import Branches from './pages/Branches';
import BranchDetails from './pages/BranchDetails';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading App...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
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
        <Route path="/staff" element={<Staff />} />
        <Route path="/staff/add" element={<AddStaff />} />
        <Route path="/staff/edit/:id" element={<AddStaff />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/branches/:id" element={<BranchDetails />} />
      </Route>
    </Routes>
  );
};

export default App;
