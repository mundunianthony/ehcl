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

import { Hospital, RootStackParamList } from "../types";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAllHospitals } from "../utils/api";

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

export default function Hospitals({ route }: HospitalsScreenProps) {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  
  // Debug log the entire user object with all properties
  React.useEffect(() => {
    console.log('=== USER OBJECT ===');
    console.log('User ID:', user?.id);
    console.log('Email:', user?.email);
    console.log('is_staff:', user?.is_staff);
    console.log('is_admin:', user?.is_admin);
    console.log('isAdmin:', user?.isAdmin);
    console.log('Full user object:', JSON.stringify(user, null, 2));
    
    // Log admin status
    const isAdmin = user?.isAdmin || user?.is_staff || user?.is_admin;
    console.log('=== ADMIN STATUS ===');
    console.log('Final isAdmin value:', isAdmin);
    console.log('Button will be:', isAdmin ? 'VISIBLE' : 'HIDDEN');
  }, [user]);

  // Determine if user is admin (check both isAdmin and is_staff for backward compatibility)
  const isAdmin = user?.isAdmin || user?.is_staff || user?.is_admin;
  
  // Debug effect to track changes
  useEffect(() => {
    console.log('--- Button State Update ---');
    console.log('Current is_staff:', user?.is_staff);
    console.log('Current isAdmin state:', isAdmin);
    console.log('Button visibility:', isAdmin ? 'SHOWING' : 'HIDDEN');
  }, [isAdmin, user?.is_staff]);
  
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentDistrict, setCurrentDistrict] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Filter state - only district
  const [districtFilter, setDistrictFilter] = useState('');

  // State to store all hospitals
  const [allHospitals, setAllHospitals] = useState<Hospital[]>([]);

  // Service filters state
  const [serviceFilters, setServiceFilters] = useState({
    emergency: false,
    ambulance: false,
    pharmacy: false,
    lab: false,
  });

  // Calculate distance between two points using Haversine formula
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
        
        // Fetch hospitals with filters
        const data = await getAllHospitals(
          '', // search term (empty for now)
          district,
          condition,
          emergency === 'true',
          ambulance === 'true',
          pharmacy === 'true',
          lab === 'true'
        );
        
        if (!data) {
          console.warn('No data received from API');
          return;
        }
        
        console.log('API Response:', data);
        
        const transformedData: Hospital[] = data.map((hospital: any) => ({
          id: hospital.id.toString(),
          name: hospital.name,
          district: hospital.city || hospital.district || "Unknown",
          description: hospital.description,
          address: hospital.address,
          coords: {
            latitude: hospital.coords?.latitude || 0,
            longitude: hospital.coords?.longitude || 0,
          },
          imageUrl: hospital.imageUrl || hospital.image || "https://via.placeholder.com/600x300?text=Hospital",
          email: hospital.email || "",
          phone: hospital.phone || "",
          specialties: hospital.specialties,
          conditions_treated: hospital.conditions_treated,
          is_emergency: hospital.is_emergency,
          has_ambulance: hospital.has_ambulance,
          has_pharmacy: hospital.has_pharmacy,
          has_lab: hospital.has_lab,
        }));
        
        setAllHospitals(transformedData);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
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
      const matchesDistrict = !districtFilter || 
        hospital.district?.toLowerCase() === districtFilter.toLowerCase();
      
      // Apply service filters
      const matchesServices = 
        (!serviceFilters.emergency || hospital.is_emergency) &&
        (!serviceFilters.ambulance || hospital.has_ambulance) &&
        (!serviceFilters.pharmacy || hospital.has_pharmacy) &&
        (!serviceFilters.lab || hospital.has_lab);
      
      return matchesSearch && matchesDistrict && matchesServices;
    });
  }, [allHospitals, search, districtFilter, serviceFilters]);
  
  // Update displayed hospitals when filters change
  useEffect(() => {
    setHospitals(filteredHospitals);
  }, [filteredHospitals]);
  
  // Handle district filter change
  const handleDistrictChange = (district: string) => {
    const value = district === "All" ? '' : district;
    setDistrictFilter(value);
    setCurrentDistrict(value || null);
    setFilterModalVisible(false); // Close the modal after selection
  };
  
  
  // Get user location when component mounts
  useEffect(() => {
    getLocation();
  }, []);
  




  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (err) {
      console.error("Error getting location:", err);
    }
  };

  // List of all Ugandan districts for the filter
  const allDistricts = useMemo(() => [
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
  const districts = useMemo(() => {
    if (hospitals.length === 0) return allDistricts;
    
    // Get unique districts from the current filtered list
    const hospitalDistricts = new Set(hospitals.map((h) => h.district));
    
    // Combine with the full list and remove duplicates
    const combined = new Set([...allDistricts, ...hospitalDistricts]);
    
    // Convert to array, sort, and ensure "All" is first
    const sorted = Array.from(combined).sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    });
    
    return sorted;
  }, [hospitals, allDistricts]);

  // The list is now directly from the API response with filtering

  const handleFilterChange = (filterName: string, value: string) => {
    // Update the appropriate filter state based on the filter name
    if (filterName === 'district') {
      setDistrictFilter(value);
    }
    // Add more filter types here if needed
    
    // Trigger a refetch of the data with the new filters
    fetchHospitalsWithFilters();
  };

  const handleDistrictSelect = (district: string) => {
    handleFilterChange('district', district === "All" ? '' : district);
  };
  
  const fetchHospitalsWithFilters = async () => {
    try {
      setLoading(true);
      const data = await getAllHospitals(
        search,
        districtFilter,
        '', // condition
        false, // emergency
        false, // ambulance
        false, // pharmacy
        false  // lab
      );
      setHospitals(data);
      setAllHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to fetch hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const HospitalItem = ({ item }: { item: Hospital }) => {
    // Calculate distance if user location is available
    const distance = userLocation && item.coords ? 
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.coords.latitude,
        item.coords.longitude
      ) : null;

    // Calculate available services count
    const availableServices = [
      item.has_pharmacy && 'Pharmacy',
      item.has_lab && 'Laboratory',
      item.is_emergency && '24/7 Emergency',
      item.has_ambulance && 'Ambulance'
    ].filter(Boolean).length;

    return (
      <TouchableOpacity
        style={styles.hospitalCard}
        onPress={() => navigation.navigate("HospitalDetails", { hospital: item })}
      >
        <View style={styles.hospitalInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.hospitalName} numberOfLines={1}>{item.name}</Text>
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
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.district} numberOfLines={1}>{item.district}</Text>
            {distance !== null && (
              <View style={styles.distanceBadge}>
                <Ionicons name="navigate" size={14} color="#00796b" />
                <Text style={styles.distanceText}>
                  {distance < 1 
                    ? `${(distance * 1000).toFixed(0)}m`
                    : `${distance.toFixed(1)}km`
                  }
                </Text>
              </View>
            )}
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
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading ? 'Loading...' : `${hospitals.length} hospitals found`}
        </Text>
        
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
            {currentDistrict ? 
              `No hospitals found in ${currentDistrict}.` : 
              `No hospitals match your search criteria.`
            }
          </Text>
          {currentDistrict && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => setCurrentDistrict(null)}
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
                    selectedValue={districtFilter}
                    onValueChange={handleDistrictChange}
                    style={styles.picker}
                  >
                    <Picker.Item label="All Districts" value="" />
                    {allDistricts.map((district) => (
                      <Picker.Item key={district} label={district} value={district} />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Service Filters */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Available Services</Text>
                <View style={styles.serviceFilters}>
                  <TouchableOpacity
                    style={[styles.serviceFilter, serviceFilters.emergency && styles.serviceFilterActive]}
                    onPress={() => setServiceFilters(prev => ({ ...prev, emergency: !prev.emergency }))}
                  >
                    <Ionicons name="pulse" size={20} color={serviceFilters.emergency ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, serviceFilters.emergency && styles.serviceFilterTextActive]}>
                      24/7 Emergency
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, serviceFilters.ambulance && styles.serviceFilterActive]}
                    onPress={() => setServiceFilters(prev => ({ ...prev, ambulance: !prev.ambulance }))}
                  >
                    <Ionicons name="car" size={20} color={serviceFilters.ambulance ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, serviceFilters.ambulance && styles.serviceFilterTextActive]}>
                      Ambulance
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, serviceFilters.pharmacy && styles.serviceFilterActive]}
                    onPress={() => setServiceFilters(prev => ({ ...prev, pharmacy: !prev.pharmacy }))}
                  >
                    <Ionicons name="medkit" size={20} color={serviceFilters.pharmacy ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, serviceFilters.pharmacy && styles.serviceFilterTextActive]}>
                      Pharmacy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.serviceFilter, serviceFilters.lab && styles.serviceFilterActive]}
                    onPress={() => setServiceFilters(prev => ({ ...prev, lab: !prev.lab }))}
                  >
                    <Ionicons name="flask" size={20} color={serviceFilters.lab ? '#fff' : '#00796b'} />
                    <Text style={[styles.serviceFilterText, serviceFilters.lab && styles.serviceFilterTextActive]}>
                      Laboratory
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
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
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
    gap: 4,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00796b',
  },
});