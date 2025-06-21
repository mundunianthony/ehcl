import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { PhoneInput } from '../components/PhoneInput';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

type BasicDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BasicDetails'>;
type BasicDetailsScreenRouteProp = RouteProp<RootStackParamList, 'BasicDetails'>;

const BasicDetailsScreen = ({ navigation, route }: {
  navigation: BasicDetailsScreenNavigationProp;
  route: BasicDetailsScreenRouteProp;
}) => {
  const { token } = useAuth();
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

  // Validate form
  const validateForm = () => {
    if (!formValues.name || !formValues.description || !formValues.phone || !formValues.email) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // Use default coordinates if none provided (Kampala, Uganda)
      const defaultCoords = {
        latitude: 0.3476,
        longitude: 32.5825,
      };

      const hospitalData = {
        name: formValues.name,
        district: route.params.formValues.city, // Using city as district
        address: route.params.formValues.address,
        description: formValues.description,
        email: formValues.email,
        phone: formValues.phone,
        is_emergency: formValues.is_emergency,
        has_ambulance: formValues.has_ambulance,
        has_pharmacy: formValues.has_pharmacy,
        has_lab: formValues.has_lab,
        coords: route.params.formValues.coords || defaultCoords
      };

      // Navigate to conditions screen instead of submitting
      navigation.navigate('AddHospitalConditions', {
        hospitalData,
        images: [] // Initialize with empty array since image is not in route params
      });
    } catch (error) {
      console.error('Error preparing hospital data:', error);
      Alert.alert('Error', 'Failed to process hospital data. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Basic Hospital Details</Text>
        
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
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
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

export default BasicDetailsScreen;
