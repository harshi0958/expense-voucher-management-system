import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voucherApi } from '../../api';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm font-medium text-gray-500 sm:w-44 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-900">{value || '-'}</span>
  </div>
);

const EmployeeVoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const sigRef = useRef();

  const fetch = async () => {
    try {
      const res = await voucherApi.getById(id);
      setVoucher(res.data);
    } catch {
      setError('Voucher not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this draft voucher?')) return;
    setActionLoading('delete');
    try {
      await voucherApi.delete(id);
      navigate('/employee/vouchers');
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleSubmit = async () => {
    setActionLoading('submit');
    setError('');
    try {
      await voucherApi.submit(id);
      setSuccess('Voucher submitted for approval!');
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Submit failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading('sig');
    setError('');
    try {
      await voucherApi.uploadSignature(id, 'employee', file);
      setSuccess('Signature uploaded!');
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!voucher) return <div className="card text-center py-12 text-red-500">{error || 'Voucher not found'}</div>;

  const isDraft = voucher.status === 'draft';

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm mb-4">← Back</button>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{voucher.title}</h1>
            <p className="text-sm font-mono text-gray-400 mt-0.5">{voucher.voucher_number}</p>
          </div>
          <StatusBadge status={voucher.status} />
        </div>

        {/* Rejection reason */}
        {voucher.status === 'rejected' && voucher.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700 mt-1">{voucher.rejection_reason}</p>
          </div>
        )}

        {/* Actions for draft */}
        {isDraft && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
            <Link to={`/employee/vouchers/${id}/edit`} className="btn-secondary text-sm">✏️ Edit</Link>
            <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="btn-danger text-sm">
              {actionLoading === 'delete' ? 'Deleting...' : '🗑️ Delete'}
            </button>
            <label className={`btn-secondary text-sm cursor-pointer ${actionLoading === 'sig' ? 'opacity-50' : ''}`}>
              {actionLoading === 'sig' ? 'Uploading...' : '✍️ Upload Signature'}
              <input type="file" ref={sigRef} accept="image/*" className="hidden" onChange={handleSignatureUpload} />
            </label>
            {voucher.employee_signature_url && (
              <button onClick={handleSubmit} disabled={actionLoading === 'submit'} className="btn-primary text-sm">
                {actionLoading === 'submit' ? 'Submitting...' : '📤 Submit for Approval'}
              </button>
            )}
          </div>
        )}

        {/* Basic Info */}
        <div>
          <InfoRow label="Voucher Date" value={formatDate(voucher.voucher_date)} />
          <InfoRow label="Expense Date" value={formatDate(voucher.expense_date)} />
          <InfoRow label="Department" value={voucher.department} />
          <InfoRow label="Category" value={voucher.category} />
          <InfoRow label="Amount" value={formatCurrency(voucher.amount)} />
          <InfoRow label="Description" value={voucher.description} />
        </div>
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
          <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
            ⚠️ Signature required before submission
          </div>
        )}
      </div>

      {/* Approval Info */}
      {(voucher.status === 'approved' || voucher.status === 'rejected') && (
        <div className="card mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Approval Information</h2>
          <InfoRow label="Director" value={voucher.director_name} />
          <InfoRow label="Decision Date" value={formatDateTime(voucher.approval_date || voucher.updated_at)} />
          {voucher.director_signature_url && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-500 mb-2">Director Signature</p>
              <img src={voucher.director_signature_url} alt="Director Signature" className="h-20 border rounded-lg" />
            </div>
          )}
        </div>
      )}

      {/* Audit */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Audit Information</h2>
        <InfoRow label="Created At" value={formatDateTime(voucher.created_at)} />
        <InfoRow label="Last Updated" value={formatDateTime(voucher.updated_at)} />
      </div>
    </div>
  );
};

export default EmployeeVoucherDetail;

