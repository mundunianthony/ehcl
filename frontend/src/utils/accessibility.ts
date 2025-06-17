import { Platform } from 'react-native';

/**
 * Fixes focus trap issues for React Native Web
 * by providing proper attributes instead of aria-hidden
 */
export const getFocusTrapProps = () => {
  if (Platform.OS !== 'web') {
    return {};
  }
  
  return {
    // Use inert instead of aria-hidden when possible
    inert: 'true',
    // For browsers that don't support inert
    tabIndex: -1,
    'aria-hidden': undefined,
  };
};

/**
 * Returns props for accessible modal containers
 */
export const getAccessibleModalProps = () => {
  if (Platform.OS !== 'web') {
    return {};
  }
  
  return {
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1,
  };
}; 