import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService, getUnreadCount } from '../services/notificationService';
import { Alert } from 'react-native';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  createNotification: (data: any) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  user: any; // Add user to the context type
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user email in notification service for fallback authentication
  useEffect(() => {
    console.log('[NotificationContext] Setting user email for notifications:', user?.email);
    console.log('[NotificationContext] User object:', user);
    console.log('[NotificationContext] Is user logged in:', !!user);
    if (user?.email) {
      notificationService.setUserEmail(user.email);
    } else {
      notificationService.setUserEmail(null);
    }
  }, [user?.email]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.email) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { notifications: notificationsData, unread_count } = await notificationService.getNotifications();
      setNotifications(notificationsData);
      setUnreadCount(unread_count);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Fetch notifications when user changes (initial load only)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Debug: log unreadCount and notifications whenever they change
  useEffect(() => {
    console.log('[NotificationContext] unreadCount:', unreadCount);
    console.log('[NotificationContext] notifications:', notifications);
  }, [unreadCount, notifications]);

  // Optimistic update for markAsRead
  const markAsRead = useCallback(async (id: number) => {
    // Store original state for rollback
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    
    try {
      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Make API call
      const success = await notificationService.markAsRead([id]);
      
      if (!success) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to manage your notifications.'
        );
        // Rollback on failure
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to manage your notifications.'
        );
      }
      // Rollback on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  }, [notifications, unreadCount]);

  // Optimistic update for deleteNotification
  const deleteNotification = useCallback(async (id: number) => {
    // Store original state for rollback
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    const notificationToDelete = notifications.find(n => n.id === id);
    
    // Check if notification exists in current state
    if (!notificationToDelete) {
      console.warn(`[NotificationContext] Notification ${id} not found in current state`);
      return;
    }
    
    // Add a small delay to prevent rapid successive deletions
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => {
        return notificationToDelete && !notificationToDelete.is_read ? Math.max(0, prev - 1) : prev;
      });
      
      // Make API call
      const success = await notificationService.deleteNotification(id);
      
      if (!success) {
        console.warn(`[NotificationContext] Failed to delete notification ${id} on server`);
        // Rollback on failure
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
        
        // Show user-friendly error message
        Alert.alert(
          'Delete Failed',
          'Failed to delete notification. Please try again.',
          [{ text: 'OK' }]
        );
      } else {
        console.log(`[NotificationContext] Successfully deleted notification ${id}`);
      }
    } catch (err: any) {
      console.error(`[NotificationContext] Error deleting notification ${id}:`, err);
      
      // Rollback on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
      
      // Handle specific error cases
      if (err?.response?.status === 404) {
        Alert.alert(
          'Notification Not Found',
          'This notification may have already been deleted.',
          [{ text: 'OK' }]
        );
        // Refresh notifications to sync with server state
        await fetchNotifications();
      } else if (err?.response?.status === 401) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to manage your notifications.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Delete Failed',
          'An error occurred while deleting the notification. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [notifications, unreadCount, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    // Store original state for rollback
    const originalNotifications = [...notifications];
    const originalUnreadCount = unreadCount;
    
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        // Update UI only on success
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      } else {
        Alert.alert(
          'Authentication Required',
          'Please log in again to manage your notifications.'
        );
        // Rollback on failure
        setNotifications(originalNotifications);
        setUnreadCount(originalUnreadCount);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        Alert.alert(
          'Authentication Required',
          'Please log in again to manage your notifications.'
        );
      }
      // Rollback on error
      setNotifications(originalNotifications);
      setUnreadCount(originalUnreadCount);
    }
  }, [notifications, unreadCount]);

  const createNotification = useCallback(async (data: any) => {
    try {
      const notification = await notificationService.createNotification(data);
      if (notification) {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.is_read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      const success = await notificationService.clearAllNotifications();
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        Alert.alert(
          'Clear All Failed',
          'Failed to clear all notifications. Please try again.'
        );
      }
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      Alert.alert(
        'Clear All Failed',
        'An error occurred while clearing all notifications. Please try again.'
      );
    }
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    clearAllNotifications,
    user, // Add user to the value object
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 