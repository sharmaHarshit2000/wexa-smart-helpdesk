import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        {/* Logo / Home */}
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
          SupportDesk
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated && (
            <>
              <Link to="/tickets" className="text-gray-700 hover:text-blue-600">
                Tickets
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/kb" className="text-gray-700 hover:text-blue-600">
                  Knowledge Base
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <span className="text-gray-600 text-sm">
                Welcome, <span className="font-medium">{user.name}</span> ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-blue-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 flex flex-col space-y-3">
          {isAuthenticated && (
            <>
              <Link to="/tickets" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                Tickets
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/kb" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                  Knowledge Base
                </Link>
              )}
              <span className="text-gray-600 text-sm">
                Welcome, <span className="font-medium">{user.name}</span> ({user.role})
              </span>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
