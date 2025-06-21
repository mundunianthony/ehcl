import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { createSystemNotification } from '../services/notificationService';

interface UseLocationOptions {
  userEmail?: string;
  enableNotifications?: boolean;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastLocationRef = useRef<Location.LocationObject | null>(null);

  // Calculate distance between two locations
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Send location change notification
  const sendLocationChangeNotification = async (newLocation: Location.LocationObject) => {
    if (!options.userEmail || !options.enableNotifications) return;

    const lastLocation = lastLocationRef.current;
    if (!lastLocation) return;

    const distance = calculateDistance(
      lastLocation.coords.latitude,
      lastLocation.coords.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    // Only send notification if location changed significantly (more than 1km)
    if (distance > 1) {
      try {
        await createSystemNotification(
          options.userEmail,
          'Location Updated',
          `Your location has changed by ${distance.toFixed(1)}km. We'll update nearby health centers for you.`
        );
      } catch (error) {
        console.error('Failed to send location change notification:', error);
      }
    }
  };

  useEffect(() => {
    console.log('useLocation: Requesting location permissions');
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('useLocation: Permission status:', status);
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          console.log('useLocation: Permission denied');
          return;
        }

        console.log('useLocation: Getting current position');
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        console.log('useLocation: Received location', {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy
        });

        // Send notification if location changed significantly
        if (lastLocationRef.current) {
          await sendLocationChangeNotification(currentLocation);
        }

        setLocation(currentLocation);
        lastLocationRef.current = currentLocation;
      } catch (error) {
        console.error('useLocation: Error getting location', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setErrorMsg('Error getting location');
      }
    })();
  }, []);

  return { location, errorMsg };
};
