import { useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/lib/cookies';

export interface UserLocation {
  lat: number;
  lng: number;
}

export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => {
    if (typeof window === 'undefined') return null;
    const lat = getCookie('user_lat');
    const lng = getCookie('user_lng');
    return lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
  });

  useEffect(() => {
    const hasPermission = getCookie('location_permission');
    if (
      !hasPermission &&
      typeof navigator !== 'undefined' &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCookie('user_lat', latitude.toString(), 30);
          setCookie('user_lng', longitude.toString(), 30);
          setCookie('location_permission', 'allowed', 30);
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('Geolocation permission denied or failed:', error);
          setCookie('location_permission', 'denied', 30);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  return userLocation;
}
