import { api } from '../services/api';
import { Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface CreateNotificationData {
  user_email: string;
  title: string;
  message: string;
  type?: 'new_center' | 'facility_update' | 'system' | 'account' | 'emergency';
  data?: any;
}

class NotificationService {
  private retryCount = 0;
  private maxRetries = 3;
  private soundEnabled = true;
  private vibrationEnabled = true;
  private currentUserEmail: string | null = null;

  /**
   * Set the current user email for fallback authentication
   */
  setUserEmail(email: string | null) {
    this.currentUserEmail = email;
  }

  /**
   * Enable or disable notification sounds
   */
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  /**
   * Enable or disable notification vibration
   */
  setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled;
  }

  /**
   * Play notification sound and vibration
   */
  private playNotificationFeedback(type: string = 'system') {
    if (this.vibrationEnabled) {
      // Different vibration patterns for different notification types
      switch (type) {
        case 'emergency':
          Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Triple vibration for emergency
          break;
        case 'new_center':
          Vibration.vibrate([0, 300, 200, 300]); // Double vibration for new centers
          break;
        default:
          Vibration.vibrate(200); // Single vibration for regular notifications
      }
    }

    // TODO: Add sound support when expo-av is available
    // if (this.soundEnabled) {
    //   // Play notification sound
    // }
  }

  /**
   * Show notification alert (for immediate feedback)
   */
  private showNotificationAlert(title: string, message: string, type: string = 'system') {
    // Only show alert for important notifications
    if (type === 'emergency' || type === 'new_center') {
      Alert.alert(
        title,
        message,
        [
          { text: 'OK', style: 'default' },
          { text: 'View', style: 'default' } // Could navigate to relevant screen
        ]
      );
    }
  }

  /**
   * Get all notifications for the current user with better error handling
   */
  async getNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
    try {
      let allNotifications: Notification[] = [];
      let totalCount = 0;
      let page = 1;
      const pageSize = 100;

      // Always include user_email if not authenticated and currentUserEmail is set
      const baseUrl = this.currentUserEmail
        ? `notifications/?user_email=${encodeURIComponent(this.currentUserEmail)}&page_size=${pageSize}`
        : `notifications/?page_size=${pageSize}`;

      do {
        let response;
        const url = `${baseUrl}&page=${page}`;

        try {
          response = await api.get(url);
        } catch (authError: any) {
          // If authentication fails and no email, throw
          throw authError;
        }

        console.log(`[NotificationService] API Response Page ${page}:`, {
          hasResults: !!response.data?.results,
          resultsCount: response.data?.results?.length || 0,
          totalCount: response.data?.count || 0,
          pageSize: response.data?.page_size || 'unknown',
          currentPage: response.data?.page || page
        });

        if (response.data?.results) {
          allNotifications = allNotifications.concat(response.data.results);
          totalCount = response.data.count || 0;

          // Check if we've fetched all notifications
          if (response.data.results.length < pageSize || allNotifications.length >= totalCount) {
            break;
          }
        } else if (Array.isArray(response.data)) {
          allNotifications = allNotifications.concat(response.data);
          break; // No pagination info, assume this is all
        } else {
          console.warn('Unexpected notification response format:', response.data);
          break;
        }

        page++;
      } while (true);

      console.log(`[NotificationService] Total notifications fetched: ${allNotifications.length}`);

      return {
        notifications: allNotifications,
        unread_count: allNotifications.filter((n: Notification) => !n.is_read).length
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.warn('Authentication required for notifications');
        return { notifications: [], unread_count: 0 };
      }
      // Handle network errors with retry
      if (error.code === 'NETWORK_ERROR' && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying notification fetch (${this.retryCount}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.getNotifications();
      }
      this.retryCount = 0;
      return { notifications: [], unread_count: 0 };
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { unread_count } = await this.getNotifications();
      return unread_count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Create a new notification with better error handling and feedback
   */
  async createNotification(data: CreateNotificationData): Promise<Notification | null> {
    try {
      const response = await api.post('notifications/create/', {
        user_email: data.user_email,
        title: data.title,
        message: data.message,
        type: data.type || 'system',
        data: data.data || {}
      });

      // Play notification feedback for both new and duplicate notifications
      this.playNotificationFeedback(data.type);
      this.showNotificationAlert(data.title, data.message, data.type);

      // Handle case where notification already exists (200 OK) vs. new (201 Created)
      if (response.status === 200) {
        console.log('Notification already exists:', response.data.notification);
        return null; // Explicitly return null for duplicates
      }

      console.log('Notification created successfully:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('Error creating notification:', error);

      // Handle specific error cases
      if (error.response?.status === 404) {
        console.warn('Notification endpoint not found - user may not be authenticated');
        return null;
      }

      if (error.response?.status === 400) {
        console.warn('Invalid notification data:', error.response.data);
        return null;
      }

      if (error.response?.status === 429) {
        console.warn('Rate limit exceeded for notifications');
        return null;
      }

      return null;
    }
  }

  /**
   * Mark notifications as read with better error handling
   */
  async markAsRead(notificationIds: number[]): Promise<boolean> {
    console.log('[NotificationService] markAsRead called. currentUserEmail:', this.currentUserEmail);
    console.log('[NotificationService] notificationIds:', notificationIds);
    // Log token
    const token = await AsyncStorage.getItem('token');
    console.log('[NotificationService] auth_token:', token);
    try {
      let response;
      // First try with authentication
      try {
        console.log('[NotificationService] Attempting with authentication...');
        const reqBody = { notification_ids: notificationIds };
        console.log('[NotificationService] Request body:', reqBody);
        response = await api.post('notifications/', reqBody);
        console.log('[NotificationService] Response status:', response.status);

        // Check if the response indicates success
        if (response.status >= 200 && response.status < 300) {
          console.log('[NotificationService] markAsRead successful');
          return true;
        } else {
          console.log('[NotificationService] markAsRead failed with status:', response.status);
          return false;
        }
      } catch (authError: any) {
        // If authentication fails, try with user email in request body
        if (authError.response?.status === 401 && this.currentUserEmail) {
          console.log('[NotificationService] Authentication failed, trying with user email in request body');
          console.log('[NotificationService] Current user email:', this.currentUserEmail);
          const reqBody = { notification_ids: notificationIds, user_email: this.currentUserEmail };
          console.log('[NotificationService] Request body:', reqBody);
          response = await api.post('notifications/', reqBody);
          console.log('[NotificationService] Response status with user email:', response.status);

          // Check if the response indicates success
          if (response.status >= 200 && response.status < 300) {
            console.log('[NotificationService] markAsRead successful with user email');
            return true;
          } else {
            console.log('[NotificationService] markAsRead failed with user email, status:', response.status);
            return false;
          }
        } else {
          console.error('[NotificationService] Authentication error:', authError.response?.status, authError.response?.data);
          throw authError;
        }
      }
    } catch (error: any) {
      console.error('[NotificationService] Error marking notifications as read:', error);
      console.error('[NotificationService] Error response:', error.response?.data);
      console.error('[NotificationService] Error status:', error.response?.status);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const { notifications } = await this.getNotifications();
      const unreadIds = notifications
        .filter((n: Notification) => !n.is_read)
        .map((n: Notification) => n.id);

      if (unreadIds.length === 0) {
        return true;
      }

      return await this.markAsRead(unreadIds);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Create a simple system notification
   */
  async createSystemNotification(userEmail: string, title: string, message: string): Promise<Notification | null> {
    return this.createNotification({
      user_email: userEmail,
      title,
      message,
      type: 'system'
    });
  }

  /**
   * Create an emergency notification
   */
  async createEmergencyNotification(userEmail: string, title: string, message: string): Promise<Notification | null> {
    return this.createNotification({
      user_email: userEmail,
      title,
      message,
      type: 'emergency'
    });
  }

  /**
   * Create a new health center notification
   */
  async createNewCenterNotification(userEmail: string, centerName: string, distance: number): Promise<Notification | null> {
    return this.createNotification({
      user_email: userEmail,
      title: 'New Health Center Nearby',
      message: `A new health center "${centerName}" has been added ${distance.toFixed(1)}km from your location.`,
      type: 'new_center',
      data: { centerName, distance }
    });
  }

  /**
   * Create a location-based notification
   */
  async createLocationNotification(userEmail: string, title: string, message: string, locationData?: any): Promise<Notification | null> {
    return this.createNotification({
      user_email: userEmail,
      title,
      message,
      type: 'system',
      data: { location: locationData }
    });
  }

  /**
   * Create a test notification (for debugging)
   */
  async createTestNotification(userEmail: string): Promise<Notification | null> {
    return this.createNotification({
      user_email: userEmail,
      title: 'Test Notification',
      message: `This is a test notification created at ${new Date().toLocaleString()}`,
      type: 'system'
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<boolean> {
    console.log('[NotificationService] deleteNotification called. notificationId:', notificationId);
    console.log('[NotificationService] currentUserEmail:', this.currentUserEmail);
    // Log token
    const token = await AsyncStorage.getItem('token');
    console.log('[NotificationService] auth_token:', token);
    try {
      let url = `notifications/${notificationId}/`;
      if (this.currentUserEmail) {
        // Append user_email as a query parameter
        const encodedEmail = encodeURIComponent(this.currentUserEmail);
        url += `?user_email=${encodedEmail}`;
        console.log('[NotificationService] Using URL with user email:', url);
      } else {
        console.log('[NotificationService] Using URL without user email:', url);
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log('[NotificationService] Request headers:', headers);
      const response = await api.delete(url, { headers });
      console.log('[NotificationService] Response status:', response.status);
      console.log('[NotificationService] Response data:', response.data);

      // Check if the response indicates success (200 or 204)
      if (response.status === 200 || response.status === 204) {
        console.log('[NotificationService] deleteNotification successful');
        return true;
      } else {
        console.log('[NotificationService] deleteNotification failed with status:', response.status);
        return false;
      }
    } catch (error: any) {
      console.error('[NotificationService] Error deleting notification:', error);
      console.error('[NotificationService] Error response:', error.response?.data);
      console.error('[NotificationService] Error status:', error.response?.status);

      // Handle specific error cases
      if (error.response?.status === 404) {
        console.warn('[NotificationService] Notification not found - may have already been deleted');
        // Return true for 404 since the goal (deletion) is achieved
        return true;
      }

      if (error.response?.status === 401) {
        console.warn('[NotificationService] Authentication required');
        return false;
      }

      if (error.response?.status === 400) {
        console.warn('[NotificationService] Bad request:', error.response.data);
        return false;
      }

      return false;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{ total: number, unread: number, byType: Record<string, number> }> {
    try {
      const { notifications } = await this.getNotifications();
      const unread = notifications.filter((n: Notification) => !n.is_read).length;

      const byType = notifications.reduce((acc: Record<string, number>, n: Notification) => {
        acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: notifications.length,
        unread,
        byType
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, byType: {} };
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<boolean> {
    try {
      const { notifications } = await this.getNotifications();
      const deletePromises = notifications.map((n: Notification) => this.deleteNotification(n.id));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }

  /**
   * Create an emergency notification for user and all staff users
   */
  async createEmergencyNotificationForUserAndStaff(userEmail: string, title: string, message: string, data?: any): Promise<boolean> {
    try {
      console.log('[NotificationService] Creating emergency notification for user and staff:', {
        userEmail,
        title,
        message,
        data
      });

      const response = await api.post('notifications/emergency/', {
        user_email: userEmail,
        title,
        message,
        data: data || {}
      });

      console.log('[NotificationService] Emergency notification response:', response.data);
      return true;
    } catch (error: any) {
      console.error('[NotificationService] Error creating emergency notification for user and staff:', error);
      console.error('[NotificationService] Error response:', error.response?.data);
      return false;
    }
  }
}

// Export a singleton instance
export const notificationService = new NotificationService();

// Export convenience functions
export const createNotification = (data: CreateNotificationData) => notificationService.createNotification(data);
export const createSystemNotification = (userEmail: string, title: string, message: string) =>
  notificationService.createSystemNotification(userEmail, title, message);
export const createEmergencyNotification = (userEmail: string, title: string, message: string) =>
  notificationService.createEmergencyNotification(userEmail, title, message);
export const createNewCenterNotification = (userEmail: string, centerName: string, distance: number) =>
  notificationService.createNewCenterNotification(userEmail, centerName, distance);
export const createLocationNotification = (userEmail: string, title: string, message: string, locationData?: any) =>
  notificationService.createLocationNotification(userEmail, title, message, locationData);
export const createTestNotification = (userEmail: string) =>
  notificationService.createTestNotification(userEmail);
export const getUnreadCount = () => notificationService.getUnreadCount();
export const markAllAsRead = () => notificationService.markAllAsRead();
export const getNotificationStats = () => notificationService.getNotificationStats();
export const clearAllNotifications = () => notificationService.clearAllNotifications();
export const setSoundEnabled = (enabled: boolean) => notificationService.setSoundEnabled(enabled);
export const setVibrationEnabled = (enabled: boolean) => notificationService.setVibrationEnabled(enabled);
export const setUserEmail = (email: string | null) => notificationService.setUserEmail(email);
export const createEmergencyNotificationForUserAndStaff = (userEmail: string, title: string, message: string, data?: any) =>
  notificationService.createEmergencyNotificationForUserAndStaff(userEmail, title, message, data); 