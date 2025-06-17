import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  if (rootTag) {
    registerRootComponent(App);
  } else {
    console.error('Root element not found');
  }
} 