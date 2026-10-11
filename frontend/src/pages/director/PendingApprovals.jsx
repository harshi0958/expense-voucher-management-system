import { useEffect, useState } from 'react';
import { voucherApi } from '../../api';
import VoucherTable from '../../components/VoucherTable';

const PendingApprovals = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    voucherApi.list({ status: 'submitted' }).then((res) => setVouchers(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Submitted vouchers awaiting your review</p>
      </div>
      {!loading && vouchers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-500 font-medium">All caught up! No pending approvals.</p>
        </div>
      ) : (
        <VoucherTable vouchers={vouchers} basePath="/director/vouchers" loading={loading} />
      )}
    </div>
  );
};

export default PendingApprovals;

