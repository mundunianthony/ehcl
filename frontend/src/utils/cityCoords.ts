// Mapping of Ugandan cities/districts to their latitude and longitude
// All keys are lowercase for normalization
export const cityCoords: Record<string, { latitude: number; longitude: number }> = {
  'arua': { latitude: 3.02, longitude: 30.91 },
  'fort portal': { latitude: 0.671, longitude: 30.275 },
  'gulu': { latitude: 2.8, longitude: 32.3 },
  'hoima': { latitude: 1.4356, longitude: 31.3436 },
  'iganga': { latitude: 0.6092, longitude: 33.4686 },
  'jinja': { latitude: 0.4244, longitude: 33.2042 },
  'kampala': { latitude: 0.3476, longitude: 32.5825 },
  'kamuli': { latitude: 0.9472, longitude: 33.1197 },
  'kasese': { latitude: 0.1833, longitude: 30.0833 },
  'kisoro': { latitude: -1.285, longitude: 29.6847 },
  'kitgum': { latitude: 3.2881, longitude: 32.8867 },
  'lira': { latitude: 2.249, longitude: 32.8998 },
  'masaka': { latitude: -0.3333, longitude: 31.7333 },
  'masindi': { latitude: 1.6741, longitude: 31.7154 },
  'mbale': { latitude: 1.08, longitude: 34.17 },
  'mbarara': { latitude: -0.6072, longitude: 30.6545 },
  'moroto': { latitude: 2.5333, longitude: 34.6667 },
  'nebbi': { latitude: 2.4792, longitude: 31.0858 },
  'soroti': { latitude: 1.6856, longitude: 33.6164 },
  'tororo': { latitude: 0.6928, longitude: 34.1811 },
  // Add more as needed
};

// Helper to get coordinates by normalized city name
export function getCoordsByCity(city?: string) {
  if (!city) return { latitude: 0, longitude: 0 };
  const key = city.trim().toLowerCase();
  return cityCoords[key] || { latitude: 0, longitude: 0 };
} 