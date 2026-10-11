import { useEffect, useState, useRef } from 'react';
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

const DirectorVoucherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
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

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setActionLoading('sig');
    setError('');
    try {
      await voucherApi.uploadSignature(id, 'director', file);
      setSuccess('Director signature uploaded!');
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleApprove = async () => {
    if (!voucher.director_signature_url) {
      setError('Please upload your signature before approving.');
      return;
    }
    if (!confirm('Approve this voucher?')) return;
    setActionLoading('approve');
    setError('');
    try {
      await voucherApi.approve(id);
      setSuccess('Voucher approved successfully!');
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required.');
      return;
    }
    setActionLoading('reject');
    setError('');
    try {
      await voucherApi.reject(id, rejectReason);
      setSuccess('Voucher rejected.');
      setShowRejectForm(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;
  if (!voucher) return <div className="card text-center py-12 text-red-500">{error || 'Voucher not found'}</div>;

  const isSubmitted = voucher.status === 'submitted';

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

        {/* Director action panel for submitted vouchers */}
        {isSubmitted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-yellow-900 mb-3">⚡ Action Required</p>

            {/* Signature upload */}
            <div className="mb-4">
              {voucher.director_signature_url ? (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Your Signature:</p>
                  <img src={voucher.director_signature_url} alt="Director Signature" className="h-16 border rounded-lg mb-2" />
                  <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                    Replace signature
                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  </label>
                </div>
              ) : (
                <label className={`btn-secondary text-sm cursor-pointer inline-flex ${actionLoading === 'sig' ? 'opacity-50 pointer-events-none' : ''}`}>
                  {actionLoading === 'sig' ? 'Uploading...' : '✍️ Upload Your Signature'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                </label>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleApprove} disabled={!voucher.director_signature_url || actionLoading === 'approve'} className="btn-success text-sm">
                {actionLoading === 'approve' ? 'Approving...' : '✅ Approve Voucher'}
              </button>
              <button onClick={() => { setShowRejectForm(!showRejectForm); setError(''); }} className="btn-danger text-sm">
                ❌ Reject Voucher
              </button>
            </div>

            {showRejectForm && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="label text-sm">Rejection Reason *</label>
                  <textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    className="input-field text-sm" placeholder="Provide a reason for rejection..." />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReject} disabled={actionLoading === 'reject'} className="btn-danger text-sm">
                    {actionLoading === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                  <button onClick={() => setShowRejectForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Basic Info */}
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
        {voucher.employee_signature_url && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-500 mb-2">Employee Signature</p>
            <img src={voucher.employee_signature_url} alt="Employee Signature" className="h-20 border rounded-lg" />
          </div>
        )}
      </div>

      {/* Approval Info */}
      {(voucher.status === 'approved' || voucher.status === 'rejected') && (
        <div className="card mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Approval Information</h2>
          <InfoRow label="Decision Date" value={formatDateTime(voucher.approval_date || voucher.updated_at)} />
          {voucher.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
              <p className="text-sm text-red-700">{voucher.rejection_reason}</p>
            </div>
          )}
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

export default DirectorVoucherDetail;

