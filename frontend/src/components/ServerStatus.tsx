import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { api } from '../config/api';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [serverIP, setServerIPValue] = useState('');
  const [showStatus, setShowStatus] = useState(__DEV__); // Only show in development mode

  useEffect(() => {
    checkServerConnection();
  }, []);

  const checkServerConnection = async () => {
    try {
      setServerStatus('checking');
      // Try a simple request to check connection
      await api.get('/hospitals/all/');
      setServerStatus('connected');
    } catch (error) {
      console.error('Server connection error:', error);
      setServerStatus('error');
    }
  };

  const handleServerIPChange = () => {
    if (serverIP.trim()) {
      // Note: setServerIP function is not available in the new API
      // You may need to implement this functionality differently
      console.log('Setting server IP:', serverIP.trim());
      // Wait a bit for the new URL to take effect
      setTimeout(() => {
        checkServerConnection();
      }, 500);
    }
  };

  if (!showStatus) return null;

  // Only show on physical devices, not emulators or web
  const currentBaseURL = api.defaults.baseURL || '';
  const shouldShowIPInput = Platform.OS !== 'web' && !['10.0.2.2', 'localhost'].includes(currentBaseURL.replace('http://', '').split(':')[0] || '');

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusIndicator, 
        { backgroundColor: 
          serverStatus === 'connected' ? '#4CAF50' : 
          serverStatus === 'checking' ? '#FFC107' : '#F44336' 
        }
      ]} />
      
      <Text style={styles.statusText}>
        Server: {
          serverStatus === 'connected' ? 'Connected' : 
          serverStatus === 'checking' ? 'Checking...' : 'Connection Error'
        }
      </Text>
      
      {serverStatus === 'error' && shouldShowIPInput && (
        <View style={styles.ipInputContainer}>
          <TextInput
            style={styles.ipInput}
            placeholder="Enter your computer's IP"
            value={serverIP}
            onChangeText={setServerIPValue}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleServerIPChange}>
            <Text style={styles.buttonText}>Set</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={checkServerConnection}>
        <Text style={styles.refreshText}>↻</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.closeButton} onPress={() => setShowStatus(false)}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  ipInputContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  ipInput: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 4,
    width: 120,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 4,
    padding: 4,
    marginLeft: 4,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  refreshButton: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
});

export default ServerStatus; 