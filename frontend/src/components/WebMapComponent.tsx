import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

interface WebMapComponentProps {
  coords: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  height?: number;
  showControls?: boolean;
}

/**
 * An enhanced map component that works on both mobile and web platforms
 * Uses react-native-maps for mobile and OpenStreetMap for web
 */
const WebMapComponent: React.FC<WebMapComponentProps> = ({ 
  coords, 
  title,
  height = 250,
  showControls = true 
}) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [map, setMap] = useState<{
    MapView: any;
    Marker: any;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position on the map');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setUserLocation(location);
    })();
  }, []);

  // URL for directions in Google Maps with both origin and destination
  const getDirectionsUrl = () => {
    if (userLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.coords.latitude},${userLocation.coords.longitude}&destination=${coords.latitude},${coords.longitude}&travelmode=driving`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`;
  };
  
  // Open directions
  const openDirections = () => {
    const url = getDirectionsUrl();
    Linking.openURL(url);
  };

  // For mobile platforms, dynamically import react-native-maps
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

  // For web platform, use OpenStreetMap embed
  if (Platform.OS === 'web') {
    const [zoomLevel, setZoomLevel] = useState(15);
    
    // Create the OpenStreetMap iframe URL with zoom level
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.01 / zoomLevel}%2C${coords.latitude - 0.01 / zoomLevel}%2C${coords.longitude + 0.01 / zoomLevel}%2C${coords.latitude + 0.01 / zoomLevel}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`;
    
    // Handle zoom in/out
    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 5, 30));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 5, 5));
    
    return (
      <View style={[styles.container, { height }]}>
        <View style={[styles.mapPlaceholder, { height: showControls ? "85%" : "100%" }]}>
          <Text style={styles.mapText}>Map will display on web platform</Text>
        </View>
        
        {showControls && (
          <View style={styles.controlsContainer}>
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
                <Text style={styles.controlButtonText}>-</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
              <Text style={styles.directionsText}>
                {userLocation ? 'Get Directions from My Location' : 'Get Directions'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
  
  // Loading state for mobile map
  if (!map) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.mapText}>Loading map...</Text>
      </View>
    );
  }

  // Mobile implementation using react-native-maps
  const { MapView, Marker } = map;
  
  const region = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.mapWrapper}>
        <MapView 
          style={styles.map} 
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          <Marker 
            coordinate={coords} 
            title={title || "Hospital Location"}
            pinColor="red"
          />
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
      
      {showControls && (
        <View style={styles.mobileControlsContainer}>
          <TouchableOpacity 
            style={styles.directionsButton} 
            onPress={openDirections}
          >
            <Text style={styles.directionsText}>
              {userLocation ? 'Get Directions from My Location' : 'Get Directions'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mapPlaceholder: {
    width: '100%',
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  mapText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mapWrapper: {
    width: '100%',
    height: '85%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  controlsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: '15%',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mobileControlsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    height: '15%',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  controlButtonText: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: '600',
  },
  directionsButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  directionsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WebMapComponent;
