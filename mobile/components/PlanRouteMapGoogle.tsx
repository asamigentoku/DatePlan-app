import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { View } from 'react-native';

import { CUTE_MAP_STYLE, PIN_ANCHOR, PIN_HEIGHT, PIN_WIDTH, pinDataUri } from './mapPin';
import type { RouteSpot } from './PlanRouteMap';

const containerStyle = { width: '100%', height: '100%' };

// Client-only Google Maps (JS API) implementation for web.
export default function PlanRouteMapGoogle({ spots }: { spots: RouteSpot[] }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ?? '',
  });

  const positions = spots.map(s => ({ lat: s.lat, lng: s.lng }));

  return (
    <View style={{
      marginHorizontal: 18, marginTop: 16,
      borderRadius: 16, overflow: 'hidden', height: 220,
    }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={positions[0]}
          zoom={13}
          options={{ disableDefaultUI: true, zoomControl: true, styles: CUTE_MAP_STYLE }}
          onLoad={map => {
            if (positions.length > 1) {
              const bounds = new google.maps.LatLngBounds();
              positions.forEach(p => bounds.extend(p));
              map.fitBounds(bounds, 32);
            }
          }}
        >
          {positions.length > 1 ? (
            <Polyline path={positions} options={{ strokeColor: '#7C5CFC', strokeWeight: 4 }} />
          ) : null}
          {spots.map((s, i) => (
            <Marker
              key={`${s.name}-${i}`}
              position={{ lat: s.lat, lng: s.lng }}
              title={s.name}
              icon={{
                url: pinDataUri(s.color, s.emoji),
                scaledSize: new google.maps.Size(PIN_WIDTH, PIN_HEIGHT),
                anchor: new google.maps.Point(PIN_ANCHOR[0], PIN_ANCHOR[1]),
              }}
            />
          ))}
        </GoogleMap>
      ) : null}
    </View>
  );
}
