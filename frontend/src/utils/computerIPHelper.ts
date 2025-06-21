/**
 * Helper utility for finding computer IP address manually
 * This provides instructions for different operating systems
 */

export interface IPDetectionInstructions {
  windows: string[];
  mac: string[];
  linux: string[];
  android: string[];
}

export const getIPDetectionInstructions = (): IPDetectionInstructions => ({
  windows: [
    "1. Open Command Prompt (cmd)",
    "2. Type: ipconfig",
    "3. Look for 'IPv4 Address' under your WiFi adapter",
    "4. It will look like: 192.168.1.xxx",
    "5. Use this IP address in your Django server"
  ],
  mac: [
    "1. Open System Preferences",
    "2. Click on 'Network'",
    "3. Select your WiFi connection",
    "4. Your IP address will be shown",
    "5. Or use Terminal: ifconfig | grep 'inet '"
  ],
  linux: [
    "1. Open Terminal",
    "2. Type: ip addr show",
    "3. Or type: hostname -I",
    "4. Look for your local IP (usually 192.168.x.x)",
    "5. Use this IP in your Django server"
  ],
  android: [
    "1. Go to Settings > Network & Internet",
    "2. Tap on WiFi",
    "3. Tap on your connected network",
    "4. Your IP address will be shown",
    "5. Or use a network scanner app"
  ]
});

export const getDjangoServerInstructions = (): string[] => [
  "To run Django server on your computer:",
  "1. Open terminal/command prompt",
  "2. Navigate to your Django project folder",
  "3. Run: python manage.py runserver 0.0.0.0:8000",
  "4. This makes the server accessible from other devices",
  "5. Your computer IP will be automatically detected by the app"
];

export const getTroubleshootingTips = (): string[] => [
  "Troubleshooting Tips:",
  "• Make sure both devices are on the same WiFi network",
  "• Check if your firewall is blocking port 8000",
  "• Try running Django with: python manage.py runserver 0.0.0.0:8000",
  "• Ensure your router allows local network communication",
  "• If using Windows, check Windows Defender Firewall settings"
];

/**
 * Get common network ranges for different router brands
 */
export const getCommonNetworkRanges = (): Record<string, string[]> => ({
  "Common Router IPs": [
    "192.168.1.1",
    "192.168.0.1", 
    "10.0.0.1",
    "192.168.2.1"
  ],
  "Common Computer IPs": [
    "192.168.1.2-254",
    "192.168.0.2-254",
    "10.0.0.2-254"
  ]
});

/**
 * Validate if an IP address is in a valid local network format
 */
export const isValidLocalIP = (ip: string): boolean => {
  const ipRegex = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)\d{1,3}$/;
  return ipRegex.test(ip);
};

/**
 * Extract network range from an IP address
 */
export const getNetworkRange = (ip: string): string | null => {
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }
  return null;
}; 