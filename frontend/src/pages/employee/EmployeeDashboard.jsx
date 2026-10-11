import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  }

  const s = data?.stats || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your expense vouchers</p>
        </div>
        <Link to="/employee/vouchers/new" className="btn-primary">+ New Voucher</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Vouchers" value={s.total || 0} icon="📄" color="blue" />
        <StatCard label="Draft" value={s.draft || 0} icon="📝" color="gray" />
        <StatCard label="Pending Approval" value={s.pending || 0} icon="⏳" color="yellow" />
        <StatCard label="Approved" value={s.approved || 0} icon="✅" color="green" />
        <StatCard label="Rejected" value={s.rejected || 0} icon="❌" color="red" />
        <StatCard label="Total Claimed" value={formatCurrency(s.total_claimed)} icon="💵" color="purple" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Vouchers</h2>
        {data?.recent?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No vouchers yet. <Link to="/employee/vouchers/new" className="text-blue-600">Create your first voucher →</Link></p>
        ) : (
          <div className="space-y-3">
            {data?.recent?.map((v) => (
              <Link key={v.id} to={`/employee/vouchers/${v.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-500 font-mono">{v.voucher_number} · {formatDate(v.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCurrency(v.amount)}</span>
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

export default EmployeeDashboard;

