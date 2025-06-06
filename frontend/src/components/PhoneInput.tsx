import React, { useState, useCallback } from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface PhoneInputProps {
  value?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
}

export function PhoneInput({ value, onChangeText, placeholder, style }: PhoneInputProps) {
  const [internalValue, setInternalValue] = useState(value || '');

  // Format phone number with +256 prefix and proper spacing
  const formatPhoneNumber = useCallback((input: string) => {
    // Remove all non-digit characters except +
    let cleaned = input.replace(/\D/g, '').replace(/\+/g, '');
    
    // If input starts with +, keep it
    if (input.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    // If we don't have +256 yet and input length is sufficient
    if (!cleaned.startsWith('+256') && cleaned.length >= 10) {
      cleaned = '+256' + cleaned;
    }

    // Format as +256 XXX XXXXXX
    if (cleaned.startsWith('+256')) {
      const digits = cleaned.replace('+256', '');
      if (digits.length >= 9) {
        return `+256 ${digits.slice(0, 3)} ${digits.slice(3, 9)}`;
      } else if (digits.length >= 3) {
        return `+256 ${digits.slice(0, digits.length)}`;
      } else {
        return `+256 ${digits}`;
      }
    } else {
      // For numbers without +256 prefix
      if (cleaned.length >= 9) {
        return `+256 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 9)}`;
      } else if (cleaned.length >= 3) {
        return `+256 ${cleaned.slice(0, cleaned.length)}`;
      } else {
        return `+256 ${cleaned}`;
      }
    }
  }, []);

  const handleChange = useCallback((text: string) => {
    // Prevent adding multiple + symbols
    if (text.includes('+') && text.length > 1 && !text.startsWith('+')) {
      return;
    }

    const formatted = formatPhoneNumber(text);
    setInternalValue(formatted);
    onChangeText(formatted);
  }, [formatPhoneNumber, onChangeText]);

  return (
    <TextInput
      value={internalValue}
      onChangeText={handleChange}
      placeholder={placeholder || '+256 XXX XXXXXX'}
      keyboardType="phone-pad"
      style={[styles.input, style]}
      placeholderTextColor="#999"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
});
