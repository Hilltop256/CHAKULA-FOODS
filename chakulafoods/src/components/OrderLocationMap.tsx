'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';
import { addOpenStreetMapTiles, createEmojiMapIcon, loadLeaflet } from '@/lib/leafletLoader';

const STORE_LOCATION = { lat: 0.3476, lng: 32.6252 };

interface OrderLocationMapProps {
  customerLat: number | null | undefined;
  customerLng: number | null | undefined;
  status?: string | null;
  height?: number;
}

function riderProgressForStatus(status?: string | null) {
  if (status === 'delivered') return 1;
  if (status === 'out_for_delivery') return 0.6;
  if (status === 'rider_assigned') return 0.15;
  return null;
}

export default function OrderLocationMap({
  customerLat,
  customerLng,
  status,
  height = 280,
}: OrderLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!mapRef.current || !customerLat || !customerLng) {
        setLoading(false);
        return;
      }

      try {
        const L = await loadLeaflet();
        if (cancelled || !mapRef.current) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false,
        });
        addOpenStreetMapTiles(L, map);
        mapInstanceRef.current = map;

        L.marker([STORE_LOCATION.lat, STORE_LOCATION.lng], {
          icon: createEmojiMapIcon(L, '🏪', '#16a34a'),
          title: 'Chakula Foods Naalya',
        }).addTo(map).bindPopup('Chakula Foods Naalya');

        L.marker([customerLat, customerLng], {
          icon: createEmojiMapIcon(L, '📍', '#C41230'),
          title: 'Customer delivery location',
        }).addTo(map).bindPopup('Customer delivery location');

        L.polyline(
          [
            [STORE_LOCATION.lat, STORE_LOCATION.lng],
            [customerLat, customerLng],
          ],
          { color: '#1B5E38', weight: 4, opacity: 0.65, dashArray: '8 8' },
        ).addTo(map);

        const progress = riderProgressForStatus(status);
        if (progress !== null) {
          const riderLat = STORE_LOCATION.lat + (customerLat - STORE_LOCATION.lat) * progress;
          const riderLng = STORE_LOCATION.lng + (customerLng - STORE_LOCATION.lng) * progress;
          L.marker([riderLat, riderLng], {
            icon: createEmojiMapIcon(L, '🛵', '#2563eb'),
            title: status === 'delivered' ? 'Delivered' : 'Rider progress',
          }).addTo(map);
        }

        const bounds = L.latLngBounds([
          [STORE_LOCATION.lat, STORE_LOCATION.lng],
          [customerLat, customerLng],
        ]);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
        window.setTimeout(() => map.invalidateSize(), 0);

        setError('');
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError('Unable to load the map. Check the internet connection and try again.');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerLat, customerLng, status]);

  if (!customerLat || !customerLng) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground" style={{ height }}>
        <div className="text-center px-5">
          <MapPin size={24} className="mx-auto mb-2 opacity-50" />
          No customer GPS coordinates were recorded for this order.
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border" style={{ height }}>
      <div ref={mapRef} className="h-full w-full" />
      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-muted/70">
          <Loader2 size={26} className="animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-[500] flex flex-col items-center justify-center bg-muted px-5 text-center">
          <AlertCircle size={25} className="mb-2 text-accent" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
    </div>
  );
}
