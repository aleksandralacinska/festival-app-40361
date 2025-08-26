import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Ełk
const center = { lat: 53.8286, lng: 22.3647 };

export default function MapPage(){
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  return (
    <>
      <h2>Mapa</h2>
      <div style={{ height: 400 }} className="card">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width:'100%', height:'100%' }}
            center={center}
            zoom={13}
            options={{ disableDefaultUI: true }}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : <p>Ładowanie mapy...</p>}
      </div>
    </>
  );
}
