import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import NetworkManager from '../utils/NetworkManager';
import { discoverServer, checkServerReachable } from '../utils/networkDiscovery';
import { getCurrentApiUrl } from '../config/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const NetworkTestScreen = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [networkState, setNetworkState] = useState<any>(null);

  useEffect(() => {
    checkNetworkState();
  }, []);

  const checkNetworkState = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setNetworkState(state);
    } catch (error) {
      console.error('Error checking network state:', error);
    }
  };

  const addResult = (name: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setResults(prev => [...prev, { name, status, message, details }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    // Test 1: Network State
    addResult('Network State', 'pending', 'Checking network connectivity...');
    try {
      const state = await Network.getNetworkStateAsync();
      setNetworkState(state);
      if (state.isConnected && state.isInternetReachable) {
        addResult('Network State', 'success', 'Network is connected and internet is reachable', state);
      } else {
        addResult('Network State', 'error', 'Network is not properly connected', state);
      }
    } catch (error) {
      addResult('Network State', 'error', `Error checking network: ${error}`, error);
    }

    // Test 2: IP Address
    addResult('IP Address', 'pending', 'Getting device IP address...');
    try {
      const ip = await Network.getIpAddressAsync();
      if (ip) {
        addResult('IP Address', 'success', `Device IP: ${ip}`, { ip });
      } else {
        addResult('IP Address', 'error', 'Could not determine IP address');
      }
    } catch (error) {
      addResult('IP Address', 'error', `Error getting IP: ${error}`, error);
    }

    // Test 3: Localhost Connection
    addResult('Localhost Test', 'pending', 'Testing localhost connection...');
    try {
      const isReachable = await checkServerReachable('http://localhost:8081');
      if (isReachable) {
        addResult('Localhost Test', 'success', 'Localhost server is reachable');
      } else {
        addResult('Localhost Test', 'error', 'Localhost server is not reachable');
      }
    } catch (error) {
      addResult('Localhost Test', 'error', `Error testing localhost: ${error}`, error);
    }

    // Test 4: Hardcoded IP Connection
    addResult('Hardcoded IP Test', 'pending', 'Testing hardcoded IP connection...');
    try {
      const isReachable = await checkServerReachable('http://192.168.141.68:8081');
      if (isReachable) {
        addResult('Hardcoded IP Test', 'success', 'Hardcoded IP server is reachable');
      } else {
        addResult('Hardcoded IP Test', 'error', 'Hardcoded IP server is not reachable');
      }
    } catch (error) {
      addResult('Hardcoded IP Test', 'error', `Error testing hardcoded IP: ${error}`, error);
    }

    // Test 5: Server Discovery
    addResult('Server Discovery', 'pending', 'Running server discovery...');
    try {
      const discoveredUrl = await discoverServer(true);
      if (discoveredUrl) {
        addResult('Server Discovery', 'success', `Discovered server at: ${discoveredUrl}`, { url: discoveredUrl });
      } else {
        addResult('Server Discovery', 'error', 'No server discovered on network');
      }
    } catch (error) {
      addResult('Server Discovery', 'error', `Error during discovery: ${error}`, error);
    }

    // Test 6: NetworkManager
    addResult('NetworkManager', 'pending', 'Testing NetworkManager...');
    try {
      const baseUrl = await NetworkManager.getBaseUrl();
      if (baseUrl) {
        addResult('NetworkManager', 'success', `NetworkManager base URL: ${baseUrl}`, { url: baseUrl });
      } else {
        addResult('NetworkManager', 'error', 'NetworkManager returned no base URL');
      }
    } catch (error) {
      addResult('NetworkManager', 'error', `Error with NetworkManager: ${error}`, error);
    }

    // Test 7: API URL
    addResult('API URL', 'pending', 'Getting current API URL...');
    try {
      const apiUrl = await getCurrentApiUrl();
      if (apiUrl) {
        addResult('API URL', 'success', `Current API URL: ${apiUrl}`, { url: apiUrl });
      } else {
        addResult('API URL', 'error', 'Could not get current API URL');
      }
    } catch (error) {
      addResult('API URL', 'error', `Error getting API URL: ${error}`, error);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network Test</Text>
        <Text style={styles.subtitle}>Debug network connectivity issues</Text>
      </View>

      {networkState && (
        <View style={styles.networkStateContainer}>
          <Text style={styles.sectionTitle}>Current Network State</Text>
          <View style={styles.networkStateItem}>
            <Text style={styles.label}>Connected:</Text>
            <Text style={[styles.value, { color: networkState.isConnected ? '#4CAF50' : '#F44336' }]}>
              {networkState.isConnected ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.networkStateItem}>
            <Text style={styles.label}>Internet Reachable:</Text>
            <Text style={[styles.value, { color: networkState.isInternetReachable ? '#4CAF50' : '#F44336' }]}>
              {networkState.isInternetReachable ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.networkStateItem}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.value}>{networkState.type || 'Unknown'}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonDisabled]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="play" size={20} color="#fff" />
          )}
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Ionicons name="refresh" size={20} color="#007AFF" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={getStatusIcon(result.status)}
                  size={20}
                  color={getStatusColor(result.status)}
                />
                <Text style={styles.resultName}>{result.name}</Text>
                <Text style={[styles.resultStatus, { color: getStatusColor(result.status) }]}>
                  {result.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.details && (
                <Text style={styles.resultDetails}>
                  {JSON.stringify(result.details, null, 2)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  networkStateContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  networkStateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  resultsContainer: {
    margin: 20,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultDetails: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
});

export default NetworkTestScreen;
