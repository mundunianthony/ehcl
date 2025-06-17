import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDetailProvider } from './context/UserDetailContext';
import { AuthProvider } from './contexts/AuthContext';
import { Platform, StyleSheet, View } from 'react-native';
import ServerStatus from './components/ServerStatus';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserDetailProvider>
          <View style={styles.container}>
            <AppNavigator />
            {__DEV__ && <ServerStatus />}
          </View>
        </UserDetailProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 