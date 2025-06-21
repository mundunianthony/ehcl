import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Emergency Health Center Locator',
  slug: 'emergency-health-center-locator',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  extra: {
    apiUrl: process.env.API_URL || 'http://10.10.162.57:8000'
  },
  plugins: [
    'expo-secure-store'
  ]
}); 