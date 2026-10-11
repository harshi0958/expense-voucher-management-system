import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';

const LandingPage = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-50" />;
  if (user) return <Navigate to={`/${user.role}`} replace />;

  return (
    <main className="landing-page min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white">EV</span>
          ExpenseVMS
        </Link>
        <nav className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/employee/login" className="hidden text-sm font-semibold text-slate-700 hover:text-blue-700 sm:inline">Sign in</Link>
          <Link to="/employee/register" className="btn-primary px-4 py-2 text-sm">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> A clearer way to manage expenses
          </p>
          <h1 className="mt-7 max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
            Expense approvals, <span className="text-blue-700">without the guesswork.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Create vouchers, follow every approval, and give teams a dependable view of what happens next.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/employee/register" className="btn-primary px-5 py-3">Create employee account <span aria-hidden="true">→</span></Link>
            <Link to="/director/login" className="btn-secondary px-5 py-3">Director sign in</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-600">
            <span>✓ Email-verified access</span><span>✓ Role-based workflows</span><span>✓ Auditable decisions</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 blur-xl" />
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div><p className="text-sm font-semibold text-slate-900">Approval overview</p><p className="mt-1 text-xs text-slate-500">A workflow everyone can follow</p></div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Workflow preview</span>
            </div>
            <div className="grid grid-cols-3 gap-3 py-5">
              {[['Submitted', '12'], ['In review', '04'], ['Approved', '28']].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3 sm:p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                ['Travel expenses · Q3 review', 'Ready for director', 'bg-amber-100 text-amber-800'],
                ['Client workshop supplies', 'Approved', 'bg-emerald-100 text-emerald-800'],
                ['Regional team visit', 'Needs attention', 'bg-rose-100 text-rose-800'],
              ].map(([title, status, badge]) => (
                <div key={title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">Updated recently</p></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge}`}>{status}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-blue-700">✓</span>
              <p><strong>Every step is accountable.</strong><br /><span className="text-xs text-blue-800">From employee submission through director decision.</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-3">
          {[
            ['01', 'Submit with confidence', 'Capture expense details and signatures in one consistent voucher.'],
            ['02', 'Review with context', 'Directors see what needs attention and can record a clear decision.'],
            ['03', 'Stay in the loop', 'Role-specific dashboards keep teams aligned on status and next steps.'],
          ].map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-slate-100 p-6">
              <span className="text-sm font-bold text-blue-700">{number}</span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} ExpenseVMS</span>
        <div className="flex gap-5">
          <Link to="/employee/login" className="hover:text-blue-700">Employee</Link>
          <Link to="/director/login" className="hover:text-blue-700">Director</Link>
          <Link to="/admin/login" className="hover:text-blue-700">Admin</Link>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
