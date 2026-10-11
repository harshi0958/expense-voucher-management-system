import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/auth/LandingPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateVoucher from './pages/employee/CreateVoucher';
import MyVouchers from './pages/employee/MyVouchers';
import EmployeeVoucherDetail from './pages/employee/EmployeeVoucherDetail';
import EditVoucher from './pages/employee/EditVoucher';

// Director
import DirectorDashboard from './pages/director/DirectorDashboard';
import PendingApprovals from './pages/director/PendingApprovals';
import AllVouchersDirector from './pages/director/AllVouchersDirector';
import DirectorVoucherDetail from './pages/director/DirectorVoucherDetail';

// Accounts
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import AllVouchersAccounts from './pages/accounts/AllVouchersAccounts';
import AccountsVoucherDetail from './pages/accounts/AccountsVoucherDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Navigate to="/employee/login" replace />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/employee/login" element={<Login role="employee" />} />
          <Route path="/employee/register" element={<Register role="employee" />} />
          <Route path="/director/login" element={<Login role="director" />} />
          <Route path="/director/register" element={<Register role="director" />} />
          <Route path="/accounts/login" element={<Login role="accounts" />} />
          <Route path="/admin/login" element={<Login role="admin" />} />

          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute roles={['employee']}>
              <Layout><EmployeeDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/vouchers" element={
            <ProtectedRoute roles={['employee']}>
              <Layout><MyVouchers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/vouchers/new" element={
            <ProtectedRoute roles={['employee']}>
              <Layout><CreateVoucher /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/vouchers/:id" element={
            <ProtectedRoute roles={['employee']}>
              <Layout><EmployeeVoucherDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/vouchers/:id/edit" element={
            <ProtectedRoute roles={['employee']}>
              <Layout><EditVoucher /></Layout>
            </ProtectedRoute>
          } />

          {/* Director Routes */}
          <Route path="/director" element={
            <ProtectedRoute roles={['director']}>
              <Layout><DirectorDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/director/pending" element={
            <ProtectedRoute roles={['director']}>
              <Layout><PendingApprovals /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/director/vouchers" element={
            <ProtectedRoute roles={['director']}>
              <Layout><AllVouchersDirector /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/director/vouchers/:id" element={
            <ProtectedRoute roles={['director']}>
              <Layout><DirectorVoucherDetail /></Layout>
            </ProtectedRoute>
          } />

          {/* Accounts Routes */}
          <Route path="/accounts" element={
            <ProtectedRoute roles={['accounts']}>
              <Layout><AccountsDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/accounts/vouchers" element={
            <ProtectedRoute roles={['accounts']}>
              <Layout><AllVouchersAccounts /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/accounts/vouchers/:id" element={
            <ProtectedRoute roles={['accounts']}>
              <Layout><AccountsVoucherDetail /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin: Director account authorization only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
