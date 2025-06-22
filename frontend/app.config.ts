import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Emergency Health Center Locator',
  slug: 'emergency-health-center-locator',
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
    apiUrl: process.env.API_URL || 'https://ehcl-production.up.railway.app',
    eas: {
      projectId: 'aa00d066-7bdd-4dcf-8221-998d2a4773f0'
    }
  },
  plugins: [
    'expo-secure-store'
  ]
}); 