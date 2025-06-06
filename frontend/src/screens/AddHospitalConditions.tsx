import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';

const CONDITIONS = [
  "Malaria", "Typhoid", "Chest infection", "Urine infection", 
  "Sugar disease", "High blood pressure", "Breathing problems", 
  "HIV/AIDS", "TB", "Stroke (Poko)", "Heart pain", 
  "Pregnancy problems", "Broken bones", "Burns", 
  "Small wounds", "Child sickness", "Skin rashes", 
  "Eye problems", "Tooth pain", "Women's health", "Ulcers"
];

type AddHospitalConditionsRouteProp = RouteProp<RootStackParamList, 'AddHospitalConditions'>;
type AddHospitalConditionsNavigationProp = StackNavigationProp<RootStackParamList, 'AddHospitalConditions'>;

export default function AddHospitalConditions({ route }: { route: AddHospitalConditionsRouteProp }) {
  const navigation = useNavigation<AddHospitalConditionsNavigationProp>();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const { hospitalData } = route.params;

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async () => {
    if (selectedConditions.length === 0) {
      Alert.alert('Error', 'Please select at least one condition');
      return;
    }

    try {
      // Prepare the final hospital data
      const finalHospitalData = {
        ...hospitalData,
        conditions_treated: selectedConditions.join(', ')
      };

      // Navigate to confirmation screen
      navigation.navigate('AddHospitalConfirmation', { 
        hospitalData: finalHospitalData 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to process hospital data');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Conditions Treated</Text>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedConditions.length === 0 && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={selectedConditions.length === 0}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    paddingBottom: 100, // Add padding to prevent content from being hidden behind footer
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
  conditionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  selectedCondition: {
    backgroundColor: '#e8f5e9',
    borderColor: '#00796b',
  },
  conditionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedConditionText: {
    color: '#00796b',
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
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 