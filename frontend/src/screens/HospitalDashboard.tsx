import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api, hospitalAuthAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { hospitalProfileStepManager, HOSPITAL_PROFILE_STEPS } from '../utils/hospitalProfileSteps';

interface Appointment {
  id: number;
  user: number;
  user_email: string;
  user_phone: string;
  hospital: number;
  hospital_name: string;
  date: string;
  message: string;
  status: string;
}

interface Props {
  route: { params?: { hospital_id?: number } };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return 'time-outline';
    case 'confirmed':
      return 'checkmark-circle-outline';
    case 'cancelled':
      return 'close-circle-outline';
    case 'completed':
      return 'checkmark-done-circle-outline';
    default:
      return 'help-circle-outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'confirmed':
      return '#10b981';
    case 'cancelled':
      return '#ef4444';
    case 'completed':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

const HospitalDashboard: React.FC<Props> = ({ route }) => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Get hospital_id from route params if provided (for admin access)
  const hospital_id = route.params?.hospital_id;

  const fetchAppointments = async () => {
    setLoading(true);
    console.log('[HospitalDashboard] Fetching appointments from hospital dashboard');
    console.log('[HospitalDashboard] User:', user);
    console.log('[HospitalDashboard] Hospital ID from params:', hospital_id);
    
    try {
      const res = await hospitalAuthAPI.getDashboard();
      console.log('[HospitalDashboard] Response:', res);
      console.log('[HospitalDashboard] Response type:', typeof res);
      console.log('[HospitalDashboard] Is array:', Array.isArray(res));
      
      // Ensure we always set an array
      if (Array.isArray(res)) {
        setAppointments(res);
        console.log('[HospitalDashboard] Set appointments from array:', res.length);
      } else if (res && Array.isArray(res.results)) {
        setAppointments(res.results);
        console.log('[HospitalDashboard] Set appointments from results:', res.results.length);
      } else if (res && Array.isArray(res.appointments)) {
        setAppointments(res.appointments);
        console.log('[HospitalDashboard] Set appointments from appointments:', res.appointments.length);
      } else {
        console.warn('[HospitalDashboard] Unexpected response format:', res);
        setAppointments([]);
      }
    } catch (err: any) {
      console.error('[HospitalDashboard] Error fetching appointments:', err);
      console.error('[HospitalDashboard] Error response:', err.response?.data);
      console.error('[HospitalDashboard] Error status:', err.response?.status);
      setAppointments([]); // Set empty array on error
      if (err.response && err.response.data) {
        const backendMsg = err.response.data.message || JSON.stringify(err.response.data);
        Alert.alert('Error', 'Failed to fetch appointments: ' + backendMsg);
      } else {
        Alert.alert('Error', 'Failed to fetch appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  // Refresh appointments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[HospitalDashboard] Screen focused, refreshing appointments...');
      fetchAppointments();
    }, [])
  );

  useEffect(() => {
    const enforceProfileCompletion = async () => {
      await hospitalProfileStepManager.initialize();
      if (!hospitalProfileStepManager.isProfileComplete()) {
        const currentStep = hospitalProfileStepManager.getCurrentStep();
        const stepScreens: Record<number, string> = {
          1: 'UpdateHospitalDetails',
          2: 'HospitalLocation',
          3: 'HospitalConditions',
          4: 'HospitalConfirmation',
        };
        // Instead of navigation.reset, use navigation.navigate for type safety
        navigation.navigate(stepScreens[currentStep] as never);
      }
    };
    enforceProfileCompletion();
  }, []);

