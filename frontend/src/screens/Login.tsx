import React, { useState } from 'react';
import { StyleSheet, Dimensions, ImageBackground } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Login: React.FC<{ navigation: NativeStackNavigationProp<RootStackParamList> }> = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    console.log('\n[Login Screen]');
    console.log('Current state:', { email, passwordLength: password.length, loading, error });
    
    if (!email || !password) {
      console.log('Missing required fields');
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });
      console.log('Password length:', password.length); // Don't log actual password
      
      // Log the current navigation state
      console.log('Navigation state:', navigation.getState());
      
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
    <ImageBackground
      source={{ uri: 'https://i.pinimg.com/736x/5c/4a/b5/5c4ab54f5e0d8b438d07d7375c997560.jpg' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.formContainer}>
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#ddd"
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
              placeholderTextColor="#ddd"
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 16,
    height: '100%',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 16,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  bottomText: {
    color: '#ccc',
    marginRight: 8,
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Login;
