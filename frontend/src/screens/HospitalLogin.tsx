import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { hospitalAuthAPI } from '../services/api';
import { API_URL } from '../config/api';

const HospitalLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Log API URL when component mounts
  useEffect(() => {
    console.log('API URL:', API_URL);
    console.log('Hospital Login Component Mounted');
  }, []);

  const handleLogin = async () => {
    console.log('\n[Hospital Login Screen]');
    console.log('Current state:', { 
      email, 
      passwordLength: password?.length || 0, 
      loading 
    });
    
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      console.log(errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    setLoading(true);
    console.log('[HospitalLogin] Loading state set to true');

    try {
      console.log('Attempting hospital login with:', { 
        email,
        apiUrl: API_URL,
        timestamp: new Date().toISOString()
      });
      
      // Use the hospitalAuthAPI service
      console.log('Initiating hospital login request...');
      console.log('[HospitalLogin] About to call hospitalAuthAPI.login...');
      const { access: accessToken, refresh: refreshToken, user: userData } = await hospitalAuthAPI.login({ email, password });
      
      console.log('Hospital login successful, user:', userData);
      
      // Store auth data (similar to user login)
      // TODO: Create hospital auth context to handle this properly
      console.log('Hospital login successful!');
      Alert.alert('Success', 'Login successful!');
      
      // Navigate to hospital dashboard with hospital info
      // For now, we'll use a default hospital_id of 1 since we don't have the actual hospital_id
      (navigation as any).navigate('HospitalDashboard', { hospital_id: 1 });
      
    } catch (error: any) {
      console.error('\n[Hospital Login Error]');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log response details if available
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      
      // Log config details
      console.error('Request config:', error.config);
      
      Alert.alert('Error', error.message || 'Failed to login. Please try again.');
    } finally {
      console.log('[HospitalLogin] Finally block reached, setting loading to false');
      setLoading(false);
      console.log('Hospital login attempt completed');
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('HospitalRegister' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Icon name="medical" size={60} color="#4CAF50" />
          <Text style={styles.title}>Hospital Login</Text>
          <Text style={styles.subtitle}>Access your hospital dashboard and manage appointments</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hospital Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have a hospital account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Register New Hospital</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default HospitalLogin; 