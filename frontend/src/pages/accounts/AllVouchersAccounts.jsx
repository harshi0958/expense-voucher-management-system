import { useEffect, useState } from 'react';
import { voucherApi } from '../../api';
import VoucherTable from '../../components/VoucherTable';
import FilterBar from '../../components/FilterBar';

const AllVouchersAccounts = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    voucherApi.list(filters).then((res) => setVouchers(res.data.data)).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Vouchers</h1>
        <p className="text-gray-500 text-sm mt-1">Full voucher repository for reimbursement monitoring</p>
      </div>
      <FilterBar filters={filters} onChange={setFilters} />
      <VoucherTable vouchers={vouchers} basePath="/accounts/vouchers" loading={loading} />
    </div>
  );
};

export default AllVouchersAccounts;

