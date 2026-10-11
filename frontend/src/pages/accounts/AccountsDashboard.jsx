import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api';
import StatCard from '../../components/StatCard';
import { formatCurrency, formatDateTime } from '../../utils/format';

const AccountsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" /></div>;

  const s = data?.stats || {};

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor all expense vouchers for reimbursement</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Vouchers" value={s.total || 0} icon="📄" color="blue" />
        <StatCard label="Pending Approval" value={s.pending_approval || 0} icon="⏳" color="yellow" />
        <StatCard label="Approved" value={s.approved || 0} icon="✅" color="green" />
        <StatCard label="Rejected" value={s.rejected || 0} icon="❌" color="red" />
        <StatCard label="Total Approved Amount" value={formatCurrency(s.total_approved_amount)} icon="💵" color="purple" subtitle="Ready for reimbursement" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Approved Vouchers</h2>
        {data?.recent_approved?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No approved vouchers yet.</p>
        ) : (
          <div className="space-y-2">
            {data?.recent_approved?.map((v) => (
              <Link key={v.id} to={`/accounts/vouchers/${v.id}`}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{v.title}</p>
                  <p className="text-xs text-gray-500">{v.employee_name} · {v.voucher_number}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-700">{formatCurrency(v.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(v.approval_date)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link to="/accounts/vouchers" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View all vouchers →</Link>
        </div>
      </div>
    </div>
  );
};

export default AccountsDashboard;

