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
import { useNavigation } from '@react-navigation/native';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { hospitalProfileStepManager } from '../utils/hospitalProfileSteps';

type HospitalLocationParams = {
  returnTo?: string;
};
const HospitalLocationScreen: React.FC<{ route?: { params?: HospitalLocationParams } }> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    country: 'Uganda',
    city: '',
    address: '',
  });

  // Fetch current hospital location details
  useEffect(() => {
    fetchHospitalLocation();
  }, []);

  const fetchHospitalLocation = async () => {
    setLoading(true);
    try {
      const response = await api.get('hospital/profile/');
      const hospitalData = response.data;
      
      setFormValues({
        country: hospitalData.country || 'Uganda',
        city: hospitalData.city || '',
        address: hospitalData.address || '',
      });
    } catch (error) {
      console.error('Error fetching hospital location:', error);
      Alert.alert('Error', 'Failed to load hospital location details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Initialize step manager
    await hospitalProfileStepManager.initialize();
    
    // Check if user can access this step (Step 2)
    if (!hospitalProfileStepManager.canAccessStep(2)) {
      Alert.alert(
        'Step Locked',
        'You must complete Step 1 (Basic Details) before accessing Step 2 (Location & Map).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Validate form
    if (!formValues.country || !formValues.city || !formValues.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      // Save location data to API
      await api.put('hospital/profile/', {
        country: formValues.country,
        city: formValues.city,
        address: formValues.address,
      });
      
      // Mark Step 2 as completed
      await hospitalProfileStepManager.markStepCompleted(2);
      
      const returnTo = (route as any)?.params?.returnTo;
      if (returnTo) {
        navigation.navigate(returnTo as never);
        return;
      }
      Alert.alert(
        'Success',
        'Step 2 completed! You can now proceed to Step 3 (Conditions Treated).',
        [
          {
            text: 'Continue to Step 3',
            onPress: () => navigation.navigate('HospitalConditions' as never)
          },
          {
            text: 'Stay Here',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error updating hospital location:', error);
      Alert.alert('Error', 'Failed to update hospital location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading hospital location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.title}>Hospital Registration - Location</Text>
        
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
        <Map
          address={formValues.address}
          city={formValues.city}
          country={formValues.country}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
    marginBottom: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HospitalLocationScreen; 