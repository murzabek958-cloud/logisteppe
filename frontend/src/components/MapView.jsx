import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

// Маршрут өзгерсе картаны автоматты зумдайды
const RouteController = ({ from, to }) => {
  const map = useMap();
  useEffect(() => {
    if (from && to) {
      const bounds = L.latLngBounds([[from.lat, from.lng], [to.lat, to.lng]]);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [from, to, map]);
  return null;
};

const getSettlement = (name) =>
  settlements.find(s => s.name.toLowerCase() === name?.toLowerCase());

const MapView = ({ orders = [], carriers = [], selectedRoute = null }) => {
  const from = selectedRoute?.origin ? getSettlement(selectedRoute.origin) : null;
  const to = selectedRoute?.destination ? getSettlement(selectedRoute.destination) : null;

  // key — маршрут өзгерген сайын Polyline-ды толық қайта салады
  const routeKey = selectedRoute
    ? `${selectedRoute.origin}-${selectedRoute.destination}-${Date.now()}`
    : 'no-route';

  return (
    <MapContainer center={[44.5, 52.5]} zoom={7} style={{ height: '450px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Елді мекендер маркерлері */}
      {settlements.map(s => (
        <Marker key={s.name} position={[s.lat, s.lng]}>
          <Popup><strong>{s.name}</strong></Popup>
        </Marker>
      ))}

      {/* Маршрут сызығы — key арқылы жаңа маршрутта толық қайта жасалады */}
      {from && to && (
        <>
          <Polyline
            key={routeKey}
            positions={[[from.lat, from.lng], [to.lat, to.lng]]}
            color="blue"
            weight={5}
            opacity={0.85}
          />
          {/* Зум автоматты маршрутқа бейімделеді */}
          <RouteController from={from} to={to} />
        </>
      )}
    </MapContainer>
  );
};

export default MapView;
      
