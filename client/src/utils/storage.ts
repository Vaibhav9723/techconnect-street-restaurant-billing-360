export const STORAGE_KEYS = {
  // Encryption/auth keys
  SALT: 'pos_salt',
  KDF_ITER: 'pos_kdf_iter',
  KEY_HASH: 'pos_key_hash',
  ACTIVATED: 'pos_activated',
  
  // Encrypted data keys
  PRODUCTS: 'pos_products',
  CATEGORIES: 'pos_categories',
  BILLS: 'pos_bills',
  SETTINGS: 'pos_settings',
  TOKENS: 'pos_tokens',
} as const;

// Check if app is activated (has been unlocked at least once)
export function isActivated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ACTIVATED) === '1';
}

// Mark app as activated
export function markActivated(): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVATED, '1');
}

// Check if encryption is initialized (key hash exists)
export function hasEncryptionKey(): boolean {
  return localStorage.getItem(STORAGE_KEYS.KEY_HASH) !== null;
}

// Store encryption verifier
export function storeEncryptionVerifier(
  keyHash: string,
  salt: string,
  iterations: number
): void {
  localStorage.setItem(STORAGE_KEYS.KEY_HASH, keyHash);
  localStorage.setItem(STORAGE_KEYS.SALT, salt);
  localStorage.setItem(STORAGE_KEYS.KDF_ITER, iterations.toString());
}

// Get encryption verifier data
export function getEncryptionVerifier(): {
  keyHash: string;
  salt: string;
  iterations: number;
} | null {
  const keyHash = localStorage.getItem(STORAGE_KEYS.KEY_HASH);
  const salt = localStorage.getItem(STORAGE_KEYS.SALT);
  const iterStr = localStorage.getItem(STORAGE_KEYS.KDF_ITER);

  if (!keyHash || !salt || !iterStr) {
    return null;
  }

  return {
    keyHash,
    salt,
    iterations: parseInt(iterStr, 10),
  };
}

// Wipe all data (factory reset)
export function wipeAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
