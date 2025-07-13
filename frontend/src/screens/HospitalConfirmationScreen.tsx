import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getAuthToken } from '../config/api';
import { hospitalProfileStepManager } from '../utils/hospitalProfileSteps';
import { RootStackParamList } from '../types';

type HospitalConfirmationRouteProp = RouteProp<RootStackParamList, 'HospitalConfirmation'>;

const HospitalConfirmationScreen: React.FC<{ route: HospitalConfirmationRouteProp }> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hospitalData, setHospitalData] = useState<any>(null);
  
  // Get hospital data from route params if available
  const routeHospitalData = route.params?.hospitalData;

  // Fetch current hospital data for confirmation if no data passed
  useEffect(() => {
    if (routeHospitalData) {
      setHospitalData(routeHospitalData);
    } else {
      fetchHospitalData();
    }
  }, [routeHospitalData]);

  const fetchHospitalData = async () => {
    setLoading(true);
    try {
      console.log('[HospitalConfirmation] Fetching hospital data from API...');
      
      // Check if we have an auth token
      const currentToken = getAuthToken();
      console.log('[HospitalConfirmation] Current auth token:', currentToken ? 'Present' : 'Missing');
      
      const response = await api.get('hospital/profile/');
      console.log('[HospitalConfirmation] API response:', response.data);
      setHospitalData(response.data);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
      Alert.alert('Error', 'Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Initialize step manager
    await hospitalProfileStepManager.initialize();
    
    // Check if user can access this step (Step 4)
    if (!hospitalProfileStepManager.canAccessStep(4)) {
      Alert.alert(
        'Step Locked',
        'You must complete Step 3 (Conditions Treated) before accessing Step 4 (Review & Confirm).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setLoading(true);
      
      if (routeHospitalData) {
        // Save complete hospital data from flow (like admin flow)
        await api.put('hospital/profile/', routeHospitalData);
      } else {
        // Update hospital profile with current data (fallback)
        await api.put('hospital/profile/', hospitalData);
      }
      
      // Mark Step 4 as completed
      await hospitalProfileStepManager.markStepCompleted(4);
      
      Alert.alert(
        'Success', 
        'Hospital profile setup completed! Your profile is now complete and visible to patients.',
        [{ text: 'OK', onPress: () => navigation.navigate('HospitalDashboard' as never) }]
      );
    } catch (error: any) {
      console.error('Error updating hospital profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update hospital profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !hospitalData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading hospital data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Hospital Profile</Text>
          <Text style={styles.subtitle}>
            Review all your hospital information before completing the profile setup
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Complete Profile</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => (navigation.navigate as any)('HospitalLocation', { returnTo: 'HospitalConfirmation' })}>
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{hospitalData.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>District</Text>
              <Text style={styles.value}>{hospitalData.city || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{hospitalData.address || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => (navigation.navigate as any)('UpdateHospitalDetails', { returnTo: 'HospitalConfirmation' })}>
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{hospitalData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{hospitalData.phone}</Text>
            </View>
          </View>

          {hospitalData.conditions_treated && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical" size={24} color="#00796b" />
                <Text style={styles.sectionTitle}>Conditions Treated</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => (navigation.navigate as any)('HospitalConditions', { returnTo: 'HospitalConfirmation' })}>
                  <Ionicons name="create-outline" size={20} color="#4F46E5" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.conditionsContainer}>
                {hospitalData.conditions_treated.split(', ').map((condition: string, index: number) => (
                  <View key={index} style={styles.conditionTag}>
                    <Text style={styles.conditionText}>{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Services</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => (navigation.navigate as any)('UpdateHospitalDetails', { returnTo: 'HospitalConfirmation' })}>
                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Available Services</Text>
              <Text style={styles.value}>
                {[
                  hospitalData.is_emergency && 'Emergency',
                  hospitalData.has_ambulance && 'Ambulance',
                  hospitalData.has_pharmacy && 'Pharmacy',
                  hospitalData.has_lab && 'Laboratory'
                ].filter(Boolean).join(', ') || 'None specified'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a3c34',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3c34',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00796b',
  },
  conditionText: {
    fontSize: 12,
    color: '#00796b',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00796b',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
});

export default HospitalConfirmationScreen;