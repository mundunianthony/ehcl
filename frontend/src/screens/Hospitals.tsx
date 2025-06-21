// screens/HospitalsScreen.tsx

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScrollableScreen from "../components/ScrollableScreen";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { useAuth } from "../context/AuthContext";
import axios from 'axios';

import { Hospital, RootStackParamList, User } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { hospitalAPI } from "../services/api";
import { createSystemNotification, createEmergencyNotification, createEmergencyNotificationForUserAndStaff } from "../services/notificationService";
import { cityCoords, getCoordsByCity } from '../utils/cityCoords';
import { api } from '../services/api';

type NavProp = StackNavigationProp<RootStackParamList, "Hospitals">;

type HospitalsScreenProps = {
  route: {
    params?: {
      district?: string;
      condition?: string;
      emergency?: string;
      ambulance?: string;
      pharmacy?: string;
      lab?: string;
      userCoords?: { latitude: number; longitude: number };
    };
  };
};

// Define API response types
type ApiResponse = 
  | Hospital[] 
  | { data: Hospital[] } 
  | { results: Hospital[] } 
  | { data: { results: Hospital[] } };

// Helper function to extract hospitals from API response
const extractHospitalsFromResponse = (response: ApiResponse): Hospital[] => {
  if (Array.isArray(response)) {
    return response;
  } else if (response && typeof response === 'object') {
    const responseObj = response as Record<string, any>;
    
    if (Array.isArray(responseObj.data)) {
      return responseObj.data;
    } else if (Array.isArray(responseObj.results)) {
      return responseObj.results;
    } else if (responseObj.data && Array.isArray(responseObj.data.results)) {
      return responseObj.data.results;
    }
  }
  return [];
};

