import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, ImageBackground, Platform } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import HospitalMapBackground from '../components/HospitalMapBackground';

const { width } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Login: React.FC<{ navigation: NativeStackNavigationProp<RootStackParamList> }> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Log API URL when component mounts
  useEffect(() => {
    console.log('API URL:', API_URL);
  }, []);

  const handleLogin = async () => {
    console.log('\n[Login Screen]');
    console.log('Current state:', { 
      email, 
      passwordLength: password?.length || 0, 
      loading, 
      error 
    });
    
    if (!email || !password) {
      const errorMsg = 'Please fill in all fields';
      console.log(errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { 
        email,
        apiUrl: API_URL,
        timestamp: new Date().toISOString()
      });
      
      // Directly attempt login without connection test
      console.log('Initiating login request...');
      await login(email, password);
      
      console.log('Login successful, navigating to Home');
      navigation.replace('Home');
    } catch (error: any) {
      console.error('\n[Login Error]');
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
      
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
      console.log('Login attempt completed');
    }
  };

  return (
    <HospitalMapBackground>
      <View style={styles.formContainer}>
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#333333"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={{ marginBottom: 16 }}>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#333333"
              style={styles.passwordInput}
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
        </View>

        {error ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don't have an account?</Text>
          <View style={{ marginLeft: 4 }}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignUp')}
              style={{ backgroundColor: 'transparent', padding: 0 }}
            >
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </HospitalMapBackground>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    color: '#333333',
    paddingHorizontal: 16,
    height: '100%',
    fontSize: 16,
    fontWeight: '700',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordInput: {
    flex: 1,
    color: '#333333',
    paddingHorizontal: 16,
    height: '100%',
    fontSize: 16,
    fontWeight: '700',
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffebeb',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#45a049',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  bottomText: {
    color: '#ffffff',
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Login;
