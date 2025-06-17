import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Banner: React.FC = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>Welcome to Homely</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#007bff',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Banner;

// This component uses @mantine/core and react-router-dom, which are for web apps and not compatible with React Native.
// For React Native, you would use a different approach (e.g., a Modal or ActionSheet for the menu, and navigation from React Navigation).
// If you want a React Native version, let me know!