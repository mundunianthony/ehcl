import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { 
  getNotificationStats, 
  clearAllNotifications, 
  createTestNotification,
  setSoundEnabled,
  setVibrationEnabled
} from '../services/notificationService';

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);

  useEffect(() => {
    loadNotificationStats();
  }, []);

  const loadNotificationStats = async () => {
    try {
      setLoading(true);
      const notificationStats = await getNotificationStats();
      setStats(notificationStats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabledState(value);
    setSoundEnabled(value);
  };

  const handleVibrationToggle = (value: boolean) => {
    setVibrationEnabledState(value);
    setVibrationEnabled(value);
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await clearAllNotifications();
              if (success) {
                Alert.alert('Success', 'All notifications have been cleared.');
                await loadNotificationStats();
              } else {
                Alert.alert('Error', 'Failed to clear notifications.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    try {
      setLoading(true);
      const success = await createTestNotification(user.email);
      if (success) {
        Alert.alert('Success', 'Test notification sent!');
        await loadNotificationStats();
      } else {
        Alert.alert('Error', 'Failed to send test notification.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    } finally {
      setLoading(false);
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color="#4F46E5" style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e0e0e0', true: '#4F46E5' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const renderActionItem = (
    title: string,
    subtitle: string,
    onPress: () => void,
    icon: string,
    color: string = '#4F46E5'
  ) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={color} style={styles.settingIcon} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Notification Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Object.keys(stats.byType).length}</Text>
            <Text style={styles.statLabel}>Types</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your notification preferences</Text>
      </View>

      {renderStatsCard()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {renderSettingItem(
          'Sound',
          'Play sound for new notifications',
          soundEnabled,
          handleSoundToggle,
          'volume-high'
        )}
        
        {renderSettingItem(
          'Vibration',
          'Vibrate for new notifications',
          vibrationEnabled,
          handleVibrationToggle,
          'phone-portrait'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        {renderActionItem(
          'Send Test Notification',
          'Send a test notification to verify settings',
          handleTestNotification,
          'notifications-outline'
        )}
        
        {renderActionItem(
          'Clear All Notifications',
          'Delete all notifications permanently',
          handleClearAllNotifications,
          'trash-outline',
          '#ff4444'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoItem}>
          <Icon name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Notifications help you stay informed about new health centers, emergency alerts, and important updates.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 16,
    flex: 1,
  },
}); 