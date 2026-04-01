import { useState } from 'react';
import { ServiceAreaMap } from '../components/ServiceAreaMap';
import { api } from '../lib/api';

interface CheckResult {
  postcode: string;
  is_within_zone: boolean;
}

export function ServiceAreaPage() {
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setChecking(true);
    try {
      const res = await api.post<CheckResult>('/service-area/check/', { postcode });
      setResult(res);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e.data?.error ?? 'Could not check postcode. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingTop: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 32px' }}>

        {/* Header */}
        <p style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>
          Service Area
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Home Visit Zone
        </h1>
        <div style={{ width: 40, height: 1, background: '#111', marginBottom: 20 }} />
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
          Kay is available for home sessions within the highlighted area around Oxford.
          Outside the zone, sessions take place at Kay's studio. Use the postcode checker below
          to find out which applies to you.
        </p>

        {/* Map */}
        <ServiceAreaMap />

        {/* Postcode checker */}
        <div style={{
          marginTop: 40, padding: '32px', background: '#f9f9f9',
          border: '1px solid #eee', borderRadius: 4,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            Check your postcode
          </h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
            Enter your postcode to see whether Kay can come to you.
          </p>
          <form onSubmit={handleCheck} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              placeholder="e.g. OX1 3DP"
              required
              style={{
                flex: 1, minWidth: 180, padding: '12px 14px',
                border: '1px solid #ddd', fontSize: 14,
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={checking}
              style={{
                padding: '12px 24px', background: checking ? '#555' : '#111',
                color: '#fff', fontSize: 12, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase',
                border: 'none', cursor: checking ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {checking ? 'Checking…' : 'Check'}
            </button>
          </form>

          {error && (
            <p style={{ marginTop: 14, fontSize: 13, color: '#b91c1c' }}>{error}</p>
          )}

          {result && (
            <div style={{
              marginTop: 16, padding: '16px 20px',
              background: result.is_within_zone ? '#f0fdf4' : '#fafafa',
              border: `1px solid ${result.is_within_zone ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 3,
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: result.is_within_zone ? '#15803d' : '#374151', marginBottom: 4 }}>
                {result.is_within_zone
                  ? '✓ Kay can come to you'
                  : 'Studio session required'}
              </p>
              <p style={{ fontSize: 13, color: '#666' }}>
                {result.is_within_zone
                  ? `${result.postcode} is within Kay's home visit zone. You can book a session at your location.`
                  : `${result.postcode} is outside Kay's travel zone. Sessions at this postcode take place at Kay's Oxford studio.`}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
