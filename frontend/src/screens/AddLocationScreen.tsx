import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

type AddLocationScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AddLocation'>;
  route: RouteProp<RootStackParamList, 'AddLocation'>;
};

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ navigation, route }) => {
  const [formValues, setFormValues] = useState({
    country: route.params?.propertyDetails?.country || '',
    city: route.params?.propertyDetails?.city || '',
    address: route.params?.propertyDetails?.address || '',
  });

  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [marker, setMarker] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    // Get initial location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show the map');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setMarker({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const updateMapLocation = async () => {
    if (!formValues.country || !formValues.city || !formValues.address) return;

    try {
      const address = `${formValues.address}, ${formValues.city}, ${formValues.country}`;
      const locations = await Location.geocodeAsync(address);
      
      if (locations.length > 0) {
        const { latitude, longitude } = locations[0];
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setMarker({
          latitude,
          longitude,
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  useEffect(() => {
    updateMapLocation();
  }, [formValues.country, formValues.city, formValues.address]);

  const handleSubmit = () => {
    // Validate form
    if (!formValues.country || !formValues.city || !formValues.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Navigate directly to BasicDetails with form values
    navigation.navigate('BasicDetails', { 
      formValues: {
        country: formValues.country,
        city: formValues.city,
        address: formValues.address,
        coords: {
          latitude: marker.latitude,
          longitude: marker.longitude
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.title}>Add Hospital Location</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={formValues.country}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, country: text }))}
            placeholder="Enter country"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={formValues.city}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, city: text }))}
            placeholder="Enter city"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.addressInput]}
            value={formValues.address}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, address: text }))}
            placeholder="Enter address"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          <Marker
            coordinate={marker}
            title="Hospital Location"
            description={`${formValues.address}, ${formValues.city}, ${formValues.country}`}
          />
        </MapView>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  mapContainer: {
    height: height * 0.4,
    width: width,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addressInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 50, // Increased bottom margin for more space
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddLocationScreen;