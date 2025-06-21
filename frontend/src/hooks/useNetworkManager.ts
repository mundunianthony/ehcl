import { useState, useEffect } from 'react';
import NetworkManager from '../utils/NetworkManager';

export const useNetworkManager = () => {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = NetworkManager.subscribe((url: string | null) => {
      setBaseUrl(url);
      setError(null);
    });

    // Initial discovery
    const discover = async () => {
      try {
        setIsDiscovering(true);
        await NetworkManager.refresh();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Network discovery failed'));
      } finally {
        setIsDiscovering(false);
      }
    };

    discover();

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = async () => {
    try {
      setIsDiscovering(true);
      await NetworkManager.refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Network refresh failed'));
      throw err;
    } finally {
      setIsDiscovering(false);
    }
  };

  return {
    baseUrl,
    isDiscovering,
    error,
    refresh,
  };
};
