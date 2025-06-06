import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { validateString, validatePhoneNumber } from "../utils/common";

interface BasicDetailsProps {
  navigation: any;
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

const BasicDetails: React.FC<BasicDetailsProps> = ({
  navigation,
  propertyDetails,
  setPropertyDetails,
}) => {
  type FormValues = {
    name: string;
    description: string;
    contact: string;
    email: string;
  };

  const [formValues, setFormValues] = useState<FormValues>({
    name: propertyDetails.name || "",
    description: propertyDetails.description || "",
    contact: propertyDetails.contact || "",
    email: propertyDetails.email || "",
  });

  const [errors, setErrors] = useState<Partial<FormValues>>({});

  useEffect(() => {
    setFormValues({
      name: propertyDetails.name || "",
      description: propertyDetails.description || "",
      contact: propertyDetails.contact || "",
      email: propertyDetails.email || "",
    });
  }, [propertyDetails]);

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormValues> = {};
    
    const nameError = validateString(formValues.name);
    if (nameError) newErrors.name = nameError;
    
    const descriptionError = validateString(formValues.description);
    if (descriptionError) newErrors.description = descriptionError;
    
    const contactError = validatePhoneNumber(formValues.contact);
    if (contactError) newErrors.contact = contactError;
    
    const emailError = validateString(formValues.email);
    if (emailError) newErrors.email = emailError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setPropertyDetails({
        name: formValues.name,
        description: formValues.description,
        contact: formValues.contact,
        email: formValues.email,
      });
      navigation.navigate('Facilities', { propertyDetails: formValues });
    } else {
      Alert.alert('Validation Error', 'Please check the form for errors');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Hospital Name</Text>
      <TextInput
        style={[styles.input, errors.name && styles.errorInput]}
        value={formValues.name}
        onChangeText={(value) => handleInputChange('name', value)}
        placeholder="Enter hospital name (e.g. Nairobi Hospital)"
        placeholderTextColor="#94a3b8"
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, errors.description && styles.errorInput]}
        value={formValues.description}
        onChangeText={(value) => handleInputChange('description', value)}
        multiline
        numberOfLines={4}
        placeholder="Enter hospital description (e.g. 24/7 emergency services, specialized trauma care)"
        placeholderTextColor="#94a3b8"
      />
      {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={[styles.input, errors.contact && styles.errorInput]}
        value={formValues.contact}
        onChangeText={(value) => handleInputChange('contact', value)}
        keyboardType="phone-pad"
        placeholder="Enter contact number (e.g. +254 712 345 678)"
        placeholderTextColor="#94a3b8"
      />
      {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, errors.email && styles.errorInput]}
        value={formValues.email}
        onChangeText={(value) => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Enter email address (e.g. info@hospital.com)"
        placeholderTextColor="#94a3b8"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#1a3c34' }]}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3c34',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#e2e8f0',
  },
  backButtonText: {
    color: '#1a3c34',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BasicDetails;
