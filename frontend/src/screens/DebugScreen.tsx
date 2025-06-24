import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { crashReporter } from '../utils/crashReporter';

const DebugScreen = () => {
  const [crashLogs, setCrashLogs] = useState<any[]>([]);
  const [appInfo, setAppInfo] = useState<any>({});

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    // Load crash logs
    setCrashLogs(crashReporter.getCrashLogs());

    // Load app info
    setAppInfo({
      platform: Platform.OS,
      version: Platform.Version,
      isPad: Platform.isPad,
      isTV: Platform.isTV,
      timestamp: new Date().toISOString(),
    });
  };

  const clearCrashLogs = () => {
    Alert.alert(
      'Clear Crash Logs',
      'Are you sure you want to clear all crash logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            crashReporter.clearCrashLogs();
            setCrashLogs([]);
          },
        },
      ]
    );
  };

  const testCrash = () => {
    crashReporter.reportError('Test crash from debug screen', {
      test: true,
      timestamp: new Date().toISOString(),
    });
    setCrashLogs(crashReporter.getCrashLogs());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoContainer}>
          {Object.entries(appInfo).map(([key, value]) => (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{key}:</Text>
              <Text style={styles.infoValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Crash Logs ({crashLogs.length})</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={testCrash}>
              <Text style={styles.buttonText}>Test Crash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearCrashLogs}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {crashLogs.length === 0 ? (
          <Text style={styles.noLogs}>No crash logs found</Text>
        ) : (
          crashLogs.map((log, index) => (
            <View key={index} style={styles.crashLog}>
              <Text style={styles.crashTimestamp}>{log.timestamp}</Text>
              <Text style={styles.crashError}>{log.error}</Text>
              {log.context && (
                <Text style={styles.crashContext}>
                  Context: {JSON.stringify(log.context, null, 2)}
                </Text>
              )}
              {log.stack && (
                <Text style={styles.crashStack}>Stack: {log.stack}</Text>
              )}
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadDebugInfo}>
        <Text style={styles.refreshButtonText}>Refresh Debug Info</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#00796b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noLogs: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  crashLog: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  crashTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  crashError: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  crashContext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  crashStack: {
    fontSize: 10,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  refreshButton: {
    backgroundColor: '#00796b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DebugScreen; 