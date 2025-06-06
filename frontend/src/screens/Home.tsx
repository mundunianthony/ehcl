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
import Navbar from "../components/Navbar";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { API_URL } from '../config/api';

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

  // Get user from auth context
  const { user } = useAuth();

  // Fetch available districts when component mounts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        console.log('Fetching districts from:', `${API_URL}available-districts/`);
        const response = await fetch(`${API_URL}available-districts/`);
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

  // Get user initials from name
  const getInitials = (name: string) => {
    // If name is available, use its initials
    if (name && name.trim() !== '') {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    // Otherwise, use the first letter of the email
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    // Fallback to 'U' for User
    return 'U';
  };

  const getUserInitial = () => {
    // If user has a first name, use the first letter
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    // Otherwise, use the first letter of the email
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    // Fallback to 'U' for User
    return 'U';
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
      {/* Use ScrollView to prevent content overflow on smaller screens */}
      <ScrollView 
        style={styles.screen} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Avatar in Upper Right Corner */}
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.navigate("About")}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileText}>
              {getUserInitial()}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Icon name="medkit-outline" size={36} color="#00796b" style={styles.headerIcon} />
          <Text style={styles.header}>Find Hospitals Near You</Text>
        </View>

        {/* Input Fields */} 
        {renderPickerField("Select District...", district, 'district')}
        {renderPickerField("Filter by Condition (Optional)...", condition, 'condition')}
        
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
            {/* Removed redundant header inside the container */}
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

        {/* Search Button with Loading State */}
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
    </MainLayout>
  );
}

// ==========================================
//          STYLESHEET (Improved)
// ==========================================
const styles = StyleSheet.create({
  // --- Base Layout --- 
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa", // Lighter, cleaner background
  },
  contentContainer: { // Use contentContainerStyle for ScrollView padding
    paddingHorizontal: 20, // Consistent horizontal padding
    paddingVertical: 24, // Vertical padding
    paddingTop: Platform.OS === 'ios' ? 70 : 60, // More space for status bar/notch + profile icon
    paddingBottom: 40, // Ensure space below button
  },

  // --- Profile Icon --- 
  profileContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40, // Positioned relative to screen top
    right: 20,
    zIndex: 10, // Ensure it's above other content
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Perfect circle
    backgroundColor: "#00796b", // Primary color
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  profileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // --- Header --- 
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24, // Space below header
    marginTop: 10, // Space above header (below profile icon)
  },
  headerIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 24, // Prominent header text
    fontWeight: "600",
    color: "#343a40", // Darker text for better readability
    textAlign: "center",
  },

  // --- Picker/Input Fields --- 
  pickerContainer: {
    flexDirection: 'row', // Layout for text/icon and clear button
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da", // Standard border color
    marginBottom: 16, // Space between fields
    height: 52, // Consistent height
    paddingHorizontal: 12, // Inner horizontal padding
    elevation: 1, // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pickerField: { // Container for the text and dropdown icon
    flex: 1, // Take up available space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8, // Space before the clear button
    overflow: 'hidden', // Prevent text overlap
  },
  pickerText: {
    fontSize: 16,
    color: '#212529', // Main text color
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#6c757d', // Standard placeholder color
  },
  clearButton: {
    padding: 5, // Make touch target larger with hitSlop
  },

  // --- Filter Toggle --- 
  toggleFiltersButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e9ecef', // Light background for secondary action
    borderRadius: 8,
    marginVertical: 16, // Space above and below
    alignSelf: 'center', // Center the button horizontally
  },
  toggleFiltersText: {
    color: '#00796b', // Primary color text
    fontWeight: '500',
    fontSize: 15,
  },
  toggleIcon: {
    marginLeft: 8,
  },

  // --- Advanced Filters --- 
  advancedFiltersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20, // Space below filters
    borderWidth: 1,
    borderColor: '#e9ecef', // Light border
  },
  advancedFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057', // Slightly muted title color
    marginBottom: 12,
  },
  serviceFiltersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // Spacing between filter buttons
  },
  serviceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1', // Very light primary color background
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    borderWidth: 1,
    borderColor: 'transparent', // No border by default
  },
  serviceFilterActive: {
    backgroundColor: '#00796b', // Primary color background when active
    borderColor: '#00796b',
  },
  serviceFilterText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#004d40', // Darker primary color text
    fontWeight: '500',
  },
  serviceFilterTextActive: {
    color: '#fff', // White text when active
  },

  // --- Main Action Button --- 
  button: {
    backgroundColor: "#00796b", // Primary color
    height: 52, // Match input field height
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // Standard button shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 8, // Space above button
    width: '100%', // Full width button
  },
  buttonDisabled: {
    backgroundColor: '#b2dfdb', // Lighter, disabled primary color
    elevation: 0, // No shadow when disabled
  },
  buttonLoading: {
    backgroundColor: '#00796b',
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

  // --- Modal Styles --- 
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%', // Limit modal height
    backgroundColor: 'white',
    borderRadius: 12, // Slightly larger radius
    overflow: 'hidden',
    elevation: 10, // More prominent shadow for modal
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalScrollView: {
    // Inherits max height from modalContent
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5', // Lighter separator
  },
  modalItemText: {
    fontSize: 16,
    color: '#343a40',
  },
  modalCloseButton: {
    paddingVertical: 16,
    backgroundColor: '#f8f9fa', // Light background for close button area
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef', // Match light borders
  },
  modalCloseButtonText: {
    color: '#00796b', // Primary color
    fontSize: 16,
    fontWeight: '600',
  },
});

