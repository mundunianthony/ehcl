import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Dimensions
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { MediaTypeOptions } from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from "../types";
import { Hospital } from "../types";
import axios from 'axios';
import Constants from 'expo-constants';

// Get the API URL from environment variables or use production backend
const API_URL = process.env.API_URL || 'https://web-production-52fc7.up.railway.app';

type UploadImageScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UploadImage'>;

interface UploadImageScreenProps {
  navigation: UploadImageScreenNavigationProp;
  route: {
    params: {
      formValues: {
        country: string;
        city: string;
        address: string;
      }
    }
  }
}

const UploadImageScreen: React.FC<UploadImageScreenProps> = ({ navigation, route }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const pickImage = async () => {
    try {
      setLoading(true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      } else {
        Alert.alert('No Image Selected', 'Please select an image from your gallery');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'hospital-image.jpg',
      } as any);

      console.log('Uploading to:', `${API_URL}/api/upload-image/`);

      // Upload to your backend endpoint
      const response = await axios.post(`${API_URL}/api/upload-image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('Upload response:', response.data);
      return response.data.image_url;
    } catch (error: any) {
      console.error('Upload error details:', error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timed out. Please check your internet connection.');
      } else if (!error.response) {
        throw new Error('Network error. Please check if the server is running and accessible.');
      } else {
        throw new Error(error.response?.data?.error || 'Failed to upload image');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (!image) {
      Alert.alert('Error', 'Please upload an image');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadImage(image);
      
      navigation.navigate('BasicDetails', {
        formValues: route.params.formValues,
        image: imageUrl
      });
    } catch (error: any) {
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Upload Hospital Image</Text>
            <Text style={styles.subtitle}>
              Please upload a clear image of the hospital building
            </Text>
          </View>
          
          <View style={styles.imageContainer}>
            {image ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity 
                    style={styles.changeImageButton} 
                    onPress={pickImage}
                    activeOpacity={0.8}
                    disabled={uploading}
                  >
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePlaceholder}
                onPress={pickImage}
                activeOpacity={0.7}
                disabled={uploading}
              >
                <View style={styles.uploadIconContainer}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>+</Text>
                  </View>
                </View>
                <Text style={styles.placeholderText}>Tap to select an image</Text>
                <Text style={styles.placeholderSubtext}>
                  Choose a clear photo of the hospital
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{route.params.formValues.city}, {route.params.formValues.country}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{route.params.formValues.address}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.backButton]} 
              onPress={() => navigation.goBack()}
              disabled={uploading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.nextButton]} 
              onPress={handleNext}
              disabled={!image || loading || uploading}
            >
              {loading || uploading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.nextButtonText}>Next</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageWrapper: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  changeImageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  changeImageText: {
    color: '#0f766e',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadIconContainer: {
    marginBottom: 16,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -4,
  },
  placeholderText: {
    color: '#334155',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    marginLeft: 10,
  },
  backButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadImageScreen;
