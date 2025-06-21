import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDetailProvider } from './src/context/UserDetailContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { Platform, StyleSheet, View, Text, Alert } from 'react-native';

const queryClient = new QueryClient();

export default function App() {
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
});