  useEffect(() => {
    console.log('[HospitalDashboard] Component mounted, fetching appointments...');
    fetchAppointments();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await hospitalAuthAPI.approveAppointment(id);
      } else {
        await hospitalAuthAPI.rejectAppointment(id);
      }
      Alert.alert('Success', `Appointment ${action}d successfully.`);
      fetchAppointments();
    } catch (err: any) {
      console.error(`[HospitalDashboard] Error on ${action}:`, err);
      if (err.response && err.response.data) {
        const backendMsg = err.response.data.message || JSON.stringify(err.response.data);
        Alert.alert('Error', `Failed to ${action} appointment: ${backendMsg}`);
      } else {
        Alert.alert('Error', `Failed to ${action} appointment.`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Appointments',
      'Are you sure you want to delete all appointments for this hospital? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await hospitalAuthAPI.clearAllAppointments();
            Alert.alert('Success', 'All appointments have been deleted.');
            fetchAppointments();
          } catch (err: any) {
            console.error('[HospitalDashboard] Error clearing appointments:', err);
            if (err.response && err.response.data) {
              const backendMsg = err.response.data.message || JSON.stringify(err.response.data);
              Alert.alert('Error', 'Failed to clear appointments: ' + backendMsg);
            } else {
              Alert.alert('Error', 'Failed to clear appointments.');
            }
          } finally {
            setLoading(false);
          }
        }}
      ]
    );
  };

  const handleDeleteAppointment = async (id: number) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setActionLoading(id);
            await hospitalAuthAPI.deleteAppointment(id);
            Alert.alert('Success', 'Appointment deleted successfully.');
            fetchAppointments();
          } catch (err: any) {
            console.error('[HospitalDashboard] Error deleting appointment:', err);
            if (err.response && err.response.data) {
              const backendMsg = err.response.data.message || JSON.stringify(err.response.data);
              Alert.alert('Error', 'Failed to delete appointment: ' + backendMsg);
            } else {
              Alert.alert('Error', 'Failed to delete appointment.');
            }
          } finally {
            setActionLoading(null);
          }
        }}
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => {
          try {
            // Call hospital logout API
            await hospitalAuthAPI.logout();
          } catch (error) {
            console.error('Hospital logout API error:', error);
            // Continue with local logout even if API call fails
          }
          
          // Clear local storage and state using the general logout
          await logout();
          
          // Navigate to hospital login screen
          navigation.navigate('HospitalLogin' as never);
        }}
      ]
    );
  };

  const handleCompleteProfile = () => {
    (navigation.navigate as any)('HospitalConfirmation');
  };

  const handleEditProfile = () => {
    navigation.navigate('UpdateHospitalDetails' as never);
  };

  const getStats = () => {
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Icon name="analytics-outline" size={24} color="#4F46E5" />
        <Text style={styles.statsTitle}>Dashboard Overview</Text>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
            <Icon name="calendar-outline" size={20} color="#1976d2" />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#fff3e0' }]}>
            <Icon name="time-outline" size={20} color="#f59e0b" />
          </View>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#e8f5e8' }]}>
            <Icon name="checkmark-circle-outline" size={20} color="#10b981" />
          </View>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#ffebee' }]}>
            <Icon name="close-circle-outline" size={20} color="#ef4444" />
          </View>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsCard}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionButton} onPress={onRefresh}>
          <Icon name="refresh-outline" size={24} color="#4F46E5" />
          <Text style={styles.quickActionText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleCompleteProfile}>
          <Icon name="person-outline" size={24} color="#4F46E5" />
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleClearAll}>
          <Icon name="trash-outline" size={24} color="#ef4444" />
          <Text style={[styles.quickActionText, { color: '#ef4444' }]}>Clear All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.quickActionText, { color: '#ef4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTitleRow}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          <View style={styles.appointmentInfo}>
            <Text style={styles.userEmail}>{item.user_email}</Text>
            <Text style={styles.appointmentDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.appointmentActions}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteAppointment(item.id)} 
            disabled={actionLoading === item.id}
          >
            <Icon name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        {item.user_phone && (
          <View style={styles.detailRow}>
            <Icon name="call-outline" size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.user_phone}</Text>
          </View>
        )}
        
        {item.message && (
          <View style={styles.detailRow}>
            <Icon name="chatbubble-outline" size={16} color="#666" style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={2}>{item.message}</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleAction(item.id, 'approve')}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="checkmark-outline" size={16} color="white" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleAction(item.id, 'reject')}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="close-outline" size={16} color="white" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      >
        {renderStatsCard()}
        {renderQuickActions()}
        
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-outline" size={20} color="#333" />
            <Text style={styles.sectionTitle}>Appointments</Text>
            <Text style={styles.appointmentCount}>({appointments.length})</Text>
          </View>
          
          {appointments.length > 0 ? (
            <View style={styles.appointmentsList}>
              {appointments.map((item) => (
                <View key={item.id}>
                  {renderAppointmentItem({ item })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptySubtext}>
                You don't have any appointment requests at the moment.
              </Text>
              <TouchableOpacity style={styles.refreshEmptyButton} onPress={onRefresh}>
                <Icon name="refresh-outline" size={16} color="#4F46E5" />
                <Text style={styles.refreshEmptyText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  quickActionText: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '500',
  },
  appointmentsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  appointmentCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
  },
  appointmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#ffebee',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    gap: 6,
  },
  refreshEmptyText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
});

export default HospitalDashboard; 