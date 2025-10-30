import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  initializeEncryption,
  unlockWithPassword,
  verifyPassword,
  base64ToBuf,
} from '@/utils/crypto';
import {
  hasEncryptionKey,
  getEncryptionVerifier,
  storeEncryptionVerifier,
  markActivated,
  isActivated,
} from '@/utils/storage';

interface AuthContextType {
  isUnlocked: boolean;
  cryptoKey: CryptoKey | null;
  unlock: (password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const autoUnlock = async () => {
      try {
        const MASTER_PASSWORD = '0905';
        
        if (!hasEncryptionKey()) {
          const { keyHash, salt, iterations, key } = await initializeEncryption(MASTER_PASSWORD);
          storeEncryptionVerifier(keyHash, salt, iterations);
          markActivated();
          setCryptoKey(key);
        } else {
          const verifier = getEncryptionVerifier();
          if (verifier) {
            const key = await unlockWithPassword(
              MASTER_PASSWORD,
              verifier.salt,
              verifier.iterations
            );
            setCryptoKey(key);
          }
        }
      } catch (error) {
        console.error('Auto-unlock error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    autoUnlock();
  }, []);

  const unlock = async (password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // IMPORTANT: Only accept the fixed master password "0905"
      const MASTER_PASSWORD = '0905';
      
      if (password !== MASTER_PASSWORD) {
        return false;
      }

      // Check if this is first-time setup or returning user
      if (!hasEncryptionKey()) {
        // First time unlock - initialize encryption with the master password
        const { keyHash, salt, iterations, key } = await initializeEncryption(MASTER_PASSWORD);
        
        // Store verifier
        storeEncryptionVerifier(keyHash, salt, iterations);
        markActivated();

        // Store key in memory
        setCryptoKey(key);
        setIsUnlocked(true);
        return true;
      } else {
        // Returning user - verify password
        const verifier = getEncryptionVerifier();
        if (!verifier) {
          return false;
        }

        const isValid = await verifyPassword(
          password,
          verifier.keyHash,
          base64ToBuf(verifier.salt),
          verifier.iterations
        );

        if (isValid) {
          // Re-derive key
          const key = await unlockWithPassword(
            password,
            verifier.salt,
            verifier.iterations
          );

          setCryptoKey(key);
          setIsUnlocked(true);
          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Unlock error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, cryptoKey, unlock, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
