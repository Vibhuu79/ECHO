import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export interface UseGeolocationReturn {
  location: LocationState;
  error: string | null;
  loading: boolean;
  permissionState: PermissionState | 'unknown';
  refreshLocation: () => Promise<LocationState | null>;
}

// Distance threshold for triggering backend location sync (15 meters)
const MOVEMENT_THRESHOLD_METERS = 15;
// Time threshold for forcing periodic update (3 minutes)
const TIME_THRESHOLD_MS = 3 * 60 * 1000;

function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unknown'>('unknown');

  const lastSentRef = useRef<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  const handlePositionSuccess = useCallback(async (pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = pos.coords;
    setLocation({ latitude, longitude, accuracy });
    setError(null);
    setLoading(false);

    const now = Date.now();
    const lastSent = lastSentRef.current;

    let shouldUpdateBackend = false;
    if (!lastSent) {
      shouldUpdateBackend = true;
    } else {
      const distanceMoved = calculateHaversineMeters(
        lastSent.lat,
        lastSent.lng,
        latitude,
        longitude
      );
      const timeElapsed = now - lastSent.timestamp;

      if (distanceMoved >= MOVEMENT_THRESHOLD_METERS || timeElapsed >= TIME_THRESHOLD_MS) {
        shouldUpdateBackend = true;
      }
    }

    if (shouldUpdateBackend) {
      try {
        await api.updateLocation(latitude, longitude);
        lastSentRef.current = { lat: latitude, lng: longitude, timestamp: now };
      } catch (err) {
        console.error('Failed to sync location with server:', err);
      }
    }
  }, []);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    setLoading(false);
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError('Location permission denied. Please allow GPS access to discover people nearby.');
        setPermissionState('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        setError('Location position unavailable. Please check your device location settings.');
        break;
      case err.TIMEOUT:
        setError('Location request timed out. Retrying...');
        break;
      default:
        setError('An unknown error occurred while retrieving location.');
    }
  }, []);

  const refreshLocation = useCallback((): Promise<LocationState | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setLoading(false);
        resolve(null);
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionSuccess(pos);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => {
          handlePositionError(err);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }, [handlePositionSuccess, handlePositionError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // Check permission status if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => setPermissionState(result.state);
        })
        .catch(() => {});
    }

    // Initial position request
    refreshLocation();

    // Watch position changes
    const watchId = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [refreshLocation, handlePositionSuccess, handlePositionError]);

  return { location, error, loading, permissionState, refreshLocation };
}
