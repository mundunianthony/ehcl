import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  route?: any; // Add route prop to handle navigation
  navigation?: any; // Add navigation prop
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, route, navigation }) => {
  const currentRoute = useRoute();
  
  // Only show Navbar on main screens, not on auth screens
  const showNavbar = !['Login', 'SignUp'].includes(currentRoute.name);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  content: {
    flex: 1,
    paddingBottom: 70, // Add padding to prevent content from being hidden behind the Navbar
  },
});

export default MainLayout;
