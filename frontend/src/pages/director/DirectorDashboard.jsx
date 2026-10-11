import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

const DirectorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" /></div>;

  const s = data?.stats || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Director Dashboard</h1>
        <p className="text-gray-500 mt-1">Review and approve expense vouchers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Approval" value={s.pending_approval || 0} icon="⏳" color="yellow" subtitle="Awaiting your review" />
        <StatCard label="Approved Today" value={s.approved_today || 0} icon="✅" color="green" />
        <StatCard label="Rejected Today" value={s.rejected_today || 0} icon="❌" color="red" />
        <StatCard label="Pending Amount" value={formatCurrency(s.total_pending_amount)} icon="💰" color="purple" subtitle="Total in queue" />
      </div>

      {s.pending_approval > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-yellow-900">{s.pending_approval} voucher{s.pending_approval > 1 ? 's' : ''} pending approval</p>
              <p className="text-sm text-yellow-700">Review and take action</p>
            </div>
          </div>
          <Link to="/director/pending" className="btn-primary text-sm bg-yellow-600 hover:bg-yellow-700">View Pending →</Link>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Voucher Activity</h2>
        {data?.recent?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No vouchers in the system yet.</p>
        ) : (
          <div className="space-y-2">
            {data?.recent?.map((v) => (
              <Link key={v.id} to={`/director/vouchers/${v.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-500">{v.employee_name} · {v.voucher_number}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{formatCurrency(v.amount)}</span>
                  <StatusBadge status={v.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;

