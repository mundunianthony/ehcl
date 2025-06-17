import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/MainLayout";
import { API_URL } from '../config/api';
import { useNavigation } from "@react-navigation/native";
import IconMaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
  route: any;
};

type ServiceFilters = {
  emergency: boolean;
  ambulance: boolean;
  pharmacy: boolean;
  lab: boolean;
};

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const [condition, setCondition] = useState("");
  const [district, setDistrict] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true); // Show by default
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<Array<{label: string, value: string}>>([]);
  const [filters, setFilters] = useState<ServiceFilters>({
    emergency: false,
    ambulance: false,
    pharmacy: false,
    lab: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Get user from auth context
  const { user } = useAuth();

  // Helper to get user initial
  const getUserInitial = () => {
    if (user?.name && user.name.length > 0) return user.name[0].toUpperCase();
    if (user?.email && user.email.length > 0) return user.email[0].toUpperCase();
    return 'U';
  };

  // Fetch available districts when component mounts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        console.log('Fetching districts from:', `${API_URL}/available-districts/`);
        const response = await fetch(`${API_URL}/available-districts/`);
        if (response.ok) {
          const districts = await response.json();
          console.log('Received districts:', districts);
          // Convert the array of district names to the format needed for the picker
          const formattedDistricts = districts.map((district: string) => ({
            label: district,
            value: district
          }));
          console.log('Formatted districts:', formattedDistricts);
          setAvailableDistricts(formattedDistricts);
        } else {
          console.error('Failed to fetch districts:', response.status);
          // Add default districts if fetch fails
          setAvailableDistricts([
            { label: "Kampala", value: "Kampala" },
            { label: "Mubende", value: "Mubende" }
          ]);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        // Add default districts if fetch fails
        setAvailableDistricts([
          { label: "Kampala", value: "Kampala" },
          { label: "Mubende", value: "Mubende" }
        ]);
      }
    };

    fetchDistricts();
  }, []);

  const onSubmit = async () => {
    if (!district) {
      return Alert.alert("Please select a district.");
    }
    
    setIsLoading(true); // Start loading
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLoading(false); // Stop loading
        return Alert.alert("Permission to access location was denied");
      }
      
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({});
      
      const queryParams: Record<string, string> = {
        district,
        ...(condition && { condition }),
        ...(filters.emergency && { emergency: 'true' }),
        ...(filters.ambulance && { ambulance: 'true' }),
        ...(filters.pharmacy && { pharmacy: 'true' }),
        ...(filters.lab && { lab: 'true' }),
      };

      console.log('Navigating to Hospitals with params:', queryParams);
      
      navigation.navigate("Hospitals", {
        ...queryParams,
        userCoords: { latitude, longitude },
      });
    } catch (error) {
      console.error('Error during search:', error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  };

  const getPickerItems = (type: string) => {
    console.log('Getting picker items for type:', type);
    switch (type) {
      case 'district':
        console.log('Returning district items:', availableDistricts);
        return availableDistricts;
      case 'condition':
        return [
          { label: "Malaria", value: "Malaria" },
          { label: "Typhoid", value: "Typhoid" },
          { label: "Chest infection", value: "Chest infection" },
          { label: "Urine infection", value: "Urine infection" },
          { label: "Sugar disease", value: "Sugar disease" },
          { label: "High blood pressure", value: "High blood pressure" },
          { label: "Breathing problems", value: "Breathing problems" },
          { label: "HIV/AIDS", value: "HIV/AIDS" },
          { label: "TB", value: "TB" },
          { label: "Stroke (Poko)", value: "Stroke (Poko)" },
          { label: "Heart pain", value: "Heart pain" },
          { label: "Pregnancy problems", value: "Pregnancy problems" },
          { label: "Broken bones", value: "Broken bones" },
          { label: "Burns", value: "Burns" },
          { label: "Small wounds", value: "Small wounds" },
          { label: "Child sickness", value: "Child sickness" },
          { label: "Skin rashes", value: "Skin rashes" },
          { label: "Eye problems", value: "Eye problems" },
          { label: "Tooth pain", value: "Tooth pain" },
          { label: "Women's health", value: "Women's health" },
          { label: "Ulcers", value: "Ulcers" }
        ];
      default:
        return [];
    }
  };

  const renderPickerModal = () => (
    <Modal
      visible={!!activePicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setActivePicker(null)}
    >
      <TouchableWithoutFeedback onPress={() => setActivePicker(null)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <ScrollView style={styles.modalScrollView}>
                {activePicker && getPickerItems(activePicker).map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.modalItem}
                    onPress={() => {
                      if (activePicker === 'district') {
                        console.log('Selected district:', item.value);
                        setDistrict(item.value);
                      }
                      else if (activePicker === 'condition') setCondition(item.value);
                      setActivePicker(null);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setActivePicker(null)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderPickerField = (title: string, value: string, type: string) => (
    <TouchableOpacity
      style={styles.pickerContainer}
      onPress={() => setActivePicker(type)}
    >
      <View style={styles.pickerField}>
        <Text style={value ? styles.pickerText : styles.pickerPlaceholder} numberOfLines={1} ellipsizeMode="tail">
          {value || title}
        </Text>
        <Icon name="chevron-down" size={20} color="#6c757d" />
      </View>
      {value && (
        <TouchableOpacity
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
          onPress={(e) => {
            e.stopPropagation();
            if (type === 'district') setDistrict('');
            else if (type === 'condition') setCondition('');
          }}
        >
          <Icon name="close-circle" size={18} color="#adb5bd" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Add debug logging for districts
  useEffect(() => {
    console.log('Available districts:', availableDistricts);
  }, [availableDistricts]);

  return (
    <MainLayout navigation={navigation} route={route}>
      <ScrollView 
        style={styles.screen} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Bar with Menu and Notification */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <IconMaterialCommunity name="menu" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.topBarTitle}>
            <Text style={styles.topBarTitleText}>Health Center Locator</Text>
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Icon name="medkit-outline" size={36} color="#00796b" style={styles.headerIcon} />
          <Text style={styles.header}>Find Hospitals Near You</Text>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          {renderPickerField("Select District...", district, 'district')}
          {renderPickerField("Filter by Condition (Optional)...", condition, 'condition')}
        </View>

        {/* Picker Modal */}
        {renderPickerModal()}

        {/* Toggle Filters Button */}
        <TouchableOpacity 
          style={styles.toggleFiltersButton}
          onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Text style={styles.toggleFiltersText}>
            {showAdvancedFilters ? 'Hide Service Filters' : 'Show Service Filters'}
          </Text>
          <Icon 
            name={showAdvancedFilters ? 'chevron-up-outline' : 'chevron-down-outline'} 
            size={20} 
            color="#00796b" 
            style={styles.toggleIcon}
          />
        </TouchableOpacity>

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <View style={styles.advancedFiltersContainer}>
            <Text style={styles.advancedFiltersTitle}>Available Services</Text>
            <View style={styles.serviceFiltersGrid}>
              {/* Service Filter Buttons */}
              <TouchableOpacity
                style={[styles.serviceFilter, filters.emergency && styles.serviceFilterActive]}
                onPress={() => setFilters(prev => ({ ...prev, emergency: !prev.emergency }))}
              >
                <Icon name="pulse-outline" size={18} color={filters.emergency ? '#fff' : '#00796b'} />
                <Text style={[styles.serviceFilterText, filters.emergency && styles.serviceFilterTextActive]}>
                  24/7 Emergency
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.serviceFilter, filters.ambulance && styles.serviceFilterActive]}
                onPress={() => setFilters(prev => ({ ...prev, ambulance: !prev.ambulance }))}
              >
                <Icon name="car-sport-outline" size={18} color={filters.ambulance ? '#fff' : '#00796b'} />
                <Text style={[styles.serviceFilterText, filters.ambulance && styles.serviceFilterTextActive]}>
                  Ambulance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.serviceFilter, filters.pharmacy && styles.serviceFilterActive]}
                onPress={() => setFilters(prev => ({ ...prev, pharmacy: !prev.pharmacy }))}
              >
                <Icon name="medkit-outline" size={18} color={filters.pharmacy ? '#fff' : '#00796b'} />
                <Text style={[styles.serviceFilterText, filters.pharmacy && styles.serviceFilterTextActive]}>
                  Pharmacy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.serviceFilter, filters.lab && styles.serviceFilterActive]}
                onPress={() => setFilters(prev => ({ ...prev, lab: !prev.lab }))}
              >
                <Icon name="flask-outline" size={18} color={filters.lab ? '#fff' : '#00796b'} />
                <Text style={[styles.serviceFilterText, filters.lab && styles.serviceFilterTextActive]}>
                  Laboratory
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Button */}
        <TouchableOpacity 
          style={[
            styles.button, 
            !district && styles.buttonDisabled,
            isLoading && styles.buttonLoading
          ]} 
          onPress={onSubmit}
          disabled={!district || isLoading}
        >
          {isLoading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.buttonText, styles.buttonTextWithLoader]}>
                Searching...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Search Hospitals</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <View style={styles.userInitialContainer}>
                  <Text style={styles.userInitial}>
                    {getUserInitial()}
                  </Text>
                </View>
                <Text style={styles.userName}>{user?.name || user?.email || 'User'}</Text>
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate("Home"); }}>
                <IconMaterialCommunity name="home" size={20} color="#4F46E5" style={styles.menuIcon} />
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate("Hospitals"); }}>
                <IconMaterialCommunity name="hospital" size={20} color="#14B8A6" style={styles.menuIcon} />
                <Text style={styles.menuText}>Hospitals</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate("About"); }}>
                <IconMaterialCommunity name="information" size={20} color="#64748B" style={styles.menuIcon} />
                <Text style={styles.menuText}>About</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate("Login"); }}>
                <IconMaterialCommunity name="logout" size={20} color="#EF4444" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: "#EF4444" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </MainLayout>
  );
}

