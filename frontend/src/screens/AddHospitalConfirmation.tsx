import React, { useState } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { registerHospital } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { createSystemNotification } from '../services/notificationService';
import StepProgress from '../components/StepProgress';

type AddHospitalConfirmationRouteProp = RouteProp<RootStackParamList, 'AddHospitalConfirmation'>;
type AddHospitalConfirmationNavigationProp = StackNavigationProp<RootStackParamList, 'AddHospitalConfirmation'>;

export default function AddHospitalConfirmation({ route }: { route: AddHospitalConfirmationRouteProp }) {
  const navigation = useNavigation<AddHospitalConfirmationNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { hospitalData } = route.params;
  const { user } = useAuth();

  // Debug: Log the hospital data to see what's being received
  React.useEffect(() => {
    console.log('[AddHospitalConfirmation] Received hospital data:', JSON.stringify(hospitalData, null, 2));
    console.log('[AddHospitalConfirmation] City field value:', hospitalData.city);
    console.log('[AddHospitalConfirmation] City field type:', typeof hospitalData.city);
  }, [hospitalData]);

  // Step 3 Validation - Check if Steps 1 and 2 were completed
  React.useEffect(() => {
    console.log('[AddHospitalConfirmation] Step 3: Checking if Steps 1 and 2 were completed...');
    
    if (!(hospitalData as any).step1_completed) {
      console.error('[AddHospitalConfirmation] Step 3 ERROR: Step 1 not completed');
      Alert.alert(
        'Step 1 Required', 
        'You must complete Step 1 (Basic Details) before proceeding to Step 3 (Confirmation). Please go back and complete all required fields.',
        [
          { 
            text: 'Go Back', 
            onPress: () => navigation.navigate('BasicDetails' as never) 
          }
        ]
      );
      return;
    }
    
    if (!(hospitalData as any).step2_completed) {
      console.error('[AddHospitalConfirmation] Step 3 ERROR: Step 2 not completed');
      Alert.alert(
        'Step 2 Required', 
        'You must complete Step 2 (Conditions) before proceeding to Step 3 (Confirmation). Please go back and select at least one condition.',
        [
          { 
            text: 'Go Back', 
            onPress: () => navigation.navigate('AddHospitalConditions' as never) 
          }
        ]
      );
      return;
    }
    
    console.log('[AddHospitalConfirmation] Step 3 SUCCESS: Steps 1 and 2 completed, proceeding with confirmation');
  }, [(hospitalData as any).step1_completed, (hospitalData as any).step2_completed, navigation]);

  const handleSubmit = async () => {
    // Step 3 Validation - Final confirmation
    console.log('[AddHospitalConfirmation] Step 3: Final validation and submission...');
    
    try {
      setLoading(true);
      
      // Add the missing images property and ensure all required fields are present
      const hospitalDataWithImages = {
        ...hospitalData,
        images: [], // Add empty images array as required by the API
        city: hospitalData.city || '',
        // Ensure user credentials are included
        user_email: hospitalData.user_email || '',
        password: hospitalData.password || '',
        // Add default values for optional fields
        is_emergency: hospitalData.is_emergency || true,
        has_ambulance: hospitalData.has_ambulance || false,
        has_pharmacy: hospitalData.has_pharmacy || true,
        has_lab: hospitalData.has_lab || false,
        // Mark Step 3 as completed
        step3_completed: true,
        step3_completion_time: new Date().toISOString(),
        registration_complete: true,
      };
      
      console.log('[AddHospitalConfirmation] Step 3 SUCCESS: All steps completed, registering hospital');
      
      await registerHospital(hospitalDataWithImages);
      
      // Send notification about the new hospital
      if (user?.email) {
        try {
          await createSystemNotification(
            user.email,
            'New Hospital Registered',
            `A new hospital "${hospitalData.name}" has been registered in ${hospitalData.city || 'Unknown'} district.`
          );
        } catch (error) {
          console.error('Failed to send hospital added notification:', error);
        }
      }
      
      Alert.alert(
        'Success', 
        'Hospital registered successfully! You can now log in with your credentials to manage appointments.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HospitalLogin')
          }
        ]
      );
    } catch (error) {
      console.error('Error adding hospital:', error);
      Alert.alert('Error', 'Failed to register hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <StepProgress
            currentStep={3}
            totalSteps={3}
            stepTitles={['Basic Details', 'Conditions', 'Confirmation']}
            completedSteps={[1, 2]}
          />
          <Text style={styles.title}>Confirm Hospital Registration</Text>
          <Text style={styles.subtitle}>
            Please review the hospital information and account details before submitting
          </Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
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
              <Text style={styles.value}>{hospitalData.address}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Conditions Treated</Text>
            </View>
            <View style={styles.conditionsContainer}>
              {hospitalData.conditions_treated.split(', ').map((condition, index) => (
                <View key={index} style={styles.conditionTag}>
                  <Text style={styles.conditionText}>{condition}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person" size={24} color="#00796b" />
              <Text style={styles.sectionTitle}>Hospital Account</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Login Email</Text>
              <Text style={styles.value}>{hospitalData.user_email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.value}>••••••••</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Services</Text>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Register Hospital</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
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
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3c34',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    width: 100,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
    color: '#00796b',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginRight: 8,
    gap: 8,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#00796b',
    borderRadius: 12,
    marginLeft: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#b2dfdb',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 