import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Blogs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Blogs Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});

export default Blogs;
