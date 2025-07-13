import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Linking,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import WebMapComponent from '../components/WebMapComponent';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList, Hospital } from '../types';
import ScrollableScreen from '../components/ScrollableScreen';
import { getPlaceholderImageUrl, isValidImageUrl } from '../utils/hospitalImages';
import { useAuth } from '../context/AuthContext';
import { createSystemNotification } from '../services/notificationService';
import { cityCoords, getCoordsByCity } from '../utils/cityCoords';
// Remove DatePicker, DateTimePicker, and related imports
import Constants from 'expo-constants';
import CalendarPicker from 'react-native-calendar-picker';
import WheelPickerExpo from 'react-native-wheel-picker-expo';
import { StackNavigationProp } from '@react-navigation/stack';
import { api } from '../config/api';
import { PhoneInput } from '../components/PhoneInput';

const { width } = Dimensions.get('window');

type HospitalDetailsRouteProp = RouteProp<
  RootStackParamList,
  'HospitalDetails'
>;

const HospitalDetails = ({
  route,
}: {
  route: HospitalDetailsRouteProp;
}) => {
  const hospital = route.params.hospital as Hospital;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(''); // YYYY-MM-DD
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateTimeError, setDateTimeError] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [appointmentPhone, setAppointmentPhone] = useState('');
  
  // Get a valid image URL or fallback to placeholder
  const getImageUrl = () => {
    // First try to use the Cloudinary imageUrl
    if (isValidImageUrl(hospital.imageUrl)) {
      return hospital.imageUrl;
    }
    // Then try the legacy imageUrl field
    if (isValidImageUrl(hospital.imageUrl)) {
      return hospital.imageUrl;
    }
    // Finally fallback to placeholder
    return getPlaceholderImageUrl(hospital.name);
  };

  const handleEmail = async () => {
    if (!hospital.email) {
      alert('Email not available for this hospital.');
      return;
    }

    const subject = 'Inquiry from Hospital Finder';
    const gmailUrl = `googlegmail:///co?to=${encodeURIComponent(hospital.email)}&subject=${encodeURIComponent(subject)}`;
    const mailtoUrl = `mailto:${hospital.email}?subject=${encodeURIComponent(subject)}`;

    try {
      // First try to open Gmail app
      await Linking.openURL(gmailUrl);
    } catch (error) {
      console.log('Could not open Gmail, falling back to default mail handler');
      // Fall back to default mail handler
      await Linking.openURL(mailtoUrl);
    }
  };

  const handlePhoneCall = () => {
    if (hospital.phone) {
      Linking.openURL(`tel:${hospital.phone}`);
    } else {
      alert('Phone number not available for this hospital.');
    }
  };

  // Remove DatePicker, DateTimePicker, and related imports
  // Remove showDatePicker and isNativeDatePickerSupported state

  // Update handleBookAppointment to validate and combine date/time
  const handleBookAppointment = async () => {
    if (!user) {
      alert('You must be logged in to book an appointment.');
      return;
    }
    setDateTimeError('');
    if (!selectedDate) {
      setDateTimeError('Please select a date.');
      return;
    }
    if (!appointmentPhone || appointmentPhone.length < 10) {
      setDateTimeError('Please enter a valid phone number.');
      return;
    }
    // Combine date and time
    const dateString = selectedDate ? selectedDate.toISOString().slice(0, 10) : '';
    const appointmentTime = `${selectedHour}:${selectedMinute}`;
    const dateTimeString = `${dateString}T${appointmentTime}`;
    const dateObj = new Date(dateTimeString);
    if (isNaN(dateObj.getTime())) {
      setDateTimeError('Invalid date or time.');
      return;
    }
    setBooking(true);
    const payload = {
      user: user.id,
      hospital: hospital.id,
      date: dateObj.toISOString(),
      message: appointmentMessage,
      phone: appointmentPhone,
    };
    console.log('[BookAppointment] Sending payload:', payload, 'to appointments endpoint');
    try {
      await api.post('appointments/', payload);
      alert('Appointment request sent!');
      setShowAppointmentModal(false);
      setAppointmentDate('');
      setSelectedHour('12');
      setSelectedMinute('00');
      setSelectedDate(null);
      setAppointmentMessage('');
      setAppointmentPhone('');
      setDateTimeError('');
    } catch (err: any) {
      console.error('[BookAppointment] Error:', err);
      if (err.response && err.response.data) {
        const backendMsg = err.response.data.message || JSON.stringify(err.response.data);
        alert('Failed to book appointment: ' + backendMsg);
      } else {
        alert('Failed to book appointment.');
      }
    } finally {
      setBooking(false);
    }
  };

  // Add debug logs
  useEffect(() => {
    console.log('[HospitalDetails] Rendering hospital:', { 
      hospitalName: hospital.name,
      hasDescription: !!hospital.description,
      contentLength: hospital.description?.length || 0,
      hasEmail: !!hospital.email,
      hasPhone: !!hospital.phone
    });
    
    // Platform-specific logging
    console.log('[HospitalDetails] Platform:', Platform.OS);
    
    // We'll use Dimensions API for React Native instead of window
    const { width, height } = Dimensions.get('window');
    console.log('[HospitalDetails] Screen dimensions:', { width, height });
    
    // Handle dimension changes
    const handleDimensionChange = ({ window }: { window: { width: number; height: number } }) => {
      console.log('[HospitalDetails] Dimensions changed:', { 
        width: window.width, 
        height: window.height 
      });
    };
    
    // Add dimension change listener using React Native API
    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    
    // Clean up
    return () => {
      subscription.remove();
    };
  }, [hospital]);

  // Add debug logs for image loading
  useEffect(() => {
    const imageUrl = getImageUrl();
    console.log('[HospitalDetails] Image URLs:', {
      cloudinaryUrl: hospital.imageUrl,
      legacyUrl: hospital.imageUrl,
      selectedUrl: imageUrl,
      isValidCloudinary: isValidImageUrl(hospital.imageUrl),
      isValidLegacy: isValidImageUrl(hospital.imageUrl)
    });
  }, [hospital.imageUrl]);

  // Send notification when user views hospital details
  useEffect(() => {
    const sendHospitalViewNotification = async () => {
      if (user?.email) {
        try {
          console.log('Hospital object:', hospital);
          await createSystemNotification(
            user.email,
            'Hospital Details Viewed',
            `You viewed details for ${hospital.name} in ${hospital.city || 'Unknown'} district.`
          );
          console.log('Hospital view notification sent');
        } catch (error) {
          console.error('Failed to send hospital view notification:', error);
        }
      }
    };

    // Send notification after a short delay
    const timer = setTimeout(sendHospitalViewNotification, 1000);
    return () => clearTimeout(timer);
  }, [user?.email, hospital.name, hospital.city]);

  // Before rendering the map or using coords
  const getHospitalCoords = () => {
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

  const coords = getHospitalCoords();
  console.log('Rendering map with coords:', coords);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollableScreen 
        style={styles.container}
        contentContainerStyle={{ 
          paddingBottom: 100,
          paddingTop: 9,
        }}
        keyboardShouldPersistTaps="handled"
        debugName="HospitalDetailsScreen"
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl() }}
            style={styles.headerImage}
            resizeMode="cover"
            onLoadStart={() => {
              console.log('[HospitalDetails] Image loading started');
              setImageLoading(true);
            }}
            onLoadEnd={() => {
              console.log('[HospitalDetails] Image loading completed');
              setImageLoading(false);
            }}
            onError={(error) => {
              console.log('[HospitalDetails] Image failed to load:', error.nativeEvent);
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageLoading && (
            <View style={styles.imageLoading}>
              <ActivityIndicator size="large" color="#1a3c34" />
            </View>
          )}
          {imageError && (
            <View style={styles.imageError}>
              <Ionicons name="image-outline" size={40} color="#9e9e9e" />
              <Text style={styles.errorText}>Image not available</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{hospital.name}</Text>
          <Text style={styles.subtitle}>{hospital.city || 'Unknown'} District</Text>

          {/* Staff-only Hospital Dashboard button */}
          {user && user.is_staff && (
            <View style={{ marginVertical: 16 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#000', padding: 12, borderRadius: 8 }}
                onPress={() => navigation.navigate('HospitalDashboard', { hospital_id: Number(hospital.id) })}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>View Hospital Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Available Services Section */}
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>Available Services</Text>
            <View style={styles.servicesGrid}>
              {hospital.is_emergency && (
                <View style={styles.serviceItem}>
                  <Ionicons name="medical" size={24} color="#00796b" />
                  <Text style={styles.serviceText}>24/7 Emergency</Text>
                </View>
              )}
              {hospital.has_ambulance && (
                <View style={styles.serviceItem}>
                  <Ionicons name="car" size={24} color="#00796b" />
                  <Text style={styles.serviceText}>Ambulance</Text>
                </View>
              )}
              {hospital.has_pharmacy && (
                <View style={styles.serviceItem}>
                  <Ionicons name="medkit" size={24} color="#00796b" />
                  <Text style={styles.serviceText}>Pharmacy</Text>
                </View>
              )}
              {hospital.has_lab && (
                <View style={styles.serviceItem}>
                  <Ionicons name="flask" size={24} color="#00796b" />
                  <Text style={styles.serviceText}>Laboratory</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <FontAwesome5 name="map-marker-alt" size={20} color="#00796b" />
            <Text style={styles.infoText}>{hospital.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#00796b" />
            <TouchableOpacity onPress={handleEmail}>
              <Text style={[styles.infoText, styles.clickableText]}>
                {hospital.email || 'Not available'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#00796b" />
            <TouchableOpacity onPress={handlePhoneCall}>
              <Text style={[styles.infoText, styles.clickableText]}>
                {hospital.phone || 'Not available'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Make Appointment Button for non-staff users */}
          {user && !user.is_staff && (
            <View style={{ marginVertical: 16 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#00796b', padding: 12, borderRadius: 8 }}
                onPress={() => setShowAppointmentModal(true)}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Make Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Appointment Modal */}
          <Modal
            visible={showAppointmentModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAppointmentModal(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '85%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Book Appointment</Text>
                <Text style={{ marginBottom: 4 }}>Select Date</Text>
                <CalendarPicker
                  onDateChange={(date: Date) => {
                    setSelectedDate(date);
                    setAppointmentDate(date.toISOString().slice(0, 10));
                  }}
                  selectedStartDate={selectedDate}
                  width={300}
                />
                <Text style={{ marginBottom: 4, marginTop: 12 }}>Select Time</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <WheelPickerExpo
                      height={120}
                      width={100}
                      initialSelectedIndex={12}
                      items={Array.from({ length: 24 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0') }))}
                      onChange={({ item }) => setSelectedHour(item.value)}
                    />
                    <Text style={{ textAlign: 'center' }}>Hour</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <WheelPickerExpo
                      height={120}
                      width={100}
                      initialSelectedIndex={0}
                      items={Array.from({ length: 60 }, (_, i) => ({ label: i.toString().padStart(2, '0'), value: i.toString().padStart(2, '0') }))}
                      onChange={({ item }) => setSelectedMinute(item.value)}
                    />
                    <Text style={{ textAlign: 'center' }}>Minute</Text>
                  </View>
                </View>
                <Text style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>Example: 14:30</Text>
                <PhoneInput
                  value={appointmentPhone}
                  onChangeText={setAppointmentPhone}
                  placeholder="Phone number *"
                  style={{ marginBottom: 12 }}
                />
                {dateTimeError ? <Text style={{ color: 'red', marginBottom: 8 }}>{dateTimeError}</Text> : null}
                <TextInput
                  placeholder="Message (optional)"
                  value={appointmentMessage}
                  onChangeText={setAppointmentMessage}
                  style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
                  multiline
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#00796b', padding: 10, borderRadius: 6, flex: 1, marginRight: 8 }}
                    onPress={handleBookAppointment}
                    disabled={booking}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center' }}>{booking ? 'Booking...' : 'Submit'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 6, flex: 1, marginLeft: 8 }}
                    onPress={() => setShowAppointmentModal(false)}
                    disabled={booking}
                  >
                    <Text style={{ color: '#333', textAlign: 'center' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Text style={styles.description}>{hospital.description}</Text>
        </View>

        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Location</Text>
          {(!coords || coords.latitude === 0 || coords.longitude === 0) ? (
            <Text>Location not available for this hospital.</Text>
          ) : (
            <MapSection coords={coords} />
          )}
        </View>
      </ScrollableScreen>
    </SafeAreaView>
  );
};

// Create a Map component that works on both web and native platforms
const MapSection = React.memo(({ coords }: { coords: { latitude: number; longitude: number } }) => {
  // Use proper typing for the dynamically imported MapView component
  type MapViewType = {
    default: React.ComponentType<any>;
    Marker: React.ComponentType<any>;
  };
  
  // All hooks must be called at the top level
  const [MapComponent, setMapComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [MarkerComponent, setMarkerComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);
  
  // Get valid coordinates with fallback
  const getValidCoordinates = () => {
    // Check if provided coordinates are valid
    if (coords && 
        coords.latitude && 
        coords.longitude &&
        coords.latitude !== 0 && 
        coords.longitude !== 0 &&
        coords.latitude >= -90 && coords.latitude <= 90 &&
        coords.longitude >= -180 && coords.longitude <= 180) {
      return coords;
    }
    
    // Return default Uganda coordinates if invalid
    return {
      latitude: 1.3733, // Center of Uganda
      longitude: 32.2903,
    };
  };
  
  const validCoords = getValidCoordinates();
  
  const [region, setRegion] = React.useState({
    latitude: validCoords.latitude,
    longitude: validCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // For web platform, use our WebMapComponent
  if (Platform.OS === 'web') {
    return (
      <View style={styles.mapContainer}>
        <WebMapComponent coords={validCoords} title="Hospital Location" />
      </View>
    );
  }
  
  // Load react-native-maps for native platforms
  React.useEffect(() => {
    const loadMap = async () => {
      try {
        const module = await import('react-native-maps');
        setMapComponent(() => module.default);
        setMarkerComponent(() => module.Marker);
      } catch (error: any) {
        setMapError(`Failed to load map: ${error.message}`);
      }
    };
    
    loadMap();
  }, []); // Empty dependency array since we only want to load once
  
  // Update region when coordinates change
  React.useEffect(() => {
    setRegion(prev => ({
      ...prev,
      latitude: validCoords.latitude,
      longitude: validCoords.longitude,
    }));
  }, [validCoords.latitude, validCoords.longitude]);
  
  // Handle error state
  if (mapError) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={[styles.mapPlaceholderText, {color: 'red'}]}>
          {mapError}
        </Text>
      </View>
    );
  }
  
  // Handle loading state
  if (!MapComponent || !MarkerComponent) {
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>Loading map...</Text>
      </View>
    );
  }

  const handleZoomIn = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: Math.max(prev.latitudeDelta / 2, 0.001),
      longitudeDelta: Math.max(prev.longitudeDelta / 2, 0.001),
    }));
  };

  const handleZoomOut = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: Math.min(prev.latitudeDelta * 2, 180),
      longitudeDelta: Math.min(prev.longitudeDelta * 2, 360),
    }));
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${validCoords.latitude},${validCoords.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.map}>
      {MapComponent && (
        <MapComponent 
          style={{ ...StyleSheet.absoluteFillObject }} 
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {MarkerComponent && (
            <MarkerComponent
              coordinate={validCoords}
              title="Hospital Location"
              description="Tap for directions"
              pinColor="red"
            />
          )}
        </MapComponent>
      )}
      
      {/* Zoom Controls */}
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity 
          style={styles.zoomButton}
          onPress={handleZoomIn}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.zoomButton, { borderTopWidth: 0 }]}
          onPress={handleZoomOut}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
      </View>
      
      {/* Directions Button */}
      <TouchableOpacity 
        style={styles.directionsButton}
        onPress={openDirections}
      >
        <MaterialIcons name="directions" size={20} color="white" />
        <Text style={styles.directionsButtonText}>Directions</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    position: 'relative',
    ...(Platform.OS === 'web' ? {
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    } : {})
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 80,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  container: { 
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: '#f0f4f8',
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 244, 248, 0.95)',
  },
  imageError: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  errorText: {
    marginTop: 8,
    color: '#495057',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingBottom: 30,
    marginTop: -40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1a3c34', 
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 18,
    color: '#495057',
    marginBottom: 24,
    fontWeight: '600',
    opacity: 0.9,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#495057',
    flex: 1,
    lineHeight: 24,
    fontWeight: '500',
  },
  clickableText: {
    color: '#00796b',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#495057',
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  mapContainer: {
    marginTop: 25,
    height: 400,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a3c34',
    lineHeight: 32,
    paddingHorizontal: 20,
    paddingTop: 20,
    letterSpacing: -0.5,
  },
  map: { 
    flex: 1,
    position: 'relative',
  },
  zoomControlsContainer: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  zoomButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  zoomButtonText: {
    fontSize: 24,
    color: '#1a3c34',
    fontWeight: '600',
    marginTop: -2,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -90 }],
    backgroundColor: '#00796b',
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 180,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  mapPlaceholderText: {
    color: '#495057',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    fontWeight: '500',
  },
  servicesContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a3c34',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  serviceText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
  },
});

export default HospitalDetails;