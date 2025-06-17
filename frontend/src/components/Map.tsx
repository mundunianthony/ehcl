import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { geocodeAddress } from '../utils/api';

type MapProps = {
  address?: string;
  city?: string;
  country?: string;
  coords?: { latitude: number; longitude: number };
};

const Map: React.FC<MapProps> = ({ address, city, country, coords }) => {
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(coords || null);
  
  // Default region (center of Uganda)
  const defaultRegion = {
    latitude: 1.3733,
    longitude: 32.2903,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  // Get coordinates from address if provided and no direct coords
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!coordinates && address && city) {
        try {
          const geocoded = await geocodeAddress(address, city, country || 'Uganda');
          setCoordinates(geocoded);
        } catch (error) {
          console.error('Failed to geocode address:', error);
        }
      }
    };
    
    fetchCoordinates();
  }, [address, city, country, coordinates]);

  // For web platform, use Leaflet map
  if (Platform.OS === 'web') {
    return <WebMap coordinates={coordinates || { latitude: defaultRegion.latitude, longitude: defaultRegion.longitude }} />;
  }

  // For native platforms, show the actual map
  const [map, setMap] = useState<{
    MapView: any;
    Marker: any;
  } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('react-native-maps')
        .then((module) => {
          setMap({
            MapView: module.default,
            Marker: module.Marker,
          });
        })
        .catch(error => {
          console.error("Failed to load map:", error);
        });
    }
  }, []);

  if (!map) {
    return (
      <View style={[styles.container, styles.webPlaceholder]}>
        <Text style={styles.webPlaceholderText}>
          Loading map...
        </Text>
      </View>
    );
  }

  const { MapView, Marker } = map;
  
  // Use coordinates if available, otherwise default region
  const region = coordinates ? {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : defaultRegion;
  
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        {coordinates && (
          <Marker coordinate={{ 
            latitude: coordinates.latitude, 
            longitude: coordinates.longitude 
          }} />
        )}
      </MapView>
    </View>
  );
};

// Web-specific map implementation placeholder
// For a complete web implementation, we'd need a separate .web.tsx file
const WebMap: React.FC<{ coordinates: { latitude: number; longitude: number } }> = ({ coordinates }) => {
  // This is a placeholder component for web that doesn't use web-specific elements
  // that would cause errors in the React Native environment
  return (
    <View style={styles.webPlaceholder}>
      <Text style={styles.webPlaceholderText}>
        Map would display here on web platform
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    marginTop: 20,
    zIndex: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  webPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  webPlaceholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default Map;
