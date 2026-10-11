import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = {
  employee: [
    { to: '/employee', label: '📊 Dashboard' },
    { to: '/employee/vouchers/new', label: '➕ New Voucher' },
    { to: '/employee/vouchers', label: '📄 My Vouchers' },
  ],
  director: [
    { to: '/director', label: '📊 Dashboard' },
    { to: '/director/pending', label: '⏳ Pending Approvals' },
    { to: '/director/vouchers', label: '📋 All Vouchers' },
  ],
  accounts: [
    { to: '/accounts', label: '📊 Dashboard' },
    { to: '/accounts/vouchers', label: '📋 All Vouchers' },
  ],
  admin: [
    { to: '/admin', label: '🛡️ Access requests' },
  ],
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = NAV_LINKS[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const ROLE_COLORS = {
    employee: 'bg-blue-700',
    director: 'bg-purple-700',
    accounts: 'bg-teal-700',
    admin: 'bg-slate-900',
  };

  const headerColor = ROLE_COLORS[user?.role] || 'bg-blue-700';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className={`${headerColor} text-white shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold tracking-tight">💰 ExpenseVMS</span>
              <span className="text-sm opacity-75 hidden sm:block capitalize border-l border-white/30 pl-4">
                {user?.role === 'accounts' ? 'Accounts Team' : user?.role} Portal
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm hidden md:block opacity-90">{user?.name}</span>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${location.pathname === link.to ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 hidden md:flex flex-col py-6">
          <nav className="flex-1 px-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.to
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
