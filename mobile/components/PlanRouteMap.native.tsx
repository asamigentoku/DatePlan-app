import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

export type RouteSpot = {
  name: string;
  lat: number;
  lng: number;
  color: string;
  emoji: string;
};

const PADDING_RATIO = 1.6;
const MIN_DELTA = 0.01;

export function PlanRouteMap({ spots }: { spots: RouteSpot[] }) {
  if (spots.length === 0) return null;

  const coords = spots.map(s => ({ latitude: s.lat, longitude: s.lng }));
  const lats = coords.map(c => c.latitude);
  const lngs = coords.map(c => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, MIN_DELTA) * PADDING_RATIO,
    longitudeDelta: Math.max(maxLng - minLng, MIN_DELTA) * PADDING_RATIO,
  };

  return (
    <View style={styles.wrap}>
      <MapView
        style={styles.map}
        initialRegion={region}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        scrollEnabled
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {coords.length > 1 ? (
          <Polyline coordinates={coords} strokeColor="#7C5CFC" strokeWidth={4} />
        ) : null}
        {spots.map((s, i) => (
          <Marker
            key={`${s.name}-${i}`}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            title={s.name}
          >
            <View style={styles.pinWrap}>
              <View style={[styles.pin, { borderColor: s.color }]}>
                <Text style={styles.pinText}>{s.emoji}</Text>
              </View>
              <View style={[styles.pinTail, { borderTopColor: s.color }]} />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 18, marginTop: 16,
    borderRadius: 16, overflow: 'hidden',
    height: 220,
    shadowColor: '#7C5CFC', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  map: { flex: 1 },
  pinWrap: {
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.25,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  pin: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 2.5,
  },
  pinTail: {
    width: 0, height: 0, marginTop: -3,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },
  pinText: { fontSize: 16 },
});
