'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const KERALA_CENTER: [number, number] = [10.5, 76.2];
const DEFAULT_ZOOM = 7;

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix default marker icon paths in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
    });

    const isDark = document.documentElement.classList.contains('dark');
    const tileLayerUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    const map = L.map(mapContainerRef.current, {
      zoomControl: true
    }).setView(
      [lat || KERALA_CENTER[0], lng || KERALA_CENTER[1]],
      DEFAULT_ZOOM
    );

    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; CartoDB contributors'
    }).addTo(map);

    // Initial marker if lat/lng are already set
    if (lat && lng) {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      });
    }

    // Click handler to drop/move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      onChange(clickLat, clickLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        const newMarker = L.marker([clickLat, clickLng], {
          draggable: true
        }).addTo(map);
        markerRef.current = newMarker;

        newMarker.on('dragend', () => {
          const position = newMarker.getLatLng();
          onChange(position.lat, position.lng);
        });
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker if lat/lng change from outside (e.g. manual typing)
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    const currentLatLng = markerRef.current?.getLatLng();
    if (currentLatLng && currentLatLng.lat === lat && currentLatLng.lng === lng)
      return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const newMarker = L.marker([lat, lng], { draggable: true }).addTo(
        mapRef.current
      );
      markerRef.current = newMarker;

      newMarker.on('dragend', () => {
        const position = newMarker.getLatLng();
        onChange(position.lat, position.lng);
      });
    }

    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
  }, [lat, lng]);

  return (
    <div className='relative h-full min-h-[350px] w-full overflow-hidden rounded-3xl border border-neutral-200 shadow-inner dark:border-neutral-800'>
      <div
        ref={mapContainerRef}
        className='absolute inset-0 h-full w-full'
      />
      <div className='pointer-events-none absolute bottom-3 left-3 z-30 rounded-xl bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-neutral-600 shadow-md backdrop-blur-md dark:bg-black/90 dark:text-neutral-300'>
        🖱️ Click on the map or drag the pin to select location
      </div>
    </div>
  );
}
