import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 text-white p-2 rounded-xl font-bold shadow-md shadow-blue-600/20">
          EV
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Expense Voucher System</h1>
          <p className="text-xs text-slate-500">Automated Enterprise Workflow</p>
        </div>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full">
            <div className="bg-slate-200 p-1.5 rounded-full text-slate-700">
              <UserIcon size={14} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-slate-800">{user.name}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user.department}</span>
            </div>
            <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
              {user.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl text-xs font-semibold transition border border-rose-100"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;