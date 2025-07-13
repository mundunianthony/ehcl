import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { PhoneInput } from '../components/PhoneInput';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { hospitalProfileStepManager } from '../utils/hospitalProfileSteps';
import { RootStackParamList } from '../types';
import StepProgress from '../components/StepProgress';

type UpdateHospitalDetailsRouteProp = RouteProp<RootStackParamList, 'UpdateHospitalDetails'>;

type UpdateHospitalDetailsParams = {
  locationData?: { country: string; city: string; address: string };
  returnTo?: string;
};
const UpdateHospitalDetails: React.FC<{ route: { params?: UpdateHospitalDetailsParams } }> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    is_emergency: false,
    has_ambulance: false,
    has_pharmacy: false,
    has_lab: false,
  });
  
  // Get location data from route params if available
  const locationData = route.params?.locationData;

  // Fetch current hospital details
  useEffect(() => {
    fetchHospitalDetails();
  }, []);

  const fetchHospitalDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('hospital/profile/');
      const hospitalData = response.data;
      
      setFormValues({
        name: hospitalData.name || '',
        description: hospitalData.description || '',
        phone: hospitalData.phone || '',
        email: hospitalData.email || '',
        is_emergency: hospitalData.is_emergency || false,
        has_ambulance: hospitalData.has_ambulance || false,
        has_pharmacy: hospitalData.has_pharmacy || false,
        has_lab: hospitalData.has_lab || false,
      });
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      Alert.alert('Error', 'Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formValues.name || !formValues.description || !formValues.phone || !formValues.email) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Initialize step manager
    await hospitalProfileStepManager.initialize();
    
    // Check if user can access this step
    if (!hospitalProfileStepManager.canAccessStep(1)) {
      Alert.alert(
        'Step Locked',
        'You cannot access this step. Please complete the previous steps first.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Description, Phone, Email)');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare hospital data with location data if available
      const hospitalData = {
        name: formValues.name,
        description: formValues.description,
        phone: formValues.phone,
        email: formValues.email,
        is_emergency: formValues.is_emergency,
        has_ambulance: formValues.has_ambulance,
        has_pharmacy: formValues.has_pharmacy,
        has_lab: formValues.has_lab,
        // Include location data if available
        ...(locationData && {
          country: locationData.country,
          city: locationData.city,
          address: locationData.address,
        }),
      };

      // Save hospital data to API
      await api.put('hospital/profile/', hospitalData);
      
      // Mark Step 1 as completed
      await hospitalProfileStepManager.markStepCompleted(1);

      // If returnTo param is set, go back to confirmation screen
      const returnTo = (route.params as any)?.returnTo;
      if (returnTo) {
        navigation.navigate(returnTo as never);
        return;
      }
      
      Alert.alert(
        'Success',
        'Step 1 completed! You can now proceed to Step 2 (Location & Map).',
        [
          {
            text: 'Continue to Step 2',
            onPress: () => navigation.navigate('HospitalLocation' as never)
          },
          {
            text: 'Stay Here',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error updating hospital details:', error);
      Alert.alert('Error', 'Failed to update hospital details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading hospital details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <StepProgress
          currentStep={1}
          totalSteps={4}
          stepTitles={['Basic Details', 'Location & Map', 'Conditions Treated', 'Review & Confirm']}
          completedSteps={[]}
        />
        <Text style={styles.title}>Hospital Details</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hospital Name</Text>
          <TextInput
            style={styles.input}
            value={formValues.name}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, name: text }))}
            placeholder="Enter hospital name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={formValues.description}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, description: text }))}
            placeholder="Enter hospital description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number</Text>
          <PhoneInput
            value={formValues.phone}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, phone: text }))}
            placeholder="Enter contact number"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formValues.email}
            onChangeText={(text) => setFormValues(prev => ({ ...prev, email: text }))}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Available Services</Text>
          
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setFormValues(prev => ({ ...prev, is_emergency: !prev.is_emergency }))}
          >
            <View style={[styles.checkbox, formValues.is_emergency && styles.checkboxChecked]}>
              {formValues.is_emergency && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>24/7 Emergency Services</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setFormValues(prev => ({ ...prev, has_ambulance: !prev.has_ambulance }))}
          >
            <View style={[styles.checkbox, formValues.has_ambulance && styles.checkboxChecked]}>
              {formValues.has_ambulance && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Ambulance Services</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setFormValues(prev => ({ ...prev, has_pharmacy: !prev.has_pharmacy }))}
          >
            <View style={[styles.checkbox, formValues.has_pharmacy && styles.checkboxChecked]}>
              {formValues.has_pharmacy && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Pharmacy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setFormValues(prev => ({ ...prev, has_lab: !prev.has_lab }))}
          >
            <View style={[styles.checkbox, formValues.has_lab && styles.checkboxChecked]}>
              {formValues.has_lab && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Laboratory Services</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.submitButton, saving && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    padding: 20,
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
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    marginLeft: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#00796b',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00796b',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
});

export default UpdateHospitalDetails; 