'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KERALA_CENTER: [number, number] = [10.5, 76.2];
const DEFAULT_ZOOM = 8;

export default function KeralaMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

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
      zoomControl: false
    }).setView(KERALA_CENTER, DEFAULT_ZOOM);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; CartoDB contributors'
    }).addTo(map);

    mapRef.current = map;

    // Asynchronously fetch Kerala district GeoJSON boundaries
    fetch(
      'https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/district.geojson'
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch boundaries');
        return res.json();
      })
      .then((data) => {
        if (!mapRef.current) return;

        // 1. Create Inverted Polygon Mask to darken everything outside Kerala
        const worldCoords: [number, number][] = [
          [90, -180],
          [90, 180],
          [-90, 180],
          [-90, -180]
        ];

        const rings: any[] = [worldCoords];

        data.features.forEach((feature: any) => {
          const geometry = feature.geometry;
          if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach((ring: any) => {
              // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
              const leafletRing = ring.map((coord: any) => [
                coord[1],
                coord[0]
              ]);
              rings.push(leafletRing);
            });
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: any) => {
              polygon.forEach((ring: any) => {
                const leafletRing = ring.map((coord: any) => [
                  coord[1],
                  coord[0]
                ]);
                rings.push(leafletRing);
              });
            });
          }
        });

        // Add the overlay mask expect kerala
        // L.polygon(rings, {
        //   fillColor: isDark ? 'oklch(14.5% 0 0)' : 'oklch(98.4% 0.003 247.858)', // Matches dark mode or deep charcoal in light mode
        //   fillOpacity: isDark ? 0.75 : 0.45, // Deeper darkness in dark mode for high-contrast glow
        //   stroke: false,
        //   interactive: false // Let clicks pass through to map
        // }).addTo(mapRef.current);

        // 2. Draw Highlighted Boundary around Kerala
        L.geoJSON(data, {
          style: {
            color: 'oklch(52.7% 0.154 150.069)',
            weight: 2,
            opacity: 0.85,
            fillColor: 'transparent',
            interactive: false
          }
        }).addTo(mapRef.current);
      })
      .catch((err) => {
        console.error('Error rendering boundaries:', err);
      });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        minHeight: '400px',
        width: '100%'
      }}
    >
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
      />
    </div>
  );
}
