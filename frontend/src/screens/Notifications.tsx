import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'emergency':
      return 'warning';
    case 'new_center':
      return 'location';
    case 'facility_update':
      return 'medical';
    case 'account':
      return 'person';
    default:
      return 'notifications';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'emergency':
      return '#ff4444';
    case 'new_center':
      return '#4CAF50';
    case 'facility_update':
      return '#2196F3';
    case 'account':
      return '#9C27B0';
    default:
      return '#666';
  }
};

export default function Notifications() {
  const { 
    notifications, 
    loading, 
    error, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
    user
  } = useNotifications();
  
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollProgress, setScrollProgress] = useState(0);

  // Debug logs for component state changes
  console.log('[Notifications Debug] Component state:', {
    notificationsCount: notifications.length,
    loading,
    error,
    showScrollIndicator,
    scrollProgress,
    userEmail: user?.email,
    allNotificationIds: notifications.map(n => n.id)
  });

  const handleMarkAllAsRead = async () => {
    if (notifications.length === 0) return;
    
    try {
      await markAllAsRead();
      Alert.alert('Success', 'All notifications marked as read');
    } catch (e) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id) }
      ]
    );
  };

  const handleClearAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: async () => {
          try {
            await clearAllNotifications();
            Alert.alert('Success', 'All notifications have been cleared');
          } catch (e) {
            Alert.alert('Error', 'Failed to clear all notifications');
          }
        }}
      ]
    );
  };

  const navigateToSettings = () => {
    navigation.navigate('NotificationSettings' as never);
  };

  const testAuthentication = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('[Notifications] Current token:', token);
    console.log('[Notifications] Current user:', user);
    console.log('[Notifications] User email:', user?.email);
    
    Alert.alert(
      'Authentication Debug',
      `Token: ${token ? 'Present' : 'Missing'}\nUser: ${user?.email || 'None'}\nLogged in: ${!!user}`,
      [{ text: 'OK' }]
    );
  };

  const createTestNotifications = async () => {
    console.log('[Notifications Debug] createTestNotifications called');
    if (!user?.email) {
      console.log('[Notifications Debug] No user email, showing alert');
      Alert.alert('Error', 'Please log in first');
      return;
    }
    
    try {
      console.log('[Notifications Debug] Creating 50 test notifications for user:', user.email);
      // Create 50 test notifications
      for (let i = 1; i <= 50; i++) {
        console.log(`[Notifications Debug] Creating test notification ${i}/50`);
        await notificationService.createNotification({
          user_email: user.email,
          title: `Test Notification ${i}`,
          message: `This is test notification number ${i} to test scrolling functionality. This is a longer message to ensure the notification takes up more space.`,
          type: 'system'
        });
      }
      console.log('[Notifications Debug] All test notifications created successfully');
      Alert.alert('Success', 'Created 50 test notifications. Use refresh button to see them.');
      refreshNotifications();
    } catch (error) {
      console.error('[Notifications Debug] Error creating test notifications:', error);
      Alert.alert('Error', 'Failed to create test notifications');
    }
  };

  const manualRefresh = async () => {
    console.log('[Notifications Debug] Manual refresh called');
    try {
      await refreshNotifications();
      console.log('[Notifications Debug] Manual refresh completed, notifications count:', notifications.length);
    } catch (error) {
      console.error('[Notifications Debug] Manual refresh failed:', error);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;
        
        console.log('[Notifications Scroll Debug]', {
          offsetY,
          contentHeight,
          layoutHeight,
          isScrollable: contentHeight > layoutHeight + 10,
          notificationsCount: notifications.length,
          showScrollIndicator: showScrollIndicator,
          difference: contentHeight - layoutHeight
        });
        
        // Show scroll indicator if content is scrollable
        if (contentHeight > layoutHeight + 10) { // Add small buffer
          console.log('[Notifications Scroll Debug] Content is scrollable, showing indicators');
          setShowScrollIndicator(true);
          
          // Calculate scroll progress
          const maxScroll = contentHeight - layoutHeight;
          const progress = maxScroll > 0 ? (offsetY / maxScroll) * 100 : 0;
          const roundedProgress = Math.min(progress, 100);
          console.log('[Notifications Scroll Debug] Scroll progress:', {
            maxScroll,
            progress: roundedProgress,
            offsetY
          });
          setScrollProgress(roundedProgress);
        } else {
          console.log('[Notifications Scroll Debug] Content is not scrollable, hiding indicators');
          setShowScrollIndicator(false);
          setScrollProgress(0);
        }
      }
    }
  );

  const scrollToTop = () => {
    console.log('[Notifications Scroll Debug] scrollToTop called');
    console.log('[Notifications Scroll Debug] flatListRef current:', !!flatListRef.current);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    console.log('[Notifications Scroll Debug] scrollToTop completed');
  };

  const renderItem = ({ item, index }: { item: Notification; index: number }) => {
    console.log(`[Notifications Debug] Rendering notification ${index + 1}/${notifications.length}:`, item.title);
    return (
      <TouchableOpacity
        style={[styles.notification, !item.is_read && styles.unread]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleRow}>
            <Icon 
              name={getNotificationIcon(item.notification_type)} 
              size={20} 
              color={getNotificationColor(item.notification_type)} 
              style={styles.notificationIcon}
            />
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <View style={styles.notificationActions}>
            {!item.is_read && <View style={styles.unreadDot} />}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteNotification(item.id)}
            >
              <Icon name="trash-outline" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{formatDate(item.created_at)}</Text>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshNotifications}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAllNotifications}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.refreshButton} onPress={manualRefresh}>
            <Icon name="refresh-outline" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Scroll position indicator */}
      {showScrollIndicator && (
        <View style={styles.scrollPositionIndicator}>
          <Text style={styles.scrollPositionText}>
            {notifications.length} notifications • {Math.round(scrollProgress)}% scrolled
          </Text>
        </View>
      )}
      
      <View 
        style={styles.listContainer}
        onLayout={(event) => {
          console.log('[Notifications Scroll Debug] ListContainer onLayout:', {
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width
          });
        }}
      >
        <FlatList
          ref={flatListRef}
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          style={styles.notificationsList}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews={false}
          onLayout={(event) => {
            console.log('[Notifications Scroll Debug] FlatList onLayout:', {
              height: event.nativeEvent.layout.height,
              width: event.nativeEvent.layout.width
            });
          }}
          onContentSizeChange={(width, height) => {
            console.log('[Notifications Scroll Debug] FlatList onContentSizeChange:', {
              width,
              height,
              notificationsCount: notifications.length
            });
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off-outline" size={64} color="#ccc" />
              <Text style={styles.empty}>No notifications</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          }
        />
      </View>
      
      {/* Scroll to top button */}
      {showScrollIndicator && (
        <TouchableOpacity 
          style={styles.scrollToTopButton}
          onPress={scrollToTop}
        >
          <Icon name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 10 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  markAllButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 100,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 100,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  testButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  debugButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  notification: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    minHeight: 80, // Ensure minimum height for scrollable content
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    marginRight: 8,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unread: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    padding: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  empty: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  listContentContainer: {
    paddingBottom: 20, // Add some padding at the bottom for the last item
  },
  notificationsList: {
    flex: 1, // Takes up all available space
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4F46E5',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollPositionIndicator: {
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  scrollPositionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
    elevation: 1,
    maxHeight: '80%', // Constrain height to ensure scrolling
  },
}); 