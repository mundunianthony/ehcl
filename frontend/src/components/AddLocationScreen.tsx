import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import useCountries from "../hooks/useCountries";
import Map from "./Map";
import { validateString } from "../utils/common";

const AddLocationScreen = ({ navigation, route }) => {
  const { getAll } = useCountries();

  // You can get propertyDetails/setPropertyDetails/nextStep from route.params if needed
  const [formValues, setFormValues] = useState({
    country: "",
    city: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateString(formValues.country))
      newErrors.country = "Country is required.";
    if (!validateString(formValues.city)) newErrors.city = "City is required.";
    if (!validateString(formValues.address))
      newErrors.address = "Address is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // You can handle navigation or pass data as needed
      // navigation.navigate('NextScreen', { ...formValues });
      alert("Location added!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Left */}
      <View style={styles.leftContainer}>
        <View>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={[styles.input, errors.country && styles.errorInput]}
            value={formValues.country}
            onChangeText={(value) => handleInputChange("country", value)}
            placeholder="Select a country"
          />
          {errors.country && (
            <Text style={styles.errorText}>{errors.country}</Text>
          )}

          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.input, errors.city && styles.errorInput]}
            value={formValues.city}
            onChangeText={(value) => handleInputChange("city", value)}
            placeholder="Enter city"
          />
          {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, errors.address && styles.errorInput]}
            value={formValues.address}
            onChangeText={(value) => handleInputChange("address", value)}
            placeholder="Enter address"
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
      </View>
      {/* Right */}
      <View style={styles.rightContainer}>
        <Map
          country={formValues.country}
          city={formValues.city}
          address={formValues.address}
        />
      </View>
      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button title="Next Step" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  leftContainer: {
    flex: 1,
    marginRight: 8,
    minWidth: 200,
  },
  rightContainer: {
    flex: 1,
    marginLeft: 8,
    minWidth: 200,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: "center",
    width: "100%",
  },
});

export default AddLocationScreen;
