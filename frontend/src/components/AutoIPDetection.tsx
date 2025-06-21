import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { discoverServer } from '../utils/networkDiscovery';
import * as Network from 'expo-network';

export const AutoIPDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [deviceIP, setDeviceIP] = useState<string | null>(null);
  const [computerIP, setComputerIP] = useState<string | null>(null);
  const [serverURL, setServerURL] = useState<string | null>(null);
  const [lastDetection, setLastDetection] = useState<Date | null>(null);

  useEffect(() => {
    // Auto-detect on component mount
    detectIPs();
  }, []);

  const detectIPs = async () => {
    setIsDetecting(true);
    try {
      console.log('[AutoIPDetection] Starting automatic IP detection...');
      
      // Get device IP using Network API
      try {
        if (Network.getIpAddressAsync) {
          const deviceIPAddress = await Network.getIpAddressAsync();
          if (deviceIPAddress) {
            setDeviceIP(deviceIPAddress);
            console.log('[AutoIPDetection] Device IP detected:', deviceIPAddress);
          }
        }
      } catch (error) {
        console.warn('[AutoIPDetection] Could not get device IP:', error);
      }
      
      // Discover server (which will detect computer IP)
      const discoveredServer = await discoverServer(true);
      if (discoveredServer) {
        setServerURL(discoveredServer);
        
        // Extract computer IP from server URL
        const urlParts = discoveredServer.replace('http://', '').split(':');
        if (urlParts.length > 0) {
          setComputerIP(urlParts[0]);
          console.log('[AutoIPDetection] Computer IP detected:', urlParts[0]);
        }
      }
      
      setLastDetection(new Date());
      
      if (discoveredServer) {
        Alert.alert(
          'IP Detection Complete',
          `Device IP: ${deviceIP || 'Unknown'}\nComputer IP: ${computerIP || 'Unknown'}\nServer: ${discoveredServer}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'IP Detection Failed',
          'Could not automatically detect the computer IP. Make sure your Django server is running and both devices are on the same network.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('[AutoIPDetection] Error during IP detection:', error);
      Alert.alert('Error', 'Failed to detect IP addresses. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const getStatusColor = () => {
    if (isDetecting) return '#ffa500'; // Orange for detecting
    if (serverURL) return '#4CAF50'; // Green for success
    return '#f44336'; // Red for failure
  };

  const getStatusText = () => {
    if (isDetecting) return 'Detecting...';
    if (serverURL) return 'Connected';
    return 'Not Connected';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wifi" size={24} color="#007bff" />
        <Text style={styles.title}>Automatic IP Detection</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Android Device IP:</Text>
          <Text style={styles.value}>{deviceIP || 'Detecting...'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Computer IP:</Text>
          <Text style={styles.value}>{computerIP || 'Detecting...'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Server URL:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {serverURL || 'Not found'}
          </Text>
        </View>
        
        {lastDetection && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Detection:</Text>
            <Text style={styles.value}>
              {lastDetection.toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.detectButton, isDetecting && styles.detectButtonDisabled]} 
        onPress={detectIPs}
        disabled={isDetecting}
      >
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.detectButtonText}>
          {isDetecting ? 'Detecting...' : 'Detect IPs'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          • Automatically detects your Android device's IP address
        </Text>
        <Text style={styles.instructionText}>
          • Scans the local network to find your computer running Django
        </Text>
        <Text style={styles.instructionText}>
          • Connects to the discovered server automatically
        </Text>
        <Text style={styles.instructionText}>
          • Works when you change WiFi networks
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  detectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructions: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
});

export default AutoIPDetection; 