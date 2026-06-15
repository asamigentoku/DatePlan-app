import { lazy, Suspense, useEffect, useState } from 'react';
import { View } from 'react-native';

export type RouteSpot = {
  name: string;
  lat: number;
  lng: number;
  color: string;
  emoji: string;
};

const placeholderStyle = {
  marginHorizontal: 18, marginTop: 16,
  borderRadius: 16, height: 220,
  backgroundColor: '#EEE9FF',
} as const;

const LeafletMap = lazy(() => import('./PlanRouteMapLeaflet'));
const GoogleMapWeb = lazy(() => import('./PlanRouteMapGoogle'));

const hasGoogleMapsKey = !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY;

// Web entry point: defers to Google Maps (if EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY is
// configured) or Leaflet (OpenStreetMap, no API key) on the client only, since both
// libraries touch `window` at import time and break SSR / static export.
export function PlanRouteMap({ spots }: { spots: RouteSpot[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (spots.length === 0) return null;
  if (!mounted) return <View style={placeholderStyle} />;

  return (
    <Suspense fallback={<View style={placeholderStyle} />}>
      {hasGoogleMapsKey ? <GoogleMapWeb spots={spots} /> : <LeafletMap spots={spots} />}
    </Suspense>
  );
}
