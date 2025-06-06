import React from "react";
import { View, Text, StyleSheet, ImageBackground, Button } from "react-native";

import type { NavigationProp } from "@react-navigation/native";

const Hero = ({ navigation }: { navigation: NavigationProp<any> }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/hero.jpg")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.content}>
          <Text style={styles.subtitle}>Your Dream Home Awaits</Text>
          <Text style={styles.title}>
            Book Property Visits Effortlessly with Homely.com
          </Text>
          <Text style={styles.description}>
            Schedule viewings for homes you love with our simple platform.
            Experience the easiest way to find and visit properties that match
            your criteria.
          </Text>
          <Button
            title="Browse Homes"
            onPress={() => navigation.navigate("Home")}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    borderRadius: 16,
  },
  content: {
    alignItems: "center",
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
});

export default Hero;
