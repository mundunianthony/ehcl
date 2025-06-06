// List of hospital-related image keywords for different types of hospitals
export const HOSPITAL_IMAGE_KEYWORDS = [
  'hospital', 
  'medical center',
  'clinic',
  'healthcare',
  'emergency room',
  'medical facility',
  'doctor office',
  'medical building'
];

// Function to get a random image URL for a hospital
export const getHospitalImageUrl = (hospitalName: string, width = 800, height = 600): string => {
  // Use the first word of the hospital name or a default keyword
  const namePart = hospitalName.split(' ')[0]?.toLowerCase() || 'hospital';
  
  // Generate a random index to select from our keywords
  const randomIndex = Math.floor(Math.random() * HOSPITAL_IMAGE_KEYWORDS.length);
  const keyword = HOSPITAL_IMAGE_KEYWORDS[randomIndex];
  
  // Use Unsplash as a source for free-to-use images
  return `https://source.unsplash.com/random/${width}x${height}/?${keyword},${namePart},medical`;
};

/**
 * Generates a reliable placeholder image URL for hospitals
 * Uses a combination of the hospital name and a consistent color scheme
 */
export const getPlaceholderImageUrl = (hospitalName: string): string => {
  // Use a reliable placeholder service with proper image format
  const encodedName = encodeURIComponent(hospitalName);
  // Use a more reliable placeholder service with explicit PNG format
  return `https://placehold.co/800x400/1a3c34/ffffff.png?text=${encodedName}`;
};

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Check if it's a valid URL
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check if it's a supported image format
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return supportedFormats.some(format => url.toLowerCase().endsWith(format));
};
