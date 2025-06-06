import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Button } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Item = ({ property, navigation }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("PropertyDetails", { id: property.id })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: property.image }} style={styles.image} />
      </View>
      <Text style={styles.city}>{property.city}</Text>
      <Text style={styles.title}>{property.title}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          <MaterialCommunityIcons name="bed-outline" size={16} /> {property.facilities.bedrooms}
        </Text>
        <Text style={styles.info}>
          <MaterialCommunityIcons name="shower" size={16} /> {property.facilities.bathrooms}
        </Text>
        <Text style={styles.info}>
          <MaterialCommunityIcons name="garage" size={16} /> {property.facilities.parkings}
        </Text>
        <Text style={styles.info}>
          <MaterialCommunityIcons name="ruler-square" size={16} /> 0
        </Text>
      </View>
      <Text style={styles.description}>{property.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>${property.price}.00</Text>
        <Button title="View Details" onPress={() => navigation.navigate("PropertyDetails", { id: property.id })} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  imageContainer: {
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  city: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Item;