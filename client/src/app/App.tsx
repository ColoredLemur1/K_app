import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Packages } from './components/Packages';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ServiceAreaPage } from './pages/ServiceAreaPage';
import { ServiceAreaEditor } from './components/admin/ServiceAreaEditor';

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Packages />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

// Placeholder pages — replaced in later plans
function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 14, color: '#888' }}>{label} — coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/service-area" element={<ServiceAreaPage />} />

          {/* Customer (login required) */}
          <Route path="/book"      element={<ProtectedRoute><ComingSoon label="Book a Session" /></ProtectedRoute>} />
          <Route path="/editing"   element={<ProtectedRoute><ComingSoon label="Photo Editing" /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ComingSoon label="Dashboard" /></ProtectedRoute>} />
          <Route path="/messages"  element={<ProtectedRoute><ComingSoon label="Messages" /></ProtectedRoute>} />

          {/* Admin routes (Kay only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireStaff>
              <ComingSoon label="Admin Dashboard" />
            </ProtectedRoute>
          } />
          <Route path="/admin/service-area" element={
            <ProtectedRoute requireStaff>
              <div style={{ padding: '80px 48px' }}>
                <ServiceAreaEditor />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/admin/*" element={
            <ProtectedRoute requireStaff>
              <ComingSoon label="Admin" />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
