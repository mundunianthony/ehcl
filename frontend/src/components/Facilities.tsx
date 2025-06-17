import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";

interface MedicalCondition {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

const MEDICAL_CONDITIONS: MedicalCondition[] = [
  {
    id: "stroke",
    name: "Stroke Treatment",
    description: "Emergency stroke care and treatment",
    checked: false,
  },
  {
    id: "heart-attack",
    name: "Heart Attack Treatment",
    description: "Emergency cardiac care",
    checked: false,
  },
  {
    id: "severe-bleeding",
    name: "Severe Bleeding Treatment",
    description: "Emergency bleeding control",
    checked: false,
  },
  {
    id: "trauma",
    name: "Trauma Care",
    description: "Emergency trauma treatment",
    checked: false,
  },
  {
    id: "poisoning",
    name: "Poisoning Treatment",
    description: "Emergency poisoning care",
    checked: false,
  },
];

interface FacilitiesProps {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
  propertyDetails: {
    name: string;
    description: string;
    contact: string;
    email: string;
  };
  setPropertyDetails: (details: {
    name: string;
    description: string;
    contact: string;
    email: string;
  }) => void;
}

const Facilities: React.FC<FacilitiesProps> = ({
  navigation,
  propertyDetails,
  setPropertyDetails,
}) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const handleConditionChange = (conditionId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((id) => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleSubmit = () => {
    if (selectedConditions.length === 0) {
      Alert.alert('Please select at least one condition');
      return;
    }

    const newProperty = {
      ...propertyDetails,
      facilities: {
        conditions: selectedConditions,
      },
    };

    setPropertyDetails(newProperty);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Emergency Medical Conditions</Text>
      
      <View style={styles.contentContainer}>
        <ScrollView style={styles.conditionsList}>
          {MEDICAL_CONDITIONS.map((condition) => {
            const isSelected = selectedConditions.includes(condition.id);
            return (
              <View key={condition.id} style={styles.conditionItem}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}
                    onPress={() => handleConditionChange(condition.id)}
                  >
                    {isSelected && (
                      <View style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.conditionContent}>
                  <Text style={styles.conditionText}>{condition.name}</Text>
                  <Text style={styles.conditionDescription}>{condition.description}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#1a3c34' }]}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3c34',
    marginBottom: 20,
  },
  conditionsList: {
    maxHeight: 300,
  },
  conditionItem: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1a3c34',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1a3c34',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  conditionContent: {
    flex: 1,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3c34',
    marginBottom: 5,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#e2e8f0',
    marginRight: 10,
  },
  buttonText: {
    color: '#1a3c34',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Facilities;
