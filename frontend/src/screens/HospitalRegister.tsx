import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { api } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { hospitalProfileStepManager } from '../utils/hospitalProfileSteps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HospitalRegister: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    // User Credentials
    user_email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validation
    const requiredFields = ['user_email', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Alert.alert('Error', `Please fill in ${field.replace('_', ' ')}`);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      console.log('=== Hospital Registration Debug ===');
      console.log('Form data:', { 
        user_email: formData.user_email,
        password_length: formData.password.length
      });
      console.log('API endpoint: hospitals/register/');
      console.log('Timestamp:', new Date().toISOString());
      
      // Test API client initialization
      console.log('Testing API client...');
      let response;
      
      try {
        // Try the configured API client first
        response = await api.post('hospitals/register/', {
          // User credentials only
          user_email: formData.user_email,
          password: formData.password,
        });
        console.log('✅ Used configured API client');
      } catch (apiError: any) {
        console.warn('⚠️ Configured API client failed, trying direct axios...');
        console.warn('API client error:', apiError.message);
        
        // Fallback to direct axios call
        response = await axios.post('http://localhost:8000/api/hospitals/register/', {
          user_email: formData.user_email,
          password: formData.password,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });
        console.log('✅ Used direct axios fallback');
      }

      console.log('✅ Hospital registration successful');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Automatically log in the user after successful registration
      try {
        console.log('🔄 Auto-logging in newly registered hospital...');
        const loginResponse = await api.post('hospitals/login/', {
          email: formData.user_email,
          password: formData.password,
        });
        
        const { access, refresh, user } = loginResponse.data;
        console.log('✅ Auto-login successful');
        
        // Store the tokens and user data manually since this is hospital login
        await Promise.all([
          AsyncStorage.setItem('token', access),
          AsyncStorage.setItem('refreshToken', refresh || ''),
          AsyncStorage.setItem('user', JSON.stringify(user))
        ]);
        
        // Reset hospital profile progress for new user
        await hospitalProfileStepManager.resetProgress();
        
        Alert.alert(
          'Success!', 
          'Hospital account created successfully! Let\'s set up your hospital profile.', 
          [
            { 
              text: 'Start Setup', 
              onPress: () => navigation.navigate('UpdateHospitalDetails' as never) 
            }
          ]
        );
        
      } catch (loginError: any) {
        console.error('❌ Auto-login failed:', loginError);
        Alert.alert(
          'Account Created', 
          'Hospital account created successfully! Please log in to complete your profile setup.', 
          [
            { text: 'OK', onPress: () => navigation.navigate('HospitalLogin' as never) }
          ]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Hospital registration error:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received - network error');
        console.error('Request config:', error.config);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      let errorMessage = 'Registration failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('HospitalLogin' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Icon name="medical" size={60} color="#4CAF50" />
            <Text style={styles.title}>Create Hospital Account</Text>
            <Text style={styles.subtitle}>Enter your email and password to create a hospital account</Text>
          </View>

          <View style={styles.form}>
            {/* Login Credentials Section */}
            <Text style={styles.sectionTitle}>Create Hospital Account</Text>
            
            <View style={styles.inputContainer}>
              <Icon name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address *"
                value={formData.user_email}
                onChangeText={(value) => updateFormData('user_email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password *"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
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

            <View style={styles.inputContainer}>
              <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon 
                  name={showConfirmPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have a hospital account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
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
  registerButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
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

export default HospitalRegister; 