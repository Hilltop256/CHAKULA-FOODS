/**
 * Shared Leaflet loader for Chakula Foods maps.
 * Uses Leaflet 1.9.4 from the official documented CDN build and
 * OpenStreetMap tiles, so no Google Maps API key is required.
 */
const LEAFLET_CSS_ID = 'chakula-leaflet-css';
const LEAFLET_SCRIPT_ID = 'chakula-leaflet-script';
const LEAFLET_VERSION = '1.9.4';

let loadPromise: Promise<any> | null = null;

export function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Leaflet can only be loaded in the browser.'));
  }

  if ((window as any).L) return Promise.resolve((window as any).L);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement('link');
      link.id = LEAFLET_CSS_ID;
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    const existing = document.getElementById(LEAFLET_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).L), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Leaflet.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = LEAFLET_SCRIPT_ID;
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error('Unable to load Leaflet.'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

export function addOpenStreetMapTiles(L: any, map: any) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution =
    process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; OpenStreetMap contributors';

  return L.tileLayer(tileUrl, {
    maxZoom: 19,
    attribution,
  }).addTo(map);
}

export function createEmojiMapIcon(L: any, emoji: string, background = '#ffffff') {
  return L.divIcon({
    className: 'chakula-map-marker',
    html: `<div style="width:36px;height:36px;border-radius:9999px;background:${background};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;font-size:19px;line-height:1">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}