export default function Hospitals({ route }: HospitalsScreenProps) {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  
  // Debug log the entire user object with all properties
  React.useEffect(() => {
    if (user) {
      console.log('=== USER OBJECT ===');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('is_staff:', user.is_staff);
      console.log('is_admin:', user.is_admin);
      console.log('Full user object:', JSON.stringify(user, null, 2));
      
      // Log admin status
      const isAdmin = user.is_admin || user.is_staff;
      console.log('=== ADMIN STATUS ===');
      console.log('Final is_admin value:', isAdmin);
      console.log('Button will be:', isAdmin ? 'VISIBLE' : 'HIDDEN');
    } else {
      console.log('No user logged in');
    }
  }, [user]);

  // Determine if user is admin (check both is_admin and is_staff for backward compatibility)
  const isAdmin = user?.is_admin || user?.is_staff;
  
  // Debug effect to track changes
  useEffect(() => {
    console.log('--- Button State Update ---');
    console.log('Current is_staff:', user?.is_staff);
    console.log('Current is_admin:', user?.is_admin);
    console.log('Button visibility:', isAdmin ? 'SHOWING' : 'HIDDEN');
  }, [isAdmin, user?.is_staff, user?.is_admin]);
  
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentCity, setCurrentCity] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Add state to track location permission status
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  // State to store all hospitals
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);

  // Service filters state
  const [serviceFilters, setServiceFilters] = useState({
    emergency: false,
    ambulance: false,
    pharmacy: false,
    lab: false,
  });

  // Add pendingFilters state to store temporary filter selections
  const [pendingFilters, setPendingFilters] = useState({
    city: currentCity,
    services: { ...serviceFilters }
  });

  // When opening the filter modal, sync pendingFilters with current filters
  useEffect(() => {
    if (filterModalVisible) {
      setPendingFilters({
        city: currentCity,
        services: { ...serviceFilters }
      });
    }
  }, [filterModalVisible]);

  // Handler for changing city in the modal
  const handlePendingCityChange = (city: string) => {
    setPendingFilters(prev => ({ ...prev, city }));
  };

  // Handler for changing service filters in the modal
  const handlePendingServiceChange = (service: string, value: boolean) => {
    setPendingFilters(prev => ({
      ...prev,
      services: { ...prev.services, [service]: value }
    }));
  };

  // Handler for applying filters
  const handleApplyFilters = () => {
    setCurrentCity(pendingFilters.city);
    setServiceFilters(pendingFilters.services);
    setFilterModalVisible(false);
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    console.log('Calculating distance between:', { lat1, lon1, lat2, lon2 });
    
    // Validate coordinates
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.log('Distance calculation failed: Missing coordinates');
      return null;
    }
    
    // Check if coordinates are valid (not 0,0 and within reasonable bounds)
    if (lat1 === 0 && lon1 === 0) {
      console.log('Distance calculation failed: User location is 0,0');
      return null;
    }
    if (lat2 === 0 && lon2 === 0) {
      console.log('Distance calculation failed: Hospital location is 0,0');
      return null;
    }
    if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
      console.log('Distance calculation failed: Invalid latitude values');
      return null;
    }
    if (lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180) {
      console.log('Distance calculation failed: Invalid longitude values');
      return null;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    console.log('Distance calculated successfully:', distance.toFixed(2) + 'km');
    return distance;
  };

  // Fetch hospitals with filters when component mounts or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching hospitals with filters...', route.params);
        // Get filter params from route
        const {
          district,
          condition,
          emergency,
          ambulance,
          pharmacy,
          lab,
        } = route.params || {};

        // Fetch all hospitals
        const response = await hospitalAPI.getAll() as ApiResponse;
        let hospitals = extractHospitalsFromResponse(response);

        // If a specific district is selected (not 'All'), filter hospitals by district
        const filteredByDistrict = district && district !== 'All'
          ? hospitals.filter((h: Hospital) => h.city?.toLowerCase() === district.toLowerCase())
          : hospitals;

        // Assign coords to each hospital
        const hospitalsWithCoords = filteredByDistrict.map((h: Hospital) => ({
          ...h,
          coords: getHospitalCoords(h)
        }));
        setHospitals(hospitalsWithCoords);
        setAllHospitals(hospitalsWithCoords);
        
        // Send location-based notification if we have user location and hospitals
        if (user?.email && userLocation && hospitals.length > 0) {
          try {
            // Calculate distances and find nearby hospitals
            const nearbyHospitals = hospitals
              .filter((hospital: Hospital) => (hospital.distance ?? null) !== null && (hospital.distance ?? 0) <= 10) // Within 10km
              .slice(0, 3); // Top 3 closest
            
            if (nearbyHospitals.length > 0) {
              const closestHospital = nearbyHospitals[0];
              const emergencyHospitals = nearbyHospitals.filter((h: Hospital) => h.is_emergency);
              
              if (emergencyHospitals.length > 0) {
                // Emergency notification for emergency hospitals (sent to user and all staff)
                await createEmergencyNotificationForUserAndStaff(
                  user.email,
                  'Emergency Hospitals Nearby',
                  `${emergencyHospitals.length} emergency hospital(s) found within ${closestHospital.distance ? closestHospital.distance.toFixed(1) : 'unknown'}km of your location.`,
                  {
                    user_location: userLocation,
                    nearby_hospitals: emergencyHospitals.map((h: Hospital) => ({
                      id: h.id,
                      name: h.name,
                      distance: h.distance,
                      city: h.city
                    })),
                    total_nearby: nearbyHospitals.length
                  }
                );
              } else {
                // Regular notification for non-emergency hospitals
                await createSystemNotification(
                  user.email,
                  'Hospitals Nearby',
                  `${nearbyHospitals.length} hospital(s) found within ${closestHospital.distance ? closestHospital.distance.toFixed(1) : 'unknown'}km of your location.`
                );
              }
            }
          } catch (error) {
            console.error('Failed to send location-based notification:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        // Set empty array on error to prevent UI errors
        setHospitals([]);
      }
    };
    
    fetchData();
  }, [route.params]);
  
  // Filter hospitals based on search, district, and service filters
  const filteredHospitals = useMemo(() => {
    return allHospitals.filter(hospital => {
      // Apply search filter
      const matchesSearch = !search || 
        hospital.name.toLowerCase().includes(search.toLowerCase()) ||
        (hospital.description && hospital.description.toLowerCase().includes(search.toLowerCase())) ||
        (hospital.address && hospital.address.toLowerCase().includes(search.toLowerCase())) ||
        (hospital.specialties && hospital.specialties.toLowerCase().includes(search.toLowerCase())) ||
        (hospital.conditions_treated && hospital.conditions_treated.toLowerCase().includes(search.toLowerCase()));
      
      // Apply district filter
      const matchesDistrict = !currentCity || 
        hospital.city?.toLowerCase() === currentCity.toLowerCase();
      
      // Apply service filters
      const matchesServices = 
        (!serviceFilters.emergency || hospital.is_emergency) &&
        (!serviceFilters.ambulance || hospital.has_ambulance) &&
        (!serviceFilters.pharmacy || hospital.has_pharmacy) &&
        (!serviceFilters.lab || hospital.has_lab);
      
      return matchesSearch && matchesDistrict && matchesServices;
    });
  }, [allHospitals, search, currentCity, serviceFilters]);
  
  // Update displayed hospitals when filters change
  useEffect(() => {
    setHospitals(filteredHospitals);
  }, [filteredHospitals]);
  
  // Handle district filter change
  const handleDistrictChange = (city: string) => {
    const value = city === "All" ? '' : city;
    setCurrentCity(value);
    setFilterModalVisible(false); // Close the modal after selection
  };
  
  // Get user location automatically when component mounts
  useEffect(() => {
    console.log('=== GETTING USER LOCATION ===');
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      console.log('=== REQUESTING LOCATION PERMISSION ===');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      
      if (status === "granted") {
        console.log('Permission granted, getting current position...');
        setLocationPermissionDenied(false); // Reset permission denied state
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log('Location obtained:', {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy
        });
        
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        console.log('User location set successfully');
      } else {
        console.log('Location permission denied');
        setLocationPermissionDenied(true); // Set permission denied state
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to see distances to hospitals.',
          [
            { text: 'OK', onPress: () => console.log('User acknowledged location requirement') }
          ]
        );
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationPermissionDenied(true); // Set permission denied state on error
      Alert.alert(
        'Location Error',
        'Unable to get your location. Distance information will not be available.',
        [
          { text: 'OK', onPress: () => console.log('User acknowledged location error') }
        ]
      );
    }
  };

  // List of all Ugandan districts for the filter
  const allCities = useMemo(() => [
    "All",
    "Abim", "Adjumani", "Agago", "Alebtong", "Amolatar", "Amudat", "Amuria", "Amuru", "Apac", "Arua",
    "Budaka", "Bududa", "Bugiri", "Buhweju", "Buikwe", "Bukedea", "Bukomansimbi", "Bukwo", "Bulambuli",
    "Buliisa", "Bundibugyo", "Bunyangabu", "Bushenyi", "Busia", "Butaleja", "Butambala", "Butebo", "Buvuma",
    "Buyende", "Dokolo", "Gomba", "Gulu", "Hoima", "Ibanda", "Iganga", "Isingiro", "Jinja", "Kaabong",
    "Kabale", "Kabarole", "Kaberamaido", "Kagadi", "Kakumiro", "Kalangala", "Kaliro", "Kalungu", "Kampala",
    "Kamuli", "Kamwenge", "Kanungu", "Kapchorwa", "Karenga", "Kasese", "Katakwi", "Kayunga", "Kazo",
    "Kibale", "Kiboga", "Kibuku", "Kikuube", "Kiruhura", "Kiryandongo", "Kisoro", "Kitagwenda", "Kitgum",
    "Koboko", "Kole", "Kotido", "Kumi", "Kwania", "Kween", "Kyankwanzi", "Kyegegwa", "Kyenjojo", "Kyotera",
    "Lamwo", "Lira", "Luuka", "Luwero", "Lwengo", "Lyantonde", "Madi-Okollo", "Manafwa", "Maracha",
    "Masaka", "Masindi", "Mayuge", "Mbale", "Mbarara", "Mitooma", "Mityana", "Moroto", "Moyo", "Mpigi",
    "Mubende", "Mukono", "Nabilatuk", "Nakapiripirit", "Nakaseke", "Nakasongola", "Namayingo", "Namisindwa",
    "Namutumba", "Napak", "Nebbi", "Ngora", "Ntoroko", "Ntungamo", "Nwoya", "Omoro", "Otuke", "Oyam",
    "Pader", "Pakwach", "Pallisa", "Rakai", "Rubanda", "Rubirizi", "Rukiga", "Rukungiri", "Rwampara",
    "Sembabule", "Serere", "Sheema", "Sironko", "Soroti", "Tororo", "Wakiso", "Yumbe", "Zombo"
  ].sort((a, b) => a === "All" ? -1 : a.localeCompare(b)), []);

  // Extract unique districts from the fetched hospitals and combine with the full list
  const cities = useMemo(() => {
    if (hospitals.length === 0) return allCities;
    
    // Get unique districts from the current filtered list
    const hospitalCities = new Set(hospitals.map((h) => h.city));
    
    // Combine with the full list and remove duplicates
    const combined = new Set([...allCities, ...hospitalCities]);
    
    // Convert to array, sort, and ensure "All" is first
    const sorted = Array.from(combined).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    });
    
    return sorted;
  }, [hospitals, allCities]);

  // The list is now directly from the API response with filtering

  const handleFilterChange = (filterName: string, value: string) => {
    // Update the appropriate filter state based on the filter name
    if (filterName === 'city') {
      setCurrentCity(value);
    }
    // Add more filter types here if needed
    
    // Trigger a refetch of the data with the new filters
    fetchHospitalsWithFilters();
  };

  const handleDistrictSelect = (city: string) => {
    handleFilterChange('city', city === "All" ? '' : city);
  };
  
  const fetchHospitalsWithFilters = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching hospitals from API...');
      
      // Fetch hospitals from the API
      const response = await hospitalAPI.getAll() as ApiResponse;
      console.log('API Response:', response);
      
      // Process the response to extract the hospitals array
      const hospitals = extractHospitalsFromResponse(response);
      
      console.log('Processed hospitals:', hospitals);
      
      // Start with the fetched hospitals
      // Assign coords to each hospital
      const hospitalsWithCoords = hospitals.map((h: Hospital) => ({
        ...h,
        coords: getHospitalCoords(h)
      }));
      setHospitals(hospitalsWithCoords);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to fetch hospitals. Please try again.');
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

  const HospitalItem = ({ item }: { item: Hospital & { distance?: number | null } }) => {
    // Use pre-calculated distance or calculate if not available
    const distance = item.distance !== undefined ? item.distance : 
      (userLocation && item.coords && 
       item.coords.latitude !== 0 && item.coords.longitude !== 0 &&
       userLocation.latitude !== 0 && userLocation.longitude !== 0 ? 
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.coords.latitude,
          item.coords.longitude
        ) : null);

    console.log(`HospitalItem ${item.name}:`, {
      distance,
      userLocation,
      hospitalCoords: item.coords,
      willShowBadge: distance !== null && distance > 0
    });

    // Count available services
    const availableServices = [
      item.is_emergency,
      item.has_ambulance,
      item.has_pharmacy,
      item.has_lab,
    ].filter(Boolean).length;

    return (
      <TouchableOpacity
        style={styles.hospitalCard}
        onPress={() => navigation.navigate("HospitalDetails", { hospital: item })}
      >
        {/* Absolutely positioned distance badge */}
        {distance !== null && distance > 0 ? (
          <View style={styles.distanceBadgeWrapper}>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={14} color="#00796b" />
              <Text style={styles.distanceText}>
                {distance < 1 
                  ? `${(distance * 1000).toFixed(0)}m`
                  : `${distance.toFixed(1)}km`
                }
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.distanceBadgeWrapper}>
            <View style={styles.distanceBadge}>
              <Ionicons name="location-outline" size={14} color="#b0b0b0" />
              <Text style={[styles.distanceText, { color: '#b0b0b0' }]}>Location unavailable</Text>
            </View>
          </View>
        )}
        <View style={styles.hospitalInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.hospitalName} numberOfLines={1}>{item.name}</Text>
          </View>

          <View style={styles.serviceBadges}>
            {item.is_emergency && (
              <View style={[styles.badge, styles.emergencyBadge]}>
                <Ionicons name="pulse" size={12} color="#fff" />
                <Text style={styles.badgeText}>24/7</Text>
              </View>
            )}
            {item.has_ambulance && (
              <View style={[styles.badge, styles.ambulanceBadge]}>
                <Ionicons name="car" size={12} color="#fff" />
                <Text style={styles.badgeText}>Ambulance</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.district} numberOfLines={1}>{item.city}</Text>
          </View>

          <Text style={styles.address} numberOfLines={2}>{item.address || 'No address provided'}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="medical" size={16} color="#00796b" />
              <Text style={styles.infoText}>{availableServices} Services</Text>
            </View>
            {item.conditions_treated && (
              <View style={styles.infoItem}>
                <Ionicons name="list" size={16} color="#00796b" />
                <Text style={styles.infoText}>
                  {item.conditions_treated.split(',').length} Conditions
                </Text>
              </View>
            )}
          </View>
    
          <View style={styles.contactContainer}>
            {item.phone && (
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="call" size={16} color="#00796b" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            )}
            {item.email && (
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="mail" size={16} color="#00796b" />
                <Text style={styles.contactButtonText}>Email</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Debug effect to track user location changes
  useEffect(() => {
    console.log('=== USER LOCATION DEBUG ===');
    console.log('User location:', userLocation);
    console.log('Hospitals with distances:', hospitals.map(h => ({
      name: h.name,
      distance: h.distance ?? null,
      coords: h.coords,
      willShowBadge: (h.distance ?? null) !== null && (h.distance ?? 0) > 0
    })));
    console.log('Total hospitals with valid distances:', hospitals.filter(h => (h.distance ?? null) !== null && (h.distance ?? 0) > 0).length);
  }, [userLocation, hospitals]);

  // Debug effect to log hospitals with missing city coordinates
  useEffect(() => {
    if (hospitals.length > 0) {
      const missingCities = hospitals
        .filter(h => {
          const coords = getCoordsByCity(h.city);
          return !coords || coords.latitude === 0 || coords.longitude === 0;
        })
        .map(h => h.city);
      if (missingCities.length > 0) {
        console.warn('Cities missing from cityCoords mapping:', missingCities);
      }
    }
  }, [hospitals]);

  // Add state for districts and loading
  const [districts, setDistricts] = useState<Array<{label: string, value: string}>>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);

  // Fetch districts from backend when filter modal opens
  useEffect(() => {
    if (filterModalVisible) {
      setDistrictsLoading(true);
      api.get('api/available-districts/')
        .then(res => {
          if (res.data && res.data.success && Array.isArray(res.data.districts)) {
            const formattedDistricts = res.data.districts.map((district: string) => ({
              label: district,
              value: district
            }));
            setDistricts([{ label: 'All', value: '' }, ...formattedDistricts]);
          } else {
            setDistricts([{ label: 'All', value: '' }]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch districts:', err);
          setDistricts([{ label: 'All', value: '' }]);
        })
        .finally(() => setDistrictsLoading(false));
    }
  }, [filterModalVisible]);

  return (
    <View style={styles.screen}>
      {/* Search and Filter Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hospitals..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearch}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerButtons}>
          {userLocation && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getLocation}
            >
              <Ionicons name="refresh" size={20} color="#00796b" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsCount}>
            {loading ? 'Loading...' : `${hospitals.length} hospitals found`}
          </Text>
          {userLocation && (
            <View style={styles.locationStatus}>
              <Ionicons name="location" size={16} color="#00796b" />
              <Text style={styles.locationStatusText}>Sorted by distance</Text>
            </View>
          )}
        </View>
        
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddLocation', {})}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Hospital</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Location Permission Banner */}
      {locationPermissionDenied && !userLocation && (
        <View style={styles.locationPermissionBanner}>
          <View style={styles.locationPermissionContent}>
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.locationPermissionText}>
              Enable location to see distances to hospitals
            </Text>
          </View>
          <TouchableOpacity
            style={styles.locationPermissionButton}
            onPress={getLocation}
          >
            <Text style={styles.locationPermissionButtonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hospital List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Loading hospitals...</Text>
        </View>
      ) : hospitals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Hospitals Found</Text>
          <Text style={styles.emptyMessage}>
            {currentCity ? 
              `No hospitals found in ${currentCity}.` : 
              `No hospitals match your search criteria.`
            }
          </Text>
          {currentCity && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => setCurrentCity('')}
            >
              <Text style={styles.clearFilterText}>Clear District Filter</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={hospitals}
          renderItem={({ item }) => <HospitalItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Hospitals</Text>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* District Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>District</Text>
                <View style={styles.districtPicker}>
                  <Picker
                    selectedValue={pendingFilters.city}
                    onValueChange={handlePendingCityChange}
                    style={[styles.picker, { width: '100%' }]}
                  >
                    {districtsLoading ? (
                      <Picker.Item label="Loading..." value="" />
                    ) : (
                      districts.map((item) => (
                        <Picker.Item key={item.value || item.label} label={item.label} value={item.value} />
                      ))
                    )}
                  </Picker>
                </View>
              </View>

              {/* Service Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Available Services</Text>
                <View style={styles.serviceFilters}>
                  <TouchableOpacity
                    style={[styles.serviceFilter, pendingFilters.services.emergency && styles.serviceFilterActive]}
                    onPress={() => handlePendingServiceChange('emergency', !pendingFilters.services.emergency)}
                  >
                    <Ionicons name="pulse" size={20} color={pendingFilters.services.emergency ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, pendingFilters.services.emergency && styles.serviceFilterTextActive]}>
                      24/7 Emergency
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, pendingFilters.services.ambulance && styles.serviceFilterActive]}
                    onPress={() => handlePendingServiceChange('ambulance', !pendingFilters.services.ambulance)}
                  >
                    <Ionicons name="car" size={20} color={pendingFilters.services.ambulance ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, pendingFilters.services.ambulance && styles.serviceFilterTextActive]}>
                      Ambulance
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, pendingFilters.services.pharmacy && styles.serviceFilterActive]}
                    onPress={() => handlePendingServiceChange('pharmacy', !pendingFilters.services.pharmacy)}
                  >
                    <Ionicons name="medkit" size={20} color={pendingFilters.services.pharmacy ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, pendingFilters.services.pharmacy && styles.serviceFilterTextActive]}>
                      Pharmacy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, pendingFilters.services.lab && styles.serviceFilterActive]}
                    onPress={() => handlePendingServiceChange('lab', !pendingFilters.services.lab)}
                  >
                    <Ionicons name="flask" size={20} color={pendingFilters.services.lab ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, pendingFilters.services.lab && styles.serviceFilterTextActive]}>
                      Laboratory
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearSearch: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#00796b',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 8,
  },
  locationStatusText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  hospitalInfo: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3c34',
    flex: 1,
    marginRight: 8,
  },
  serviceBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emergencyBadge: {
    backgroundColor: '#dc3545',
  },
  ambulanceBadge: {
    backgroundColor: '#28a745',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
  },
  district: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#1a3c34',
    fontWeight: '600',
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  contactButtonText: {
    color: '#00796b',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  clearFilterButton: {
    backgroundColor: '#00796b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    maxHeight: '70%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  districtPicker: {
    width: '100%',
    marginBottom: 12,
  },
  picker: {
    width: '100%',
  },
  serviceFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  serviceFilterActive: {
    backgroundColor: '#00796b',
  },
  serviceFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  serviceFilterTextActive: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#00796b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  distanceBadgeWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  distanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00796b',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00796b',
  },
  locationPermissionBanner: {
    backgroundColor: '#00796b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationPermissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationPermissionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationPermissionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  locationPermissionButtonText: {
    color: '#00796b',
    fontSize: 14,
    fontWeight: '600',
  },
});