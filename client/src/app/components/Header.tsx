import { Link, useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Camera className="w-8 h-8 text-emerald-400" />
            <span className="text-emerald-900">Kay Tubilla Photography</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection('portfolio')} className="text-gray-700 hover:text-emerald-400 transition-colors">
              Portfolio
            </button>
            <button onClick={() => scrollToSection('packages')} className="text-gray-700 hover:text-emerald-400 transition-colors">
              Packages
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-emerald-400 transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-emerald-400 transition-colors">
              Contact
            </button>
            <Link to="/service-area" className="text-gray-700 hover:text-emerald-400 transition-colors">
              Service Area
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm"
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-4 py-2 text-emerald-700 border border-emerald-400 rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors text-sm"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
