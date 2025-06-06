import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

// Only import Geocoder on native platforms
const isWeb = Platform.OS === 'web';
// We'll use a dynamic import for react-native-geocoding

const GeoCoderMarker = ({ address }: { address: string }) => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // State to hold the dynamically imported components
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [MarkerComponent, setMarkerComponent] = useState<React.ComponentType<any> | null>(null);
  const [geocoderInitialized, setGeocoderInitialized] = useState(false);

  // Load MapView and Geocoder only on native platforms
  useEffect(() => {
    if (!isWeb) {
      // Import MapView
      import("react-native-maps").then((module: any) => {
        setMapComponent(() => module.default);
        setMarkerComponent(() => module.Marker);
      });
      
      // Import Geocoder
      import("react-native-geocoding").then((module: any) => {
        const Geocoder = module.default;
        Geocoder.init("YOUR_GOOGLE_API_KEY");
        setGeocoderInitialized(true);
      }).catch(err => {
        console.warn("Error loading geocoder:", err);
      });
    }
  }, []);

  // Geocode the address when it changes (only on native)
  useEffect(() => {
    if (!isWeb && geocoderInitialized && address) {
      import("react-native-geocoding").then((module: any) => {
        const Geocoder = module.default;
        Geocoder.from(address)
          .then((json: any) => {
            const location = json.results[0].geometry.location;
            setRegion((prev) => ({
              ...prev,
              latitude: location.lat,
              longitude: location.lng,
            }));
          })
          .catch((error: any) => console.warn("Geocoding error:", error));
      });
    }
  }, [address, geocoderInitialized]);

  // For web platform, show a placeholder
  if (isWeb) {
    return (
      <View style={styles.webPlaceholder}>
        <Text style={styles.webPlaceholderText}>
          Map view is not available on web platform
        </Text>
      </View>
    );
  }

  // Show loading state while the map component is loading
  if (!MapComponent || !MarkerComponent) {
    return (
      <View style={styles.webPlaceholder}>
        <Text style={styles.webPlaceholderText}>Loading map...</Text>
      </View>
    );
  }

  // For native platforms, show the actual map
  return (
    <View style={{ flex: 1 }}>
      <MapComponent style={{ ...StyleSheet.absoluteFillObject }} region={region}>
        <MarkerComponent coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      </MapComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  webPlaceholder: {
    flex: 1,
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

export default GeoCoderMarker;
