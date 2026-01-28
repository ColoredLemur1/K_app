import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { Portfolio } from './components/Portfolio';
import { Packages } from './components/Packages';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Basket } from './components/Basket';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'basket'>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'home' | 'login' | 'basket');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} />;
  }

  if (currentPage === 'basket') {
    return (
      <>
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        <div className="pt-16">
          <Basket onNavigate={handleNavigate} />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="pt-16">
        <Hero />
        <Products />
        <Portfolio />
        <Packages />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
