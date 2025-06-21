import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetworkManager from '../utils/NetworkManager';
import { useNetworkManager } from '../hooks/useNetworkManager';

export const NetworkTestComponent = () => {
  const { baseUrl, isDiscovering, error, refresh } = useNetworkManager();
  const [isConnected, setIsConnected] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkConnection();
  }, [baseUrl]);

  const checkConnection = async () => {
    if (baseUrl) {
      try {
        const reachable = await NetworkManager.ensureConnection();
        setIsConnected(reachable);
        setLastCheck(new Date());
      } catch (err) {
        setIsConnected(false);
        console.error('Connection check failed:', err);
      }
    } else {
      setIsConnected(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      await checkConnection();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh network connection');
    }
  };

  const getStatusColor = () => {
    if (isDiscovering) return '#ffa500'; // Orange for discovering
    if (isConnected) return '#4CAF50'; // Green for connected
    if (error) return '#f44336'; // Red for error
    return '#9e9e9e'; // Gray for disconnected
  };

  const getStatusText = () => {
    if (isDiscovering) return 'Discovering...';
    if (isConnected) return 'Connected';
    if (error) return 'Error';
    return 'Disconnected';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {baseUrl && (
        <Text style={styles.urlText} numberOfLines={1}>
          Server: {baseUrl}
        </Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>
          Error: {error.message}
        </Text>
      )}
      
      {lastCheck && (
        <Text style={styles.lastCheckText}>
          Last check: {lastCheck.toLocaleTimeString()}
        </Text>
      )}
      
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  urlText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    marginBottom: 4,
  },
  lastCheckText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default NetworkTestComponent; 