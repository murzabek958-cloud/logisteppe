import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const settlements = [
  { name: "Ақтау", lat: 43.6519, lng: 51.1972 },
  { name: "Жаңаөзен", lat: 43.3333, lng: 52.8500 },
  { name: "Бейнеу", lat: 45.3167, lng: 55.1000 },
  { name: "Шетпе", lat: 44.1667, lng: 52.1333 },
  { name: "Үштаған", lat: 44.8333, lng: 53.6667 },
  { name: "Форт-Шевченко", lat: 44.5100, lng: 50.2600 },
  { name: "Мұнайлы", lat: 43.7167, lng: 52.1000 },
  { name: "Жетібай", lat: 43.5833, lng: 52.0833 }
];

const MapView = ({ orders = [], carriers = [], selectedRoute = null }) => {
  const getSettlement = (name) => settlements.find(s => s.name.toLowerCase() === name?.toLowerCase());

  return (
    <MapContainer center={[44.5, 52.5]} zoom={7} style={{ height: '450px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {settlements.map(s => (
        <Marker key={s.name} position={[s.lat, s.lng]}>
          <Popup><strong>{s.name}</strong></Popup>
        </Marker>
      ))}
      {selectedRoute && selectedRoute.origin && selectedRoute.destination && (() => {
        const from = getSettlement(selectedRoute.origin);
        const to = getSettlement(selectedRoute.destination);
        if (from && to) {
          return <Polyline positions={[[from.lat, from.lng], [to.lat, to.lng]]} color="blue" weight={4} opacity={0.8} />;
        }
        return null;
      })()}
    </MapContainer>
  );
};

export default MapView;
