import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate, formatCurrency } from '../utils/format';

const VoucherTable = ({ vouchers, basePath, loading }) => {
  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!vouchers?.length) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 text-lg">📭 No vouchers found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Voucher #</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{v.voucher_number}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{v.title}</td>
                <td className="px-4 py-3 text-gray-600">{v.employee_name}</td>
                <td className="px-4 py-3 text-gray-600">{v.department}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(v.amount)}</td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 text-gray-500">{formatDate(v.expense_date)}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`${basePath}/${v.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoucherTable;

