import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkManager } from '../hooks/useNetworkManager';
import NetworkManager from '../utils/NetworkManager';

export const NetworkStatus = () => {
  const { baseUrl, isDiscovering, error, refresh } = useNetworkManager();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if we have a valid connection
    const checkConnection = async () => {
      if (baseUrl) {
        try {
          const isReachable = await NetworkManager.ensureConnection();
          setIsConnected(isReachable);
        } catch (error) {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();
    setLastUpdated(new Date());
  }, [baseUrl]);

  const handleRefresh = async () => {
    try {
      await refresh();
      setLastUpdated(new Date());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh network connection');
    }
  };

  const getStatusColor = () => {
    if (isDiscovering) return '#ffa500'; // Orange for discovering
    if (error) return '#ff6b6b'; // Red for error
    if (isConnected) return '#51cf66'; // Green for connected
    return '#868e96'; // Gray for disconnected
  };

  const getStatusText = () => {
    if (isDiscovering) return 'Discovering...';
    if (error) return 'Error';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isDiscovering) return 'search';
    if (error) return 'alert-circle';
    if (isConnected) return 'checkmark-circle';
    return 'close-circle';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={20} color="#333" />
        <Text style={styles.title}>Network Status</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
        </View>
        
        {baseUrl && (
          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>Server:</Text>
            <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
              {baseUrl}
            </Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error.message}</Text>
          </View>
        )}
        
        {lastUpdated && (
          <Text style={styles.timestamp}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={handleRefresh}
        disabled={isDiscovering}
      >
        <Ionicons 
          name="refresh" 
          size={16} 
          color={isDiscovering ? '#ccc' : '#00796b'} 
        />
        <Text style={[styles.refreshButtonText, isDiscovering && styles.refreshButtonTextDisabled]}>
          {isDiscovering ? 'Discovering...' : 'Refresh'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  urlLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
    flex: 1,
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00796b',
    marginLeft: 6,
  },
  refreshButtonTextDisabled: {
    color: '#ccc',
  },
});

export default NetworkStatus;
