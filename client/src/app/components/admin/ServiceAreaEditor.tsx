import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import type { PM } from '@geoman-io/leaflet-geoman-free';
import { api } from '../../lib/api';

interface Coordinate {
  lat: number;
  lng: number;
}

const OXFORD_CENTER: [number, number] = [51.7520, -1.2577];

// Inner component that has access to the Leaflet map instance
function PolygonEditor({
  initialPolygon,
  onSave,
}: {
  initialPolygon: Coordinate[];
  onSave: (polygon: Coordinate[]) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.Polygon | null>(null);

  useEffect(() => {
    // Enable Geoman controls
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      dragMode: true,
      cutPolygon: false,
      rotateMode: false,
      drawPolygon: true,
      editMode: true,
      removalMode: true,
    });

    // If there's an existing polygon, draw it on the map
    if (initialPolygon.length >= 3) {
      const latlngs = initialPolygon.map(p => L.latLng(p.lat, p.lng));
      const poly = L.polygon(latlngs, {
        color: '#111',
        fillColor: '#111',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map);
      layerRef.current = poly;

      // Enable editing on existing polygon immediately
      (poly as unknown as { pm: PM.PMLayer }).pm.enable();
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    }

    // Prevent creating more than one polygon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on('pm:create', (e: any) => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      const newPoly = e.layer as L.Polygon;
      layerRef.current = newPoly;
      newPoly.setStyle({ color: '#111', fillColor: '#111', fillOpacity: 0.12, weight: 2, dashArray: '6 4' });
      (newPoly as unknown as { pm: PM.PMLayer }).pm.enable();
      map.pm.disableDraw();
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map, initialPolygon]);

  const handleSave = () => {
    if (!layerRef.current) {
      onSave([]);
      return;
    }
    const latlngs = (layerRef.current.getLatLngs()[0] as L.LatLng[]);
    const coords: Coordinate[] = latlngs.map(ll => ({ lat: ll.lat, lng: ll.lng }));
    onSave(coords);
  };

  return (
    <button
      onClick={handleSave}
      style={{
        position: 'absolute', bottom: 16, right: 16, zIndex: 1000,
        padding: '12px 24px', background: '#111', color: '#fff',
        fontSize: 12, fontWeight: 700, letterSpacing: 2,
        textTransform: 'uppercase', border: 'none', cursor: 'pointer',
      }}
    >
      Save Zone
    </button>
  );
}

export function ServiceAreaEditor() {
  const [polygon, setPolygon] = useState<Coordinate[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<{ polygon: Coordinate[] }>('/service-area/')
      .then(data => setPolygon(data.polygon))
      .catch(() => setPolygon([]));
  }, []);

  const handleSave = async (coords: Coordinate[]) => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api.patch('/service-area/', { polygon: coords });
      setPolygon(coords);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Home Visit Zone</h2>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          Draw or edit the area where you offer home visits. Click the polygon tool (top-left)
          to draw a new zone by clicking to place each corner point — click the first point to
          close the shape. Drag any point to adjust. Click <strong>Save Zone</strong> when done.
        </p>
      </div>

      <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
        <MapContainer
          center={OXFORD_CENTER}
          zoom={12}
          style={{ height: 560, width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <PolygonEditor initialPolygon={polygon} onSave={handleSave} />
        </MapContainer>
      </div>

      <div style={{ marginTop: 12, minHeight: 24 }}>
        {saving && <p style={{ fontSize: 13, color: '#555' }}>Saving...</p>}
        {saved && <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Zone saved successfully</p>}
        {error && <p style={{ fontSize: 13, color: '#b91c1c' }}>{error}</p>}
        {polygon.length > 0 && !saving && !saved && (
          <p style={{ fontSize: 12, color: '#999' }}>{polygon.length} points in current zone</p>
        )}
      </div>
    </div>
  );
}
