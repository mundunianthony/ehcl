import React, { useState } from "react";
import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";

const UploadImage = ({
  prevStep,
  nextStep,
  propertyDetails,
  setPropertyDetails,
}) => {
  const [imageURL, setImageURL] = useState(propertyDetails.image);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageURL(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    setPropertyDetails((prev) => ({ ...prev, image: imageURL }));
    nextStep();
  };

  return (
    <View style={styles.container}>
      {!imageURL ? (
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          <Text style={styles.uploadIcon}>⬆️</Text>
          <Text>Upload Image</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          <Image source={{ uri: imageURL }} style={styles.image} />
        </TouchableOpacity>
      )}
      <View style={styles.buttonGroup}>
        <Button title="Back" onPress={prevStep} />
        <Button title="Next" onPress={handleNext} disabled={!imageURL} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  uploadBox: {
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 210,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 24,
  },
  uploadIcon: {
    fontSize: 44,
    color: "grey",
    marginBottom: 8,
  },
  imageBox: {
    width: "80%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginTop: 24,
  },
});

export default UploadImage;
