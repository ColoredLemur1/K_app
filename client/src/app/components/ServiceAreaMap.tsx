import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet';
import { api } from '../lib/api';

interface Coordinate {
  lat: number;
  lng: number;
}

// react-leaflet expects [lat, lng] tuples
type LatLngTuple = [number, number];

const OXFORD_CENTER: LatLngTuple = [51.7520, -1.2577];

export function ServiceAreaMap() {
  const [polygon, setPolygon] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ polygon: Coordinate[] }>('/service-area/')
      .then(data => setPolygon(data.polygon))
      .catch(() => setPolygon([]))
      .finally(() => setLoading(false));
  }, []);

  const positions: LatLngTuple[] = polygon.map(p => [p.lat, p.lng]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, fontSize: 13, color: '#888', letterSpacing: 1,
        }}>
          Loading map…
        </div>
      )}
      <MapContainer
        center={OXFORD_CENTER}
        zoom={12}
        style={{ height: 480, width: '100%', borderRadius: 4 }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positions.length >= 3 && (
          <Polygon
            positions={positions}
            pathOptions={{
              color: '#111',
              fillColor: '#111',
              fillOpacity: 0.12,
              weight: 2,
              dashArray: '6 4',
            }}
          >
            <Tooltip sticky>Kay's home visit zone</Tooltip>
          </Polygon>
        )}

        {positions.length < 3 && !loading && (
          // Render nothing — zone not yet configured by Kay
          null
        )}
      </MapContainer>

      <div style={{
        marginTop: 12, fontSize: 12, color: '#777',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          display: 'inline-block', width: 16, height: 16,
          background: 'rgba(0,0,0,0.12)', border: '2px dashed #111',
          borderRadius: 2, flexShrink: 0,
        }} />
        {positions.length >= 3
          ? 'Shaded area: Kay can come to you for your session'
          : 'Service area not yet configured — check back soon'}
      </div>
    </div>
  );
}
