import { ArrowRight } from 'lucide-react';

export function Hero() {
  const scrollToPackages = () => {
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative text-center max-w-4xl mx-auto px-4">
        {/* Circular Icon/Logo Placeholder */}
        <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden shadow-2xl border-4 border-emerald-400">
          <img
            src="https://images.unsplash.com/photo-1597328488742-a83643eec6b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGxvZ298ZW58MXx8fHwxNzY3NjIyMjcyfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="LensArt Studio Logo"
            className="w-full h-full object-cover"
          />
        </div>
        
        <h1 className="text-5xl md:text-6xl text-emerald-900 mb-6">
          Welcome to LensArt Studio
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your trusted partner for professional wedding, portrait, and event photography
        </p>
        <button 
          onClick={scrollToPackages}
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-400 text-white rounded-lg hover:bg-emerald-500 transition-all transform hover:scale-105"
        >
          View Packages
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}