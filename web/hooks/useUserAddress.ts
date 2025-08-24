import { useState, useCallback } from 'react';
import { apiService } from '@/lib/services/api';

export interface UseUserAddressReturn {
  receiverAddress: string | null;
  isLoading: boolean;
  error: string | null;
  fetchReceiverAddress: (phone: string) => Promise<void>;
  clearError: () => void;
}

export function useUserAddress(): UseUserAddressReturn {
  const [receiverAddress, setReceiverAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReceiverAddress = useCallback(async (phone: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert phone to numeric format
      const numericPhone = Number(String(phone).replace(/[^0-9]/g, ""));
      if (!numericPhone) {
        throw new Error('Invalid phone number format');
      }

      const response = await apiService.getWalletAddress(numericPhone);
      
      if (response.data?.wallet_address) {
        setReceiverAddress(response.data.wallet_address);
      } else {
        setError('Receiver does not have a valid wallet address configured');
        setReceiverAddress(null);
      }
    } catch (error) {
      console.error('Failed to fetch receiver address:', error);
      setError('Failed to fetch receiver wallet address');
      setReceiverAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    receiverAddress,
    isLoading,
    error,
    fetchReceiverAddress,
    clearError
  };
}
