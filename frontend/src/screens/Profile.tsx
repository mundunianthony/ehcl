import React, { useEffect, useState } from 'react';
import { Button, View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

interface ProfileProps {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
}

export default function Profile({ navigation }: ProfileProps) {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.is_staff) {
      setLoading(true);
      axios.get('/hospitals/')
        .then(res => setHospitals(res.data))
        .catch(() => setHospitals([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.first_name || user.email}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.label}>Role:</Text>
          <Text style={styles.value}>{user.is_staff ? 'Staff' : 'User'}</Text>
        </>
      ) : (
        <Text style={styles.error}>No user information available.</Text>
      )}

      {/* Hospital selection section for staff */}
      {user?.is_staff && (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
            Choose a hospital dashboard:
          </Text>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <ScrollView style={{ maxHeight: 200 }}>
              {hospitals.map(hospital => (
                <Button
                  key={hospital.id || hospital._id}
                  title={hospital.name || 'Unnamed Hospital'}
                  onPress={() => navigation.navigate('HospitalDashboard', { hospital_id: hospital.id || hospital._id })}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
}); 