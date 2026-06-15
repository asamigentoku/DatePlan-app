// Shared teardrop pin shape (color outline + white circle with category emoji)
// used by the web map implementations (Google Maps / Leaflet).
export const PIN_WIDTH = 36;
export const PIN_HEIGHT = 44;
export const PIN_ANCHOR: [number, number] = [PIN_WIDTH / 2, PIN_HEIGHT - 1];

export function pinSvgMarkup(color: string, emoji: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 ${PIN_WIDTH} ${PIN_HEIGHT}">
    <path d="M18 0C8 0 0 8 0 18c0 10 18 26 18 26s18-16 18-26C36 8 28 0 18 0z" fill="${color}"/>
    <circle cx="18" cy="17" r="12" fill="#fff"/>
    <text x="18" y="22" font-size="15" text-anchor="middle" font-family="sans-serif">${emoji}</text>
  </svg>`;
}

export function pinDataUri(color: string, emoji: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvgMarkup(color, emoji))}`;
}

// Soft pastel map theme to match the app's purple accent (#7C5CFC).
export const CUTE_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f6f3ff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b7bb8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e3d9ff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdf6ff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe8ff' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e9f5e1' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcf2d8' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
];
