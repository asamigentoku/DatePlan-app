import L from 'leaflet';
import { useEffect } from 'react';
import { View } from 'react-native';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import { PIN_ANCHOR, PIN_HEIGHT, PIN_WIDTH, pinSvgMarkup } from './mapPin';
import type { RouteSpot } from './PlanRouteMap';

function pinIcon(color: string, emoji: string) {
  return L.divIcon({
    className: '',
    html: pinSvgMarkup(color, emoji),
    iconSize: [PIN_WIDTH, PIN_HEIGHT],
    iconAnchor: PIN_ANCHOR,
  });
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [24, 24] });
    }
  }, [map, positions]);
  return null;
}

// Client-only Leaflet (OpenStreetMap) implementation. Loaded lazily so leaflet
// never touches `window` during SSR / static export.
export default function PlanRouteMapLeaflet({ spots }: { spots: RouteSpot[] }) {
  const positions: [number, number][] = spots.map(s => [s.lat, s.lng]);

  return (
    <View style={{
      marginHorizontal: 18, marginTop: 16,
      borderRadius: 16, overflow: 'hidden', height: 220,
    }}>
      <MapContainer
        center={positions[0]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {positions.length > 1 ? (
          <Polyline positions={positions} pathOptions={{ color: '#7C5CFC', weight: 4 }} />
        ) : null}
        {spots.map((s, i) => (
          <Marker key={`${s.name}-${i}`} position={[s.lat, s.lng]} icon={pinIcon(s.color, s.emoji)} />
        ))}
        <FitBounds positions={positions} />
      </MapContainer>
    </View>
  );
}
