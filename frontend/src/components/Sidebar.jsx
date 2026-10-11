import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, FileText, ShieldCheck, Layers } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col shadow-xl">
      <div className="mb-6 px-3 pt-2">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Workspace</p>
        <p className="text-sm font-medium text-white truncate">{user?.department || 'Enterprise'} Dept</p>
      </div>

      <div className="space-y-1.5 flex-1">
        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive('/dashboard') 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Overview Dashboard</span>
        </Link>

        {user?.role === 'Employee' && (
          <Link
            to="/create-voucher"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive('/create-voucher') 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle size={18} />
            <span>New Expense Voucher</span>
          </Link>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 px-3">
        <p>MCA Final Year Project</p>
        <p className="font-semibold text-slate-400 mt-0.5">PSPL Full Stack v2.4</p>
      </div>
    </aside>
  );
};

export default Sidebar;