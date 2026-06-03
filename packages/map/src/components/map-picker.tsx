'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  /** Base URL of the API server, e.g. http://localhost:8001/api */
  apiBaseUrl?: string;
}

const KERALA_CENTER: [number, number] = [10.5, 76.2];
const DEFAULT_ZOOM = 7;

export default function MapPicker({
  lat,
  lng,
  onChange,
  apiBaseUrl
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Keep a stable ref to onChange so Leaflet callbacks never go stale
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  // Keep a ref mirror of suggestions to read inside the debounce without
  // adding it as an effect dependency (avoids stale-closure / infinite loop)
  const suggestionsRef = useRef<any[]>([]);
  useEffect(() => {
    suggestionsRef.current = suggestions;
  }, [suggestions]);

  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Session token groups all autocomplete keystrokes + the final place
  // details fetch into one billable session (much cheaper than per-request billing)
  const sessionTokenRef = useRef<any>(null);
  // Flag set to true immediately after a selection so the debounce effect
  // skips the next run and doesn't re-open the dropdown with a fresh search
  const justSelectedRef = useRef(false);

  // Dynamically load Google Maps script if API key is provided in env
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    // Already bootstrapped
    if (window.google?.maps) return;

    const scriptId = 'google-maps-places-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Skip this run if we just made a selection — prevents the dropdown
    // from re-opening with a fresh search triggered by the updated searchQuery
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    // Don't re-search when the query matches a previously selected suggestion
    // Uses a ref so we don't add `suggestions` as a dep (prevents infinite loop)
    const isExactSuggestion = suggestionsRef.current.some(
      (item) => item.display_name === trimmed
    );
    if (isExactSuggestion) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      // Tier 1: check our own location cache — avoids Google/OSM costs
      if (apiBaseUrl) {
        try {
          const res = await fetch(
            `${apiBaseUrl}/locations/search?q=${encodeURIComponent(trimmed)}`
          );
          if (res.ok) {
            const { locations } = await res.json();
            if (locations && locations.length > 0) {
              const formatted = locations.map((loc: any) => ({
                id: loc.id,
                name: loc.name,
                display_name: loc.displayName,
                lat: loc.latitude,
                lng: loc.longitude,
                placeId: loc.placeId,
                isGoogle: false,
                isCache: true
              }));
              setSuggestions(formatted);
              setShowDropdown(true);
              setIsLoading(false);
              return; // Cache hit — skip Google/OSM
            }
          }
        } catch {
          // Cache unavailable — fall through to Google/OSM silently
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey && window.google?.maps) {
        // Tier 2: Google Places Autocomplete (New Places API)
        try {
          const { AutocompleteSuggestion, AutocompleteSessionToken } =
            await window.google.maps.importLibrary('places');

          // Lazily create a session token for this search session.
          // All keystrokes share the same token until a place is selected.
          if (!sessionTokenRef.current) {
            sessionTokenRef.current = new AutocompleteSessionToken();
          }

          const { suggestions: googleSuggestions } =
            await AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input: trimmed,
              sessionToken: sessionTokenRef.current,
              includedRegionCodes: ['in'],
              locationBias: {
                north: 12.85,
                south: 8.15,
                east: 77.25,
                west: 74.85
              }
            });

          const formatted = (googleSuggestions || []).map((s: any) => ({
            id: s.placePrediction?.placeId,
            name:
              s.placePrediction?.mainText?.text ||
              s.placePrediction?.text?.text ||
              '',
            display_name: s.placePrediction?.text?.text || '',
            isGoogle: true,
            isCache: false
          }));
          setSuggestions(formatted);
          setShowDropdown(true);
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          setError('Error loading Google Places results');
          setIsLoading(false);
        }
      } else {
        // Tier 3: OSM Nominatim (no API key fallback)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              trimmed
            )}&format=json&limit=5&countrycodes=in&viewbox=74.85,12.85,77.25,8.15&bounded=1`,
            {
              headers: { 'User-Agent': 'Innuentha-Event-Map-App' }
            }
          );
          if (!response.ok) throw new Error('Failed to fetch locations');
          const data = await response.json();
          const formatted = (data || []).map((item: any) => ({
            id: item.place_id,
            name: item.name || item.display_name.split(',')[0],
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            isGoogle: false,
            isCache: false
          }));
          setSuggestions(formatted);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
          setError('Error loading search results');
        } finally {
          setIsLoading(false);
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    // Reset session token so the next search starts a fresh billable session
    sessionTokenRef.current = null;
  };

  /**
   * Fire-and-forget: cache a selected location so future searches
   * can be served from our DB instead of calling Google/OSM.
   * Only called for non-cache results (Google or OSM selections).
   */
  const cacheLocation = (
    name: string,
    displayName: string,
    latitude: number,
    longitude: number,
    source: 'google' | 'osm',
    placeId?: string | null
  ) => {
    if (!apiBaseUrl) return;
    fetch(`${apiBaseUrl}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        displayName,
        latitude,
        longitude,
        source,
        placeId: placeId ?? null
      })
    }).catch(() => {
      /* fire-and-forget — ignore errors */
    });
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    if (suggestion.isGoogle) {
      setIsLoading(true);
      setError(null);
      try {
        const { Place } = await window.google.maps.importLibrary('places');
        const place = new Place({ id: suggestion.id });
        // Pass the same session token so this details fetch is billed
        // as part of the same session as the preceding autocomplete calls.
        await place.fetchFields({
          fields: ['location', 'formattedAddress', 'displayName'],
          sessionToken: sessionTokenRef.current
        });
        // Session is now complete — reset so the next search gets a fresh token.
        sessionTokenRef.current = null;

        if (place.location) {
          const latVal = place.location.lat();
          const lngVal = place.location.lng();

          onChangeRef.current(latVal, lngVal);
          // Flag before setSearchQuery so the debounce effect skips immediately
          justSelectedRef.current = true;
          // Prefer displayName ("Talap Sree Sundareswarar Temple") over
          // formattedAddress which can be a Plus Code ("V9M9+VH4, Kannur…")
          const displayText =
            place.displayName ||
            suggestion.display_name ||
            place.formattedAddress;
          setSearchQuery(displayText);
          setShowDropdown(false);

          // Cache this location for future searches (fire-and-forget)
          cacheLocation(
            place.displayName || suggestion.name,
            suggestion.display_name,
            latVal,
            lngVal,
            'google',
            suggestion.id
          );

          if (mapRef.current) {
            mapRef.current.flyTo([latVal, lngVal], 15, {
              animate: true,
              duration: 1.5
            });
          }
        } else {
          setError('Failed to retrieve location coordinates');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading place details');
      } finally {
        setIsLoading(false);
      }
    } else {
      const latVal = suggestion.lat;
      const lngVal = suggestion.lng;

      // Cache hit — no need to re-cache, it's already in the DB
      if (!suggestion.isCache) {
        cacheLocation(
          suggestion.name,
          suggestion.display_name,
          latVal,
          lngVal,
          'osm',
          null
        );
      }

      onChangeRef.current(latVal, lngVal);
      justSelectedRef.current = true;
      setSearchQuery(suggestion.display_name);
      setShowDropdown(false);

      if (mapRef.current) {
        mapRef.current.flyTo([latVal, lngVal], 14, {
          animate: true,
          duration: 1.5
        });
      }
    }
  };

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
      zoomControl: false
    }).setView(
      [lat || KERALA_CENTER[0], lng || KERALA_CENTER[1]],
      DEFAULT_ZOOM
    );

    L.tileLayer(tileLayerUrl, {
      attribution: '&copy; CartoDB contributors'
    }).addTo(map);

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

    // Initial marker if lat/lng are already set
    if (lat && lng) {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChangeRef.current(position.lat, position.lng);
      });
    }

    // Click handler to drop/move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      onChangeRef.current(clickLat, clickLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        const newMarker = L.marker([clickLat, clickLng], {
          draggable: true
        }).addTo(map);
        markerRef.current = newMarker;

        newMarker.on('dragend', () => {
          const position = newMarker.getLatLng();
          onChangeRef.current(position.lat, position.lng);
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

  // Update marker if lat/lng change from outside (e.g. form setValue)
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
        onChangeRef.current(position.lat, position.lng);
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

      {/* Floating Search Bar */}
      <div
        ref={searchContainerRef}
        className='map-picker-search-container'
      >
        <div
          className='relative flex items-center rounded-2xl border border-neutral-200/80 bg-white/80 shadow-lg backdrop-blur-md transition-all focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-200 dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:focus-within:border-neutral-600 dark:focus-within:bg-neutral-900 dark:focus-within:ring-neutral-800'
          style={{ padding: '5px 10px' }}
        >
          <Search className='h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500' />
          <input
            type='text'
            placeholder='Search location in Kerala...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            className='w-full bg-transparent px-2 py-1.5 text-sm font-medium text-neutral-800 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500'
          />
          {isLoading ? (
            <Loader2 className='h-4 w-4 flex-shrink-0 animate-spin text-neutral-400 dark:text-neutral-500' />
          ) : searchQuery ? (
            <button
              onClick={handleClearSearch}
              type='button'
              className='rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          ) : null}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown && (suggestions.length > 0 || error) && (
          <div
            className='max-h-60 w-full animate-in overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white/95 shadow-xl backdrop-blur-md duration-150 fade-in slide-in-from-top-1 dark:border-neutral-800/80 dark:bg-neutral-900/95'
            style={{ padding: '10px' }}
          >
            {error ? (
              <div className='px-3 py-2 text-xs text-red-500 dark:text-red-400'>
                {error}
              </div>
            ) : (
              suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  type='button'
                  className='flex w-full flex-col gap-0.5 rounded-xl border border-transparent px-3 py-2 text-left text-xs transition-colors hover:border-neutral-100 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-800/60'
                >
                  <span className='truncate font-semibold text-neutral-800 dark:text-neutral-200'>
                    {item.name || item.display_name.split(',')[0]}
                  </span>
                  <span className='truncate text-[10px] text-neutral-500 dark:text-neutral-400'>
                    {item.display_name}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
