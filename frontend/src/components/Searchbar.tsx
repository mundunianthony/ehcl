// This component uses web-only elements (div, input, react-icons) and is not compatible with React Native.
// For React Native, use View, TextInput, and a vector icon library like @expo/vector-icons.

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Searchbar = ({ filter, setFilter }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={filter}
        onChangeText={setFilter}
        placeholder="Enter an address or city"
        placeholderTextColor="#888"
      />
      <MaterialCommunityIcons
        name="map-marker"
        size={24}
        color="#007bff"
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    height: 52,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 366,
    elevation: 2,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 16,
    color: '#222',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  icon: {
    marginLeft: 8,
  },
});

export default Searchbar;
