import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Services',  id: 'services'  },
  { label: 'About',     id: 'about'     },
  { label: 'Contact',   id: 'contact'   },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 32px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 13, fontWeight: 500, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#111',
          }}>
            Kay Tubillla
          </span>
        </Link>

        {/* Scroll nav — hidden on small screens */}
        <nav style={{ display: 'flex', gap: 32 }} className="hidden md:flex">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#444',
                cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#111')}
              onMouseLeave={e => (e.currentTarget.style.color = '#444')}
            >
              {label}
            </button>
          ))}
          <Link
            to="/service-area"
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 12, fontWeight: 400, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#444',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
          >
            Area
          </Link>
        </nav>

        {/* Right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/book" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#111', textDecoration: 'none',
          }}>
            Book
          </Link>
          <Link to="/editing" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#111', textDecoration: 'none',
          }}>
            Editing
          </Link>

          <div style={{ width: 1, height: 16, background: '#ddd' }} />

          {user ? (
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 18px',
                background: '#111', color: '#fff',
                border: 'none',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Log Out
            </button>
          ) : (
            <>
              <Link to="/login" style={{
                padding: '7px 16px',
                border: '1px solid #111', color: '#111',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}>
                Log In
              </Link>
              <Link to="/register" style={{
                padding: '8px 18px',
                background: '#111', color: '#fff',
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
