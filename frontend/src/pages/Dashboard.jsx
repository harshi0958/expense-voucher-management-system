import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  FileText, Clock, CheckCircle2, XCircle, Plus, Search, 
  Filter, ArrowUpRight, Eye, AlertCircle, Check, X 
} from 'lucide-react';

const Dashboard = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [directorSignature, setDirectorSignature] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = vouchers;
    if (statusFilter !== 'All') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(v => 
        v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVouchers(result);
  }, [searchTerm, statusFilter, vouchers]);

  const fetchData = async () => {
    try {
      const vRes = await API.get('/vouchers');
      setVouchers(vRes.data);
      setFilteredVouchers(vRes.data);
      const sRes = await API.get('/vouchers/stats');
      setStats(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const formData = new FormData();
      formData.append('status', status);
      if (status === 'Rejected') {
        if (!rejectionReason) {
          alert('Please provide a rejection reason.');
          return;
        }
        formData.append('rejectionReason', rejectionReason);
      }
      if (status === 'Approved') {
        if (!directorSignature) {
          alert('Director signature image is required for approval.');
          return;
        }
        formData.append('signature', directorSignature);
      }

      await API.put(`/vouchers/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedVoucher(null);
      setRejectionReason('');
      setDirectorSignature(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* Welcome Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
              <p className="text-sm text-slate-500 mt-0.5">Manage and track your corporate expense reimbursement life-cycle.</p>
            </div>
            {user.role === 'Employee' && (
              <Link
                to="/create-voucher"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>Create New Voucher</span>
              </Link>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vouchers</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.total}</h3>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
                <FileText size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Pending Approval</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</h3>
              </div>
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl">
                <Clock size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Approved</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.approved}</h3>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Rejected</p>
                <h3 className="text-3xl font-black text-rose-600 mt-1">{stats.rejected}</h3>
              </div>
              <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl">
                <XCircle size={22} />
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by Voucher # or Employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
                    <th className="p-4.5">Voucher Number</th>
                    {user.role !== 'Employee' && <th className="p-4.5">Employee Name</th>}
                    <th className="p-4.5">Total Amount</th>
                    <th className="p-4.5">Status</th>
                    <th className="p-4.5">Created Date</th>
                    <th className="p-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVouchers.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4.5 font-bold text-slate-800">{v.voucherNumber}</td>
                      {user.role !== 'Employee' && (
                        <td className="p-4.5 text-slate-600 font-medium">
                          {v.employee?.name} <span className="text-xs text-slate-400 block font-normal">{v.employee?.department}</span>
                        </td>
                      )}
                      <td className="p-4.5 text-slate-900 font-extrabold">₹{v.totalAmount.toLocaleString()}</td>
                      <td className="p-4.5">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            v.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : v.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : v.status === 'Pending Approval'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4.5 text-slate-500 text-xs font-medium">{new Date(v.createdAt).toLocaleDateString()}</td>
                      <td className="p-4.5 text-right">
                        <button
                          onClick={() => setSelectedVoucher(v)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">
                        No vouchers found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for Details & Approval Workflow */}
          {selectedVoucher && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Voucher Details</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedVoucher.voucherNumber}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedVoucher(null)} 
                    className="bg-slate-100 text-slate-500 hover:bg-slate-200 p-2 rounded-full font-bold transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Current Status</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 inline-block">{selectedVoucher.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Total Claim Amount</span>
                    <span className="font-extrabold text-blue-600 text-sm mt-0.5 inline-block">₹{selectedVoucher.totalAmount.toLocaleString()}</span>
                  </div>
                  {selectedVoucher.rejectionReason && (
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-rose-500 block font-semibold">Rejection Reason</span>
                      <span className="text-slate-700 font-medium mt-0.5 inline-block">{selectedVoucher.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-sm mb-3">Itemized Expense Breakdown</h4>
                <div className="space-y-2 mb-6">
                  {selectedVoucher.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.description}</p>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">{item.category}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedVoucher.employeeSignature && (
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-xs font-bold text-slate-600 mb-2">Employee Signature</p>
                      <img src={`http://localhost:5000/${selectedVoucher.employeeSignature}`} alt="Employee Signature" className="h-16 object-contain bg-white border border-slate-200 rounded p-1 w-full" />
                    </div>
                  )}
                  {selectedVoucher.directorSignature && (
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                      <p className="text-xs font-bold text-slate-600 mb-2">Director Signature</p>
                      <img src={`http://localhost:5000/${selectedVoucher.directorSignature}`} alt="Director Signature" className="h-16 object-contain bg-white border border-slate-200 rounded p-1 w-full" />
                    </div>
                  )}
                </div>

                {/* Director Approval / Rejection Controls */}
                {user.role === 'Director' && selectedVoucher.status === 'Pending Approval' && (
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Director Approval Workflow</h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Director Signature (Mandatory for Approval)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDirectorSignature(e.target.files[0])}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-slate-200 rounded-xl p-1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Rejection Reason (Mandatory if Rejecting)</label>
                      <input
                        type="text"
                        placeholder="Provide detailed reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => handleAction(selectedVoucher._id, 'Approved')}
                        className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition"
                      >
                        <Check size={18} />
                        <span>Approve Voucher</span>
                      </button>
                      <button
                        onClick={() => handleAction(selectedVoucher._id, 'Rejected')}
                        className="flex-1 flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-600/20 transition"
                      >
                        <X size={18} />
                        <span>Reject Voucher</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;