import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDetailProvider } from './src/context/UserDetailContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { Platform, StyleSheet, View, Text, Alert } from 'react-native';
import NetworkManager, { initializeNetworkManager, cleanupNetworkManager } from './src/utils/NetworkManager';
import { useNetworkManager } from './src/hooks/useNetworkManager';
import { NetworkManagerImpl } from './src/utils/NetworkManager';
import { dynamicConfig } from './src/config/dynamicConfig';

const queryClient = new QueryClient();

export default function App() {
  const [isNetworkInitialized, setIsNetworkInitialized] = useState(false);
  const { baseUrl, isDiscovering, error } = useNetworkManager();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Initializing dynamic configuration...');
        await dynamicConfig.initialize();
        
        console.log('[App] Initializing NetworkManager...');
        await initializeNetworkManager();
        
        setIsNetworkInitialized(true);
        console.log('[App] App initialization completed successfully');
      } catch (error) {
        console.error('[App] Failed to initialize app:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize app. Some features may not work properly.',
          [{ text: 'OK' }]
        );
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      console.log('[App] Cleaning up NetworkManager...');
      cleanupNetworkManager();
    };
  }, []);

  // Show loading state while network is initializing
  if (!isNetworkInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing network connection...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserDetailProvider>
          <NotificationProvider>
            <View style={styles.container}>
              <AppNavigator />
            </View>
          </NotificationProvider>
        </UserDetailProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  networkStatus: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 6,
    zIndex: 1000,
  },
  networkStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  networkErrorText: {
    color: '#ff6b6b',
    fontSize: 10,
    marginTop: 2,
  },
});
