import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { fetchLocations } from '../services/locations';
import { useLoadScript } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';

const palette = {
  accent: '#fbb800',
  text: '#4a4a4a',
  textMuted: '#737373',
  bg: '#ffffff',
  bgAlt: '#ececec',
};

const mapCenter = { lat: 53.822, lng: 22.36 };
const containerStyle = { width: '100%', height: '78vh', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' };
const libraries = [];
const typeToEmoji = { stage: '🎤', hotel: '🏨', info: 'ℹ️', parade: '🪗', rehearsal: '🎼', attraction: '⭐' };

export default function MapPage() {
  const { t } = useTranslation();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [locations, setLocations] = useState([]);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await fetchLocations();
        if (!ignore) setLocations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!ignore) setErr(t('error_locations'));
      }
    })();
    return () => { ignore = true; };
  }, [t]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    try {
      if (locations.length > 0 && window.google?.maps) {
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach((loc) => bounds.extend({ lat: Number(loc.lat), lng: Number(loc.lng) }));
        map.fitBounds(bounds, 64);
      } else {
        map.setCenter(mapCenter);
        map.setZoom(13);
      }
    } catch {
      map.setCenter(mapCenter);
      map.setZoom(13);
    }
  }, [locations]);

  const onMapUnmount = useCallback(() => { mapRef.current = null; }, []);
  const markers = useMemo(() => locations.map((loc) => ({ ...loc, position: { lat: Number(loc.lat), lng: Number(loc.lng) } })), [locations]);

  if (loadError) {
    return <div style={{ padding: 24, color: 'crimson', fontFamily: 'Montserrat, sans-serif' }}>{t('error_locations')}</div>;
  }
  if (!isLoaded) {
    return <div style={{ padding: 24, fontFamily: 'Montserrat, sans-serif' }}>{t('loading')}</div>;
  }

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', padding: 16, background: palette.bgAlt, minHeight: 'calc(100vh - 120px)' }}>
      <h1 style={{ margin: '0 0 12px', color: palette.text }}>{t('map')}</h1>
      <p style={{ margin: '0 0 12px', color: palette.textMuted }}>{t('map_subtitle')}</p>
      {err && <div style={{ color: 'crimson', marginBottom: 8 }}>{err}</div>}

      <GoogleMap
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        mapContainerStyle={containerStyle}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy',
          styles: [
            { elementType: 'geometry', stylers: [{ saturation: -10 }] },
            { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            onClick={() => setSelected(m)}
            label={typeToEmoji[m.type] ? { text: typeToEmoji[m.type], fontSize: '16px' } : undefined}
            title={`${m.name} (${m.type})`}
          />
        ))}

        {selected && (
          <InfoWindow position={selected.position} onCloseClick={() => setSelected(null)}>
            <div style={{ maxWidth: 220 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: palette.text }}>{selected.name}</div>
              <div style={{ color: palette.textMuted, fontSize: 12, marginBottom: 6 }}>
                {t('type_label')}: {selected.type}
              </div>
              {selected.description && <div style={{ fontSize: 12, marginBottom: 8 }}>{selected.description}</div>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', background: palette.accent, color: '#000', padding: '6px 10px', borderRadius: 8, fontWeight: 700 }}
              >
                <i className="fa-solid fa-route" aria-hidden="true" />
                {t('show_route')}
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div style={{ height: 12 }} />
    </div>
  );
}
