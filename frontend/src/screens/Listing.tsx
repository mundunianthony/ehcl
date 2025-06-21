import React, { useMemo, useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList, Hospital } from "../types";
import { getAllHospitals } from "../utils/api";
import { getPlaceholderImageUrl } from "../utils/hospitalImages";
import { cityCoords, getCoordsByCity } from '../utils/cityCoords';

// navigation props
type ListingNavProp = StackNavigationProp<RootStackParamList, "Listing">;
type ListingRouteProp = RouteProp<RootStackParamList, "Listing">;

type Props = {
  navigation: ListingNavProp;
  route: ListingRouteProp;
};

export default function ListingScreen({ navigation, route }: Props) {
  // Add header with back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
      headerTitle: 'Nearby Hospitals',
      headerTitleAlign: 'center',
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
    });
  }, [navigation]);
  const { city, userCoords } = route.params;
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Fetch hospitals from API when component mounts
  useEffect(() => {
    fetchHospitals();
  }, []);

  // Function to fetch hospitals from the API
  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const data = await getAllHospitals();
      
      // Transform the data structure to match the Hospital type if needed
      const transformedData: Hospital[] = data.map((hospital: any) => ({
        id: hospital.id.toString(),
        name: hospital.name,
        city: hospital.city || "Unknown", // Using city as district
        description: hospital.description,
        address: hospital.address,
        coords: {
          latitude: hospital.coords?.latitude || 0,
          longitude: hospital.coords?.longitude || 0,
        },
        imageUrl: hospital.image || "https://via.placeholder.com/600x300?text=Hospital",
        email: hospital.email || "",
        phone: hospital.phone || "",
      }));
      
      setHospitals(transformedData);
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHospitalCoords = (hospital: Hospital) => {
    if (
      hospital.coords &&
      hospital.coords.latitude &&
      hospital.coords.longitude &&
      hospital.coords.latitude !== 0 &&
      hospital.coords.longitude !== 0
    ) {
      return hospital.coords;
    }
    // Use normalized city name for lookup
    return getCoordsByCity(hospital.city);
  };

  // filter + compute distance
  const byDistance = useMemo(() => {
    // Validate user coordinates first
    if (!userCoords || !userCoords.latitude || !userCoords.longitude) {
      console.warn('Invalid user coordinates, cannot calculate distances');
      return hospitals
        .filter((h) => h.city === city)
        .map((h) => ({ ...h, distanceKm: null }));
    }

    const { latitude: uLat, longitude: uLon } = userCoords;

    // Additional validation for user coordinates
    if (uLat === 0 && uLon === 0) {
      console.warn('User coordinates are (0,0), cannot calculate distances');
      return hospitals
        .filter((h) => h.city === city)
        .map((h) => ({ ...h, distanceKm: null }));
    }

    if (uLat < -90 || uLat > 90 || uLon < -180 || uLon > 180) {
      console.warn('User coordinates are out of valid bounds, cannot calculate distances');
      return hospitals
        .filter((h) => h.city === city)
        .map((h) => ({ ...h, distanceKm: null }));
    }

    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      // Validate coordinates
      if (!lat1 || !lon1 || !lat2 || !lon2) {
        return null;
      }
      
      // Check if coordinates are valid (not 0,0 and within reasonable bounds)
      if (lat1 === 0 && lon1 === 0) return null;
      if (lat2 === 0 && lon2 === 0) return null;
      if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) return null;
      if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) return null;
      
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return hospitals
      .filter((h) => h.city === city)
      .map((h) => {
        const distance = haversine(uLat, uLon, h.coords.latitude, h.coords.longitude);
        return {
          ...h,
          distanceKm: distance !== null ? distance : null,
        };
      })
      .filter((h) => h.distanceKm !== null) // Filter out hospitals with invalid coordinates
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [city, userCoords, hospitals]);

  const renderItem = ({ item }: { item: Hospital & { distanceKm: number | null } }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("HospitalDetails", { hospital: item })}
    >
      {/* Distance Badge - Only show if distance is valid and reasonable */}
      {item.distanceKm !== null && item.distanceKm > 0 && (
        <View style={styles.distanceBadgeWrapper}>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={14} color="#00796b" />
            <Text style={styles.distanceBadgeText}>
              {item.distanceKm < 1 
                ? `${(item.distanceKm * 1000).toFixed(0)}m`
                : `${item.distanceKm.toFixed(1)}km`
              }
            </Text>
          </View>
        </View>
      )}

      <View style={styles.imageContainer}>
        <Image
          source={{ 
            uri: item.imageUrl || getPlaceholderImageUrl(item.name.substring(0, 20))
          }}
          style={styles.hospitalImage}
          resizeMode="cover"
          defaultSource={{ uri: getPlaceholderImageUrl('Loading...') }}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        {item.city && (
          <Text style={styles.district} numberOfLines={1}>
            {item.city} District
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00796b" />
        <Text style={styles.loadingText}>Loading hospitals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={byDistance}
        keyExtractor={(h) => h.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hospitals found in this district.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginLeft: 15,
    zIndex: 1000, // Ensure it's above other elements
    padding: 8, // Add padding for better touch target
    borderRadius: 20, // Rounded touch area
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
  },
  screen: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  list: {
    padding: 15,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#e9f5f9',
  },
  hospitalImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a3c34",
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: "#00796b",
    fontWeight: '500',
    marginBottom: 2,
  },
  district: {
    fontSize: 13,
    color: "#7f8c8d",
  },
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f0f4f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  distanceBadgeWrapper: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 60,
  },
  distanceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00796b',
  },
});
