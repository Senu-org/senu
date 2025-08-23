import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

export interface PhoneNumberInfo {
  country: string;
  countryCode: string;
  nationalNumber: string;
  internationalNumber: string;
  isValid: boolean;
}

/**
 * Extract country information from a phone number
 * @param phoneNumber - The phone number to parse (can include country code)
 * @param defaultCountry - Optional default country code if the phone number doesn't include one
 * @returns PhoneNumberInfo object with country details
 */
export function getPhoneNumberInfo(phoneNumber: string, defaultCountry?: CountryCode): PhoneNumberInfo {
  try {
    // Clean up the phone number (remove whatsapp: prefix if present)
    const cleanNumber = phoneNumber.replace('whatsapp:', '');
    
    // Parse the phone number
    const parsedNumber = parsePhoneNumber(cleanNumber, defaultCountry);
    
    if (!parsedNumber) {
      return {
        country: 'Unknown',
        countryCode: '',
        nationalNumber: cleanNumber,
        internationalNumber: cleanNumber,
        isValid: false
      };
    }
    
    return {
      country: parsedNumber.country || 'Unknown',
      countryCode: parsedNumber.countryCallingCode || '',
      nationalNumber: parsedNumber.nationalNumber || cleanNumber,
      internationalNumber: parsedNumber.formatInternational() || cleanNumber,
      isValid: parsedNumber.isValid()
    };
  } catch (error) {
    console.error('Error parsing phone number:', error);
    return {
      country: 'Unknown',
      countryCode: '',
      nationalNumber: phoneNumber,
      internationalNumber: phoneNumber,
      isValid: false
    };
  }
}

/**
 * Get just the country name from a phone number
 * @param phoneNumber - The phone number to parse
 * @param defaultCountry - Optional default country code
 * @returns The country name or 'Unknown' if parsing fails
 */
export function getCountryFromPhoneNumber(phoneNumber: string, defaultCountry?: CountryCode): string {
  const info = getPhoneNumberInfo(phoneNumber, defaultCountry);
  return info.country;
}

/**
 * Get the country code from a phone number
 * @param phoneNumber - The phone number to parse
 * @param defaultCountry - Optional default country code
 * @returns The country code (e.g., 'US', 'MX', 'ES') or empty string if parsing fails
 */
export function getCountryCodeFromPhoneNumber(phoneNumber: string, defaultCountry?: CountryCode): string {
  const info = getPhoneNumberInfo(phoneNumber, defaultCountry);
  return info.country;
}
