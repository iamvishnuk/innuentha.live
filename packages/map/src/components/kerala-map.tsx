'use client';

import { useEffect, useRef } from 'react';
import { CATEGORY_DETAILS } from '@innuentha/shared';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KERALA_CENTER: [number, number] = [10.5, 76.2];
const DEFAULT_ZOOM = 8;

export interface KeralaMapProps {
  events?: any[];
  onSelectEvent?: (event: any) => void;
  selectedEventId?: string | null;
  userLocation?: { lat: number; lng: number } | null;
}

function formatDateRange(startStr: string, endStr: string) {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  if (startStr === endStr) {
    return start.toLocaleDateString('en-US', options);
  }

  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

export default function KeralaMap({
  events,
  onSelectEvent,
  selectedEventId,
  userLocation
}: KeralaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});

  const initialLocationRef = useRef(userLocation);

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

    const initialCenter = userLocation
      ? ([userLocation.lat, userLocation.lng] as [number, number])
      : KERALA_CENTER;
    const initialZoom = userLocation ? 11 : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView(initialCenter, initialZoom);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; CartoDB contributors'
    }).addTo(map);

    // Initial marker layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

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

        // Draw Highlighted Boundary around Kerala
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

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    markersMapRef.current = {};

    events?.forEach((event) => {
      const { latitude, longitude, id } = event;
      if (!latitude || !longitude) return;

      const style = (CATEGORY_DETAILS[event.category] ||
        CATEGORY_DETAILS.OTHER)!;

      // Custom divIcon
      const customIcon = L.divIcon({
        html: `
          <div class="event-marker-container">
            <div class="event-marker-pulse" style="background-color: ${style.color};"></div>
            <div class="event-marker-badge" style="background-color: ${style.color};">
              <span class="event-marker-emoji">${style.emoji}</span>
            </div>
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const formattedDateRange = formatDateRange(
        event.startDate,
        event.endDate
      );
      const descriptionPreview =
        event.description.length > 80
          ? `${event.description.substring(0, 80)}...`
          : event.description;

      const popupContent = `
        <div class="event-card-popup" style="color: inherit;">
          <div style="position: relative; height: 130px; overflow: hidden; background-color: #1a1e1b;">
            <img src="${event.posterUrl}" alt="${event.eventName}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'" />
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);"></div>
            <span style="position: absolute; top: 10px; left: 10px; background: ${style.color}; color: white; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 4px;">
              <span>${style.emoji}</span> ${style.label}
            </span>
          </div>
          
          <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 6px;">
            <h3 style="margin: 0; font-family: var(--font-inter), sans-serif; font-size: 14px; font-weight: 800; line-height: 1.25; color: inherit; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${event.eventName} hello world
            </h3>
            
            <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 5px; font-weight: 500; opacity: 0.8;">
                <span>📅</span>
                <span>${formattedDateRange}</span>
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: 5px; font-weight: 500; opacity: 0.8;">
                <span>📍</span>
                <span style="line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${event.place}, ${event.district}</span>
              </div>
            </div>
            
            <p style="margin: 0; font-size: 11px; line-height: 1.35; opacity: 0.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${descriptionPreview}
            </p>
            
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              ${
                event.sourceLink
                  ? `
                <a href="${event.sourceLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: rgba(56, 189, 248, 0.15); color: #0284c7; padding: 5px 0; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none; border: 1px solid rgba(56, 189, 248, 0.3); transition: all 0.2s;" class="dark:text-sky-300 dark:border-sky-500/30 hover:opacity-90">
                  Source
                </a>
              `
                  : ''
              }
              <button onclick="window.openEventDetails('${id}')" style="flex: 1; background: oklch(52.7% 0.154 150.069); color: white; padding: 5px 0; border: none; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; hover:opacity-90">
                Details
              </button>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([latitude, longitude], { icon: customIcon })
        .bindPopup(popupContent, {
          autoPan: true,
          autoPanPaddingTopLeft: [10, 150],
          keepInView: true
        })
        .addTo(markersGroupRef.current!);

      markersMapRef.current[id] = marker;
    });
  }, [events]);

  // Handle userLocation dynamic changes (e.g. user grants permission after map loads)
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    if (initialLocationRef.current) {
      initialLocationRef.current = null;
      return;
    }
    mapRef.current.flyTo([userLocation.lat, userLocation.lng], 11, {
      animate: true,
      duration: 1.5
    });
  }, [userLocation]);

  // Handle selectedEventId flyTo and popup opening
  useEffect(() => {
    if (!mapRef.current || !selectedEventId) return;

    const marker = markersMapRef.current[selectedEventId];
    if (marker) {
      marker.openPopup();
      mapRef.current.flyTo(marker.getLatLng(), 14, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedEventId]);

  // Set up global bridge
  useEffect(() => {
    (window as any).openEventDetails = (eventId: string) => {
      const event = events?.find((e) => e.id === eventId);
      if (event && onSelectEvent) {
        onSelectEvent(event);
      }
    };

    return () => {
      delete (window as any).openEventDetails;
    };
  }, [events, onSelectEvent]);

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
