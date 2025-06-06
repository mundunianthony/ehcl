export const updateFavourites = (id: string, favourites: string[]): string[] => {
  if (favourites.includes(id)) {
    return favourites.filter((resId) => resId !== id);
  } else {
    return [...favourites, id];
  }
};

export const checkFavourites = (id: string, favourites: string[]): string => {
  return favourites?.includes(id) ? "#8ac243" : "white";
};

export const validateString = (value: string | null | undefined): string | null => {
  return !value || value.length < 3 ? "Enter at least 3 characters" : null;
};

export const validatePhoneNumber = (phone: string | null | undefined): string | null => {
  if (!phone) return "Phone number is required";
  
  // Remove any non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if the number has at least 10 digits (international standard)
  if (digitsOnly.length < 10) {
    return "Phone number must have at least 10 digits";
  }
  
  // Check if the number starts with a valid country code or local prefix
  if (!phone.startsWith('+') && !phone.startsWith('0')) {
    return "Phone number must start with '+' or '0'";
  }
  
  return null;
};
