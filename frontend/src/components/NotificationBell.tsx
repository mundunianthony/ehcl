import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell: React.FC = () => {
  const { unreadCount, loading } = useNotifications();
  const navigation = useNavigation();

  // Handle bell press - navigate to notifications screen
  const handleBellPress = () => {
    if (loading) return;
    
    navigation.navigate('Notifications' as never);
  };

  // Show loading indicator or notification count
  const renderBadge = () => {
    if (loading) {
      return (
        <View style={[styles.badge, styles.loadingBadge]}>
          <Text style={styles.badgeText}>...</Text>
        </View>
      );
    }

    if (unreadCount > 0) {
      return (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.bellContainer, loading && styles.loadingContainer]} 
        onPress={handleBellPress}
        disabled={loading}
      >
        <Icon 
          name="notifications-outline" 
          size={24} 
          color={loading ? "#FF0000" : "#FF0000"}
        />
        
        {renderBadge()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellContainer: {
    padding: 8,
    position: 'relative',
    borderRadius: 20,
  },
  loadingContainer: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  loadingBadge: {
    backgroundColor: '#999',
    minWidth: 16,
    height: 16,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default NotificationBell;
