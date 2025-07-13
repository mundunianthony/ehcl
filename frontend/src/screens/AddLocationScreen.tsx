import React, { useState } from 'react';
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
import Map from '../components/Map';

type AddLocationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddLocation'>;
type AddLocationScreenRouteProp = RouteProp<RootStackParamList, 'AddLocation'>;

const AddLocationScreen = ({ navigation, route }: {
  navigation: AddLocationScreenNavigationProp;
  route: AddLocationScreenRouteProp;
}) => {
  const [formValues, setFormValues] = useState({
    country: route.params?.propertyDetails?.country || '',
    city: route.params?.propertyDetails?.city || '',
    address: route.params?.propertyDetails?.address || '',
  });

  const handleSubmit = () => {
    // Validate form
    if (!formValues.country || !formValues.city || !formValues.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Debug: Log the form values being sent
    console.log('[AddLocationScreen] Sending form values:', JSON.stringify(formValues, null, 2));
    console.log('[AddLocationScreen] City value:', formValues.city);

    // Navigate to BasicDetails with form values
    navigation.navigate('BasicDetails', {
      formValues: {
        ...formValues,
      },
    });
  };

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
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapErrorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  mapErrorSubtext: {
    fontSize: 16,
    color: '#666',
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  mapPlaceholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default AddLocationScreen;