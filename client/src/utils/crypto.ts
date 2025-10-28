/**
 * Web Crypto API utilities for PBKDF2 + AES-GCM encryption
 * 
 * IMPORTANT: Uses a FIXED DETERMINISTIC SALT so that master password "0905"
 * works across any device. This enables cross-device unlock as specified.
 */

// Fixed deterministic salt (base64 encoded) - shared across all devices
const FIXED_SALT_BASE64 = "UE9TQXBwU2FsdDIwMjU="; // "POSAppSalt2025" in base64

// KDF parameters
const KDF_ITERATIONS = 150000;
const ALGORITHM = "PBKDF2";
const HASH = "SHA-256";
const ENCRYPTION_ALGORITHM = "AES-GCM";

// Convert buffer to base64
export function bufToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to buffer
export function base64ToBuf(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Get the fixed salt as ArrayBuffer
export function getFixedSalt(): ArrayBuffer {
  return base64ToBuf(FIXED_SALT_BASE64);
}

// Derive encryption key from password using PBKDF2
export async function deriveKeyFromPassword(
  password: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: ALGORITHM },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive AES-GCM key
  const key = await crypto.subtle.deriveKey(
    {
      name: ALGORITHM,
      salt: salt,
      iterations: iterations,
      hash: HASH,
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    true, // extractable (needed for verification)
    ["encrypt", "decrypt"]
  );

  return key;
}

// Export CryptoKey to base64 (for verification/storage)
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return bufToBase64(exported);
}

// Encrypt JSON object
export async function encryptJSON(
  key: CryptoKey,
  obj: any
): Promise<{ ct: string; iv: string; ts: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(obj));

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    data
  );

  return {
    ct: bufToBase64(ciphertext),
    iv: bufToBase64(iv.buffer),
    ts: new Date().toISOString(),
  };
}

// Decrypt JSON object
export async function decryptJSON(
  key: CryptoKey,
  blob: { ct: string; iv: string; ts?: string }
): Promise<any> {
  const ciphertext = base64ToBuf(blob.ct);
  const iv = base64ToBuf(blob.iv);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    ciphertext
  );

  // Decode
  const decoder = new TextDecoder();
  const jsonString = decoder.decode(decrypted);
  return JSON.parse(jsonString);
}

// Verify password by comparing derived key hashes
export async function verifyPassword(
  password: string,
  storedKeyHash: string,
  salt: ArrayBuffer,
  iterations: number
): Promise<boolean> {
  try {
    const key = await deriveKeyFromPassword(password, salt, iterations);
    const keyHash = await exportKeyToBase64(key);
    return keyHash === storedKeyHash;
  } catch {
    return false;
  }
}

// Initialize encryption on first unlock (store verifier)
export async function initializeEncryption(password: string): Promise<{
  keyHash: string;
  salt: string;
  iterations: number;
  key: CryptoKey;
}> {
  const salt = getFixedSalt();
  const iterations = KDF_ITERATIONS;

  const key = await deriveKeyFromPassword(password, salt, iterations);
  const keyHash = await exportKeyToBase64(key);

  return {
    keyHash,
    salt: bufToBase64(salt),
    iterations,
    key,
  };
}

// Re-derive key from password (for returning users)
export async function unlockWithPassword(
  password: string,
  storedSalt: string,
  storedIterations: number
): Promise<CryptoKey> {
  const salt = base64ToBuf(storedSalt);
  return deriveKeyFromPassword(password, salt, storedIterations);
}

// Get KDF iterations constant
export function getKDFIterations(): number {
  return KDF_ITERATIONS;
}
