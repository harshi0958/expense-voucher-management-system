import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voucherApi } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm font-medium text-gray-500 sm:w-44 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-900">{value || '-'}</span>
  </div>
);

const AccountsVoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    voucherApi.getById(id)
      .then((res) => setVoucher(res.data))
      .catch(() => setError('Voucher not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" /></div>;
  if (!voucher) return <div className="card text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
        <button onClick={handlePrint} className="btn-secondary text-sm">🖨️ Print / Download</button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold">ABC Company</h1>
        <h2 className="text-lg">Expense Reimbursement Voucher</h2>
      </div>

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{voucher.title}</h1>
            <p className="text-sm font-mono text-gray-400 mt-0.5">{voucher.voucher_number}</p>
          </div>
          <StatusBadge status={voucher.status} />
        </div>

        <InfoRow label="Voucher Date" value={formatDate(voucher.voucher_date)} />
        <InfoRow label="Expense Date" value={formatDate(voucher.expense_date)} />
        <InfoRow label="Department" value={voucher.department} />
        <InfoRow label="Category" value={voucher.category} />
        <InfoRow label="Amount" value={formatCurrency(voucher.amount)} />
        <InfoRow label="Description" value={voucher.description} />
      </div>

      {/* Employee Info */}
      <div className="card mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Employee Information</h2>
        <InfoRow label="Employee Name" value={voucher.employee_name} />
        <InfoRow label="Employee ID" value={voucher.employee_ref_id} />
        {voucher.employee_signature_url ? (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Employee Signature</p>
            <img src={voucher.employee_signature_url} alt="Employee Signature" className="h-20 border rounded-lg" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">No signature on file</p>
        )}
      </div>

      {/* Approval Info */}
      <div className="card mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Approval Information</h2>
        <InfoRow label="Status" value={<StatusBadge status={voucher.status} />} />
        <InfoRow label="Director" value={voucher.director_name} />
        {voucher.approval_date && <InfoRow label="Approval Date" value={formatDateTime(voucher.approval_date)} />}
        {voucher.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700">{voucher.rejection_reason}</p>
          </div>
        )}
        {voucher.director_signature_url ? (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Director Signature</p>
            <img src={voucher.director_signature_url} alt="Director Signature" className="h-20 border rounded-lg" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">No director signature yet</p>
        )}
      </div>

      {/* Audit */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Audit Information</h2>
        <InfoRow label="Created At" value={formatDateTime(voucher.created_at)} />
        <InfoRow label="Last Updated" value={formatDateTime(voucher.updated_at)} />
      </div>
    </div>
  );
};

export default AccountsVoucherDetail;

