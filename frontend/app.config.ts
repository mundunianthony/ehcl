import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ehcl',
  slug: 'ehcl',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/logo.jpg',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/logo.jpg',
      backgroundColor: '#ffffff'
    },
    package: 'com.munduni.emergencyhealthcenterlocator'
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  extra: {
    apiUrl: process.env.API_URL || 'https://ehcl-production.up.railway.app'
  },
  plugins: [
    'expo-secure-store'
  ]
}); 