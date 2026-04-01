import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { AuthUser } from '../context/AuthContext';

interface RegisterResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field: keyof typeof form) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<RegisterResponse>('/auth/register/', form);
      login(res.access, res.refresh, res.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #ddd', fontSize: 14,
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11,
    letterSpacing: 1, textTransform: 'uppercase',
    color: '#555', marginBottom: 6,
  };

  const fields: { field: keyof typeof form; label: string; type: string; autocomplete: string }[] = [
    { field: 'first_name', label: 'First name',  type: 'text',     autocomplete: 'given-name' },
    { field: 'last_name',  label: 'Last name',   type: 'text',     autocomplete: 'family-name' },
    { field: 'email',      label: 'Email',        type: 'email',    autocomplete: 'email' },
    { field: 'password',   label: 'Password',     type: 'password', autocomplete: 'new-password' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '48px 32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.5px', marginBottom: 8 }}>Create account</h1>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Kay Tubillla Photography</p>

        <form onSubmit={handleSubmit}>
          {fields.map(({ field, label, type, autocomplete }) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type} value={form[field]} required
                autoComplete={autocomplete}
                onChange={set(field)} style={inputStyle}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14, marginTop: 8,
              background: loading ? '#555' : '#111', color: '#fff',
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', border: 'none', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p style={{ fontSize: 13, color: '#888', marginTop: 24, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#111', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
