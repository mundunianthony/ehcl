import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { checkNetworkStatus, testApiConnection } from '../utils/network';
import AutoIPDetection from '../components/AutoIPDetection';

// Define types for network responses
type NetworkStatus = {
  isConnected: boolean;
  type?: string;
  ipAddress?: string;
  isInternetReachable?: boolean;
  error?: string;
};

type ApiResult = {
  success: boolean;
  status?: number;
  responseTime?: string;
  data?: any;
  error?: string;
};

export default function NetworkTestScreen() {
  const [logs, setLogs] = useState<string[]>(['Starting network tests...']);
  const [isTesting, setIsTesting] = useState(false);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setLogs(['Starting network tests...']);
    
    try {
      // Test network connectivity
      addLog('🔍 Checking network connectivity...');
      const networkStatus = await checkNetworkStatus(false) as NetworkStatus;
      
      if (networkStatus.isConnected) {
        addLog(`✅ Network connectivity is good (${networkStatus.type || 'unknown'})`);
        if (networkStatus.ipAddress) {
          addLog(`📱 IP Address: ${networkStatus.ipAddress}`);
        }
        
        // Test API connection
        addLog('\n🔌 Testing API connection...');
        const apiResult = await testApiConnection(false) as ApiResult;
        
        if (apiResult.success) {
          addLog(`✅ API connection successful${apiResult.responseTime ? ` (${apiResult.responseTime})` : ''}`);
          if (apiResult.status) {
            addLog(`📊 Status: ${apiResult.status}`);
          }
          if (apiResult.data) {
            addLog(`📦 Response: ${JSON.stringify(apiResult.data, null, 2)}`);
          }
        } else {
          addLog(`❌ API connection failed: ${apiResult.error || 'Unknown error'}`);
        }
      } else {
        addLog(`❌ Network issues detected: ${networkStatus.error || 'Unknown error'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network & API Tester</Text>
      
      {/* Auto IP Detection Component */}
      <AutoIPDetection />
      
      <View style={styles.buttonContainer}>
        <Button
          title={isTesting ? 'Testing...' : 'Run Tests'}
          onPress={runTests}
          disabled={isTesting}
        />
      </View>
      
      <View style={styles.logsContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 4,
  },
});
