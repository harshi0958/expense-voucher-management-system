import { useCallback, useEffect, useState } from 'react';
import { authApi, dashboardApi } from '../../api';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [directors, dashboard] = await Promise.all([authApi.pendingDirectors(), dashboardApi.get()]);
      setPending(directors.data);
      setCount(Number(dashboard.data.stats.pending_directors || 0));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load Admin overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const authorizeDirector = async (id) => {
    setBusyId(id);
    setError('');
    setNotice('');
    try {
      await authApi.approveDirector(id);
      setNotice('Director access authorized.');
      await load();
    } catch (approveError) {
      setError(approveError.response?.data?.message || 'Could not authorize this account.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">Administration</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Admin overview</h1>
        <p className="mt-1 text-gray-500">Manage access to the Director approval role.</p>
      </header>
      <div className="max-w-sm"><StatCard label="Director accounts awaiting authorization" value={count} icon="🛡️" color="purple" /></div>
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
      <section className="card overflow-hidden p-0">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-semibold text-gray-900">Pending Director requests</h2>
          <p className="mt-1 text-sm text-gray-500">Email-verified candidates cannot approve vouchers until authorized here.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-14" aria-label="Loading Director requests"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : pending.length === 0 ? (
          <div className="px-6 py-12 text-center"><p className="text-lg font-semibold text-gray-800">No requests need review</p><p className="mt-1 text-sm text-gray-500">New verified Director registrations will appear here.</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((director) => (
              <div key={director.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold text-gray-900">{director.name}</p><p className="mt-1 text-sm text-gray-500">{director.email}{director.employee_id ? ` · ${director.employee_id}` : ''}</p></div>
                <button type="button" onClick={() => authorizeDirector(director.id)} disabled={busyId === director.id} className="btn-primary">
                  {busyId === director.id ? 'Authorizing…' : 'Authorize Director'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
