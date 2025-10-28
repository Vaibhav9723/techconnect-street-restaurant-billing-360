import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { encryptJSON, decryptJSON } from '@/utils/crypto';
import { STORAGE_KEYS } from '@/utils/storage';

export function useEncryptedStorage<T>(
  storageKey: string,
  defaultValue: T
) {
  const { cryptoKey, isUnlocked } = useAuth();
  const defaultValueRef = useRef(defaultValue);
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load encrypted data
  const loadData = useCallback(async () => {
    if (!cryptoKey || !isUnlocked) {
      setData(defaultValueRef.current);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const encryptedStr = localStorage.getItem(storageKey);

      if (!encryptedStr) {
        // No data yet, use default
        setData(defaultValueRef.current);
        setError(null);
      } else {
        // Decrypt existing data
        const encrypted = JSON.parse(encryptedStr);
        const decrypted = await decryptJSON(cryptoKey, encrypted);
        setData(decrypted);
        setError(null);
      }
    } catch (err) {
      console.error(`Error loading ${storageKey}:`, err);
      setError('Failed to decrypt data');
      setData(defaultValueRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [cryptoKey, isUnlocked, storageKey]);

  // Save encrypted data
  const saveData = useCallback(async (newData: T) => {
    if (!cryptoKey || !isUnlocked) {
      throw new Error('Cannot save data: not unlocked');
    }

    try {
      const encrypted = await encryptJSON(cryptoKey, newData);
      localStorage.setItem(storageKey, JSON.stringify(encrypted));
      setData(newData);
      setError(null);
    } catch (err) {
      console.error(`Error saving ${storageKey}:`, err);
      setError('Failed to encrypt data');
      throw err;
    }
  }, [cryptoKey, isUnlocked, storageKey]);

  // Load data when unlocked
  useEffect(() => {
    if (isUnlocked && cryptoKey) {
      loadData();
    }
  }, [isUnlocked, cryptoKey, loadData]);

  return {
    data,
    setData: saveData,
    isLoading,
    error,
    reload: loadData,
  };
}

// Specialized hooks for each data type
export function useProducts() {
  return useEncryptedStorage(STORAGE_KEYS.PRODUCTS, []);
}

export function useCategories() {
  return useEncryptedStorage(STORAGE_KEYS.CATEGORIES, []);
}

export function useBills() {
  return useEncryptedStorage(STORAGE_KEYS.BILLS, []);
}

export function useSettings() {
  return useEncryptedStorage(STORAGE_KEYS.SETTINGS, {
    shopName: 'My Shop',
    address: '',
    gstOn: false,
    gstPercent: 18,
    tokenVisible: true,
    printLayout: '80mm' as const,
  });
}

export function useTokens() {
  return useEncryptedStorage(STORAGE_KEYS.TOKENS, {
    date: new Date().toISOString().split('T')[0],
    count: 0,
  });
}
