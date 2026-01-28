import { Camera, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const isHome = currentPage === 'home';
  
  const scrollToSection = (sectionId: string) => {
    if (!isHome) {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Camera className="w-8 h-8 text-emerald-400" />
            <span className="text-emerald-900">LensArt Studio</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {isHome ? (
              <>
                <button onClick={() => scrollToSection('products')} className="text-gray-700 hover:text-emerald-400 transition-colors">
                  Products
                </button>
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
              </>
            ) : (
              <button onClick={() => onNavigate('home')} className="text-gray-700 hover:text-emerald-400 transition-colors">
                Home
              </button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('basket')}
              className="p-2 text-gray-700 hover:text-emerald-400 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-emerald-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                0
              </span>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-colors"
            >
              <User className="w-4 h-4" />
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
