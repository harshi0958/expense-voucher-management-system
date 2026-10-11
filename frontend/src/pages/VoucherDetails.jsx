import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';

const VoucherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const { data } = await API.get('/vouchers');
        const found = data.find((v) => v._id === id);
        setVoucher(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [id]);

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!voucher) return <div className="text-center p-10 text-red-600">Voucher not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-blue-600 font-medium hover:underline text-sm"
        >
          ← Back to Dashboard
        </button>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Voucher: {voucher.voucherNumber}</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                voucher.status === 'Approved'
                  ? 'bg-green-100 text-green-700'
                  : voucher.status === 'Rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {voucher.status}
            </span>
          </div>

          <div className="space-y-4 mb-6 text-sm text-gray-700">
            <p><span className="font-semibold">Employee Name:</span> {voucher.employee?.name}</p>
            <p><span className="font-semibold">Department:</span> {voucher.employee?.department}</p>
            <p><span className="font-semibold">Total Amount:</span> ₹{voucher.totalAmount}</p>
            {voucher.rejectionReason && (
              <p className="text-red-600"><span className="font-semibold">Rejection Reason:</span> {voucher.rejectionReason}</p>
            )}
          </div>

          <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            {voucher.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.description} ({item.category})</span>
                <span className="font-semibold">₹{item.amount}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {voucher.employeeSignature && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Employee Signature</p>
                <img src={`http://localhost:5000/${voucher.employeeSignature}`} alt="Employee Sig" className="h-20 border rounded" />
              </div>
            )}
            {voucher.directorSignature && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Director Signature</p>
                <img src={`http://localhost:5000/${voucher.directorSignature}`} alt="Director Sig" className="h-20 border rounded" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetails;