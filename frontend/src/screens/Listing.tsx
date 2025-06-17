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

// navigation props
type ListingNavProp = StackNavigationProp<RootStackParamList, "HospitalList">;
type ListingRouteProp = RouteProp<RootStackParamList, "HospitalList">;

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
  const { district, userCoords } = route.params;
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
        district: hospital.city || "Unknown", // Using city as district
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

  // filter + compute distance
  const byDistance = useMemo(() => {
    const { latitude: uLat, longitude: uLon } = userCoords;

    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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
      .filter((h) => h.district === district)
      .map((h) => ({
        ...h,
        distanceKm: haversine(uLat, uLon, h.coords.latitude, h.coords.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [district, userCoords, hospitals]);

  const renderItem = ({ item }: { item: Hospital & { distanceKm: number } }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("HospitalDetails", { hospital: item })}
    >
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
        <Text style={styles.distance}>
          {item.distanceKm.toFixed(1)} km away
        </Text>
        {item.district && (
          <Text style={styles.district} numberOfLines={1}>
            {item.district} District
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
});
