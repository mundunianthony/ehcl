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