// ==========================================
//          STYLESHEET (Improved)
// ==========================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  topBarTitle: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuButton: {
    padding: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#343a40",
    textAlign: "center",
  },
  searchSection: {
    marginBottom: 20,
  },
  filtersSection: {
    marginBottom: 24,
  },
  toggleFiltersButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 16,
  },
  toggleFiltersText: {
    color: '#00796b',
    fontWeight: '500',
    fontSize: 15,
  },
  toggleIcon: {
    marginLeft: 8,
  },
  advancedFiltersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  advancedFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  serviceFiltersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serviceFilterActive: {
    backgroundColor: '#00796b',
    borderColor: '#00796b',
  },
  serviceFilterText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#004d40',
    fontWeight: '500',
  },
  serviceFilterTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: "#00796b",
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#b2dfdb',
    elevation: 0,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonTextWithLoader: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: '80%',
    maxWidth: 300,
    height: '100%',
    paddingTop: 40,
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userInitialContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    marginBottom: 16,
    height: 52,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pickerField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
    overflow: 'hidden',
  },
  pickerText: {
    fontSize: 16,
    color: '#212529',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#6c757d',
  },
  clearButton: {
    padding: 5,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalItemText: {
    fontSize: 16,
    color: '#343a40',
  },
  modalCloseButton: {
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  modalCloseButtonText: {
    color: '#00796b',
    fontSize: 16,
    fontWeight: '600',
  },
});

