import { useEffect, useState } from 'react';
import { voucherApi } from '../../api';
import VoucherTable from '../../components/VoucherTable';
import FilterBar from '../../components/FilterBar';

const MyVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchVouchers = async (f) => {
    setLoading(true);
    try {
      const res = await voucherApi.list(f);
      setVouchers(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers(filters);
  }, [filters]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Vouchers</h1>
        <p className="text-gray-500 text-sm mt-1">All vouchers you have created</p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} showEmployeeFilter={false} />
      <VoucherTable vouchers={vouchers} basePath="/employee/vouchers" loading={loading} />
    </div>
  );
};

export default MyVouchers;

