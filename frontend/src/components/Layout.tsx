import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "./Header";

const Layout: React.FC<{ children: React.ReactNode; navigation: any }> = ({ children, navigation }) => {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});

export default Layout;
