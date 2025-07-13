import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkManager } from '../hooks/useNetworkManager';
import NetworkManager from '../utils/NetworkManager';
import { dynamicConfig } from '../config/dynamicConfig';
import { checkServerReachable } from '../utils/networkDiscovery';

export const DynamicNetworkStatus = () => {
  const { baseUrl, isDiscovering, error, refresh } = useNetworkManager();
  const [isConnected, setIsConnected] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkConnection();
    updateServerUrl();
  }, [baseUrl]);

  const checkConnection = async () => {
    if (baseUrl) {
      try {
        const reachable = await checkServerReachable(baseUrl);
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

  const updateServerUrl = async () => {
    try {
      const configUrl = dynamicConfig.getApiUrl();
      setCurrentServerUrl(configUrl || 'Not configured');
    } catch (error) {
      setCurrentServerUrl('Error getting URL');
    }
  };

  const handleRefresh = async () => {
    try {
      console.log('[DynamicNetworkStatus] Manual refresh requested...');
      
      // Clear cache to force fresh discovery
      await dynamicConfig.clearCache();
      
      // Refresh network manager
      await refresh();
      
      // Update server URL
      await updateServerUrl();
      
      // Check connection
      await checkConnection();
      
      console.log('[DynamicNetworkStatus] Manual refresh completed');
    } catch (error) {
      console.error('[DynamicNetworkStatus] Manual refresh failed:', error);
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
        <Text style={styles.title}>Dynamic Network Status</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
        </View>
        
        {currentServerUrl && (
          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>Dynamic Server:</Text>
            <Text style={styles.urlText} numberOfLines={2} ellipsizeMode="tail">
              {currentServerUrl}
            </Text>
          </View>
        )}
        
        {baseUrl && (
          <View style={styles.urlContainer}>
            <Text style={styles.urlLabel}>NetworkManager:</Text>
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
        
        {lastCheck && (
          <Text style={styles.timestamp}>
            Last check: {lastCheck.toLocaleTimeString()}
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
          {isDiscovering ? 'Discovering...' : 'Refresh Discovery'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  urlContainer: {
    marginBottom: 8,
  },
  urlLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  urlText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#c62828',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00796b',
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#00796b',
    fontWeight: '500',
    marginLeft: 8,
  },
  refreshButtonTextDisabled: {
    color: '#ccc',
  },
});

export default DynamicNetworkStatus; 