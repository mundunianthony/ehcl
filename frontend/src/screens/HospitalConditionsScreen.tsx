import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { hospitalProfileStepManager } from '../utils/hospitalProfileSteps';
import { RootStackParamList } from '../types';

const CONDITIONS = [
  "Malaria", "Typhoid", "Chest infection", "Urine infection", 
  "Sugar disease", "High blood pressure", "Breathing problems", 
  "HIV/AIDS", "TB", "Stroke (Poko)", "Heart pain", 
  "Pregnancy problems", "Broken bones", "Burns", 
  "Small wounds", "Child sickness", "Skin rashes", 
  "Eye problems", "Tooth pain", "Women's health", "Ulcers"
];

type HospitalConditionsParams = {
  hospitalData?: any;
  returnTo?: string;
};
const HospitalConditionsScreen: React.FC<{ route?: { params?: HospitalConditionsParams } }> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Get hospital data from route params if available
  const hospitalData = route?.params?.hospitalData;

  // Fetch current hospital conditions if no data passed
  useEffect(() => {
    if (!hospitalData) {
      fetchHospitalConditions();
    }
  }, [hospitalData]);

  const fetchHospitalConditions = async () => {
    setLoading(true);
    try {
      const response = await api.get('hospital/profile/');
      const hospitalData = response.data;
      
      if (hospitalData.conditions_treated) {
        const currentConditions = hospitalData.conditions_treated.split(', ').filter(Boolean);
        setSelectedConditions(currentConditions);
      }
    } catch (error) {
      console.error('Error fetching hospital conditions:', error);
      Alert.alert('Error', 'Failed to load hospital conditions');
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async () => {
    // Initialize step manager
    await hospitalProfileStepManager.initialize();
    
    // Check if user can access this step (Step 3)
    if (!hospitalProfileStepManager.canAccessStep(3)) {
      Alert.alert(
        'Step Locked',
        'You must complete Step 2 (Location & Map) before accessing Step 3 (Conditions Treated).',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (selectedConditions.length === 0) {
      Alert.alert('Error', 'Please select at least one condition');
      return;
    }

    try {
      setLoading(true);
      
      // Save conditions to API
      await api.put('hospital/profile/', {
        conditions_treated: selectedConditions.join(', ')
      });
      
      // Mark Step 3 as completed
      await hospitalProfileStepManager.markStepCompleted(3);
      
      const returnTo = (route as any)?.params?.returnTo;
      if (returnTo) {
        navigation.navigate(returnTo as never);
        return;
      }
      Alert.alert(
        'Success',
        'Step 3 completed! You can now proceed to Step 4 (Review & Confirm).',
        [
          {
            text: 'Continue to Step 4',
            onPress: () => navigation.navigate('HospitalConfirmation' as never)
          },
          {
            text: 'Stay Here',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error: any) {
      console.error('Error updating conditions:', error);
      Alert.alert('Error', 'Failed to update conditions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading hospital conditions...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Select all conditions that this hospital can treat
          </Text>
          <View style={styles.selectionInfo}>
            <Ionicons name="information-circle" size={20} color="#00796b" />
            <Text style={styles.selectionInfoText}>
              {selectedConditions.length} conditions selected
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedConditions.length === 0 && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={selectedConditions.length === 0}
          >
            <Text style={styles.submitButtonText}>Update</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.conditionsList}
          contentContainerStyle={styles.conditionsListContent}
        >
          {CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={[
                styles.conditionItem,
                selectedConditions.includes(condition) && styles.selectedCondition
              ]}
              onPress={() => toggleCondition(condition)}
            >
              <View style={styles.conditionContent}>
                <Ionicons 
                  name={selectedConditions.includes(condition) ? "checkmark-circle" : "ellipse-outline"} 
                  size={24} 
                  color={selectedConditions.includes(condition) ? "#00796b" : "#666"} 
                />
                <Text style={[
                  styles.conditionText,
                  selectedConditions.includes(condition) && styles.selectedConditionText
                ]}>
                  {condition}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  selectionInfoText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
  },
  conditionsList: {
    flex: 1,
  },
  conditionsListContent: {
    padding: 15,
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
  conditionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCondition: {
    borderColor: '#00796b',
    backgroundColor: '#e8f5e9',
  },
  conditionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  conditionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  selectedConditionText: {
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
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default HospitalConditionsScreen; 