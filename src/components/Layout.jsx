import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../store/slices/authSlice';
import { Menu, X, LogOut, Home, User, Settings } from 'lucide-react';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await dispatch(signOut());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-emerald-600">CHAKULA FOODS</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg">
            <Home size={20} />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg">
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-emerald-50 rounded-lg">
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </nav>
      </aside>
      <main className="flex-1">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;