import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, Alert } from 'react-native';
import { geocodeAddress } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

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
  
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Default region (center of Uganda)
  const defaultRegion = {
    latitude: 1.3733,
    longitude: 32.2903,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  console.log('Map component props:', { address, city, country, coords });
  console.log('Map component state:', { coordinates, mapError, isLoading });

  // Get coordinates from address if provided and no direct coords
  useEffect(() => {
    const fetchCoordinates = async () => {
      console.log('Fetching coordinates for:', { address, city, country });
      if (!coordinates && address && city && address.trim() && city.trim()) {
        try {
          setIsLoading(true);
          console.log('Calling geocodeAddress...');
          const geocoded = await geocodeAddress(address, city, country || 'Uganda');
          console.log('Geocoded result:', geocoded);
          
          // Validate geocoded coordinates
          if (geocoded && 
              geocoded.latitude && 
              geocoded.longitude &&
              geocoded.latitude !== 0 && 
              geocoded.longitude !== 0 &&
              geocoded.latitude >= -90 && geocoded.latitude <= 90 &&
              geocoded.longitude >= -180 && geocoded.longitude <= 180) {
            setCoordinates(geocoded);
          } else {
            console.log('Invalid geocoded coordinates, using default');
            setCoordinates(defaultRegion);
          }
        } catch (error) {
          console.error('Failed to geocode address:', error);
          setMapError('Could not find location coordinates');
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('No need to fetch coordinates:', { coordinates, address, city });
        // If no coordinates and no address, use default coordinates
        if (!coordinates && (!address || !city || !address.trim() || !city.trim())) {
          console.log('Using default coordinates for Uganda');
          setCoordinates(defaultRegion);
        }
        setIsLoading(false);
      }
    };
    
    fetchCoordinates();
  }, [address, city, country, coordinates]);

  // For web platform, show placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Ionicons name="map-outline" size={48} color="#666" />
        <Text style={styles.placeholderText}>Map View</Text>
        <Text style={styles.placeholderSubtext}>
          {coordinates ? 
            `Coordinates: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}` :
            'Location will be displayed here'
          }
        </Text>
        {address && city && (
          <Text style={styles.placeholderSubtext}>
            Address: {address}, {city}, {country || 'Uganda'}
          </Text>
        )}
      </View>
    );
  }

  // For native platforms, try to load the map
  const [map, setMap] = useState<{
    MapView: any;
    Marker: any;
  } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const loadMap = async () => {
        console.log('Loading react-native-maps...');
        try {
          const module = await import('react-native-maps');
          console.log('Successfully loaded react-native-maps:', module);
          setMap({
            MapView: module.default,
            Marker: module.Marker,
          });
        } catch (error) {
          console.error("Failed to load map:", error);
          setMapError('Map component could not be loaded');
        }
      };
      
      loadMap();
    } else {
      console.log('Running on web platform, showing placeholder');
    }
  }, []);

  // Show loading state
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Ionicons name="map-outline" size={48} color="#666" />
        <Text style={styles.placeholderText}>Loading map...</Text>
      </View>
    );
  }

  // Show error state
  if (mapError) {
    console.log('Rendering error state:', mapError);
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Ionicons name="map-outline" size={48} color="#666" />
        <Text style={styles.placeholderText}>Map Unavailable</Text>
        <Text style={styles.placeholderSubtext}>{mapError}</Text>
        {coordinates && (
          <Text style={styles.placeholderSubtext}>
            Coordinates: {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    );
  }

  // Show loading map state
  if (!map) {
    console.log('Rendering map loading state');
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Ionicons name="map-outline" size={48} color="#666" />
        <Text style={styles.placeholderText}>Initializing map...</Text>
      </View>
    );
  }

  // Show actual map
  console.log('Rendering actual map with coordinates:', coordinates);
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
      {(!address || !city || !address.trim() || !city.trim()) && (
        <View style={styles.noAddressContainer}>
          <Text style={styles.noAddressText}>
            Enter address details above to see the location on the map
          </Text>
        </View>
      )}
      <MapView 
        style={styles.map} 
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {coordinates && (
          <Marker 
            coordinate={{ 
              latitude: coordinates.latitude, 
              longitude: coordinates.longitude 
            }}
            title={address && city ? "Hospital Location" : "Default Location"}
            description={address && city ? 
              `${address}, ${city}, ${country || 'Uganda'}` : 
              "Enter address to see specific location"
            }
            pinColor={address && city ? "red" : "blue"}
          />
        )}
      </MapView>
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
  placeholder: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  placeholderText: {
    color: '#495057',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  placeholderSubtext: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  noAddressContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  noAddressText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Map;
