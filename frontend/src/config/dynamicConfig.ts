import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Dynamic configuration that discovers server URL automatically
class DynamicConfig {
  private static instance: DynamicConfig;
  private apiUrl: string = '';
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() { }

  public static getInstance(): DynamicConfig {
    if (!DynamicConfig.instance) {
      DynamicConfig.instance = new DynamicConfig();
    }
    return DynamicConfig.instance;
  }

  /**
   * Initialize the dynamic configuration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('[DynamicConfig] Initializing dynamic configuration...');

      // In production, always use the deployed backend and clear any cached value
      if (!__DEV__) {
        this.apiUrl = 'http://localhost:8000/api';
        await SecureStore.setItemAsync('cached_api_url', this.apiUrl);
        this.isInitialized = true;
        return;
      }
      // Try to load cached API URL first (development only)
      const cachedUrl = await SecureStore.getItemAsync('cached_api_url');
      if (cachedUrl) {
        console.log('[DynamicConfig] Found cached API URL:', cachedUrl);
        this.apiUrl = cachedUrl;
        this.isInitialized = true;
        return;
      }
      // For development, try localhost
      if (__DEV__) {
        const localhostUrl = 'http://localhost:8000/api';
        console.log('[DynamicConfig] Development mode: Using localhost URL:', localhostUrl);
        this.apiUrl = localhostUrl;
        await SecureStore.setItemAsync('cached_api_url', localhostUrl);
        this.isInitialized = true;
        return;
      }
      // Fallback (should not be reached)
      this.apiUrl = '';
      this.isInitialized = true;
    } catch (error) {
      console.error('[DynamicConfig] Initialization error:', error);
      this.isInitialized = true; // Mark as initialized even on error
    }
  }

  /**
   * Get the current API URL
   */
  public getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Set the API URL dynamically
   */
  public async setApiUrl(url: string): Promise<void> {
    console.log('[DynamicConfig] Setting API URL dynamically:', url);
    this.apiUrl = url;
    await SecureStore.setItemAsync('cached_api_url', url);
  }

  /**
   * Clear the cached API URL to force rediscovery
   */
  public async clearCache(): Promise<void> {
    console.log('[DynamicConfig] Clearing cached API URL');
    this.apiUrl = '';
    await SecureStore.deleteItemAsync('cached_api_url');
  }

  /**
   * Check if configuration is initialized
   */
  public isConfigInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get endpoints with dynamic base URL
   */
  public getEndpoints() {
    return {
      login: `${this.apiUrl}/users/login/`,
      register: `${this.apiUrl}/users/register/`,
      logout: `${this.apiUrl}/users/logout/`,
      notifications: `${this.apiUrl}/notifications/`,
      hospitals: `${this.apiUrl}/hospitals/`,
      healthCenters: `${this.apiUrl}/health-centers/`,
    };
  }
}

// Export singleton instance
export const dynamicConfig = DynamicConfig.getInstance();

// Export for backward compatibility
export const API_URL = dynamicConfig.getApiUrl();
export const ENDPOINTS = dynamicConfig.getEndpoints();

// Export helper functions
export const getApiUrl = () => dynamicConfig.getApiUrl();
export const setApiUrl = (url: string) => dynamicConfig.setApiUrl(url);
export const clearApiCache = () => dynamicConfig.clearCache();

export const APP_NAME = 'Health Center Locator';
export const APP_VERSION = '1.0.0'; 