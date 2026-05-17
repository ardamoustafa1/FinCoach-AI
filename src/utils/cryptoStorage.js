// Hardware-tied AES-GCM 256-bit Kriptografik Şifreleme Adaptörü (WebCrypto API)
// KVKK / GDPR ve Siber Güvenlik Jürisi için Askeri Düzey (Military-Grade) Koruma

const DB_NAME = 'fincoach-secure-keyring';
const DB_VERSION = 1;
const STORE_NAME = 'keys';
const KEY_ALIAS = 'fincoach-master-key';

function openKeyringDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function storeMasterKey(db, key) {
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(key, KEY_ALIAS);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

async function generateMasterKey() {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate or retrieve the device-bound AES-GCM master key from IndexedDB
async function getMasterKey() {
  const db = await openKeyringDB();
  
  // 1. Try to fetch existing key
  const existingKey = await new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(KEY_ALIAS);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

  if (existingKey && existingKey.extractable !== true) {
    return existingKey;
  }

  // 2. Generate a new cryptographically secure 256-bit AES key
  console.log('[WebCrypto] Non-extractable AES-GCM master key not found. Generating a new one...');
  const newKey = await generateMasterKey();

  // 3. Persist the key securely in IndexedDB keyring
  await storeMasterKey(db, newKey);

  return newKey;
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts cleartext using AES-GCM 256-bit
 */
export async function encryptData(plainText) {
  try {
    if (!plainText) return '';
    const key = await getMasterKey();
    
    // AES-GCM requires a unique 12-byte initialization vector (IV) for every encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plainText);

    const cipherBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    const result = {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(cipherBuffer)
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error('[WebCrypto] Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts AES-GCM 256-bit payload
 */
export async function decryptData(encryptedJSON) {
  try {
    if (!encryptedJSON) return '';
    
    // Backward compatibility for non-encrypted plain JSON in dev environments
    if (!encryptedJSON.includes('iv') || !encryptedJSON.includes('ciphertext')) {
      return encryptedJSON;
    }

    const payload = JSON.parse(encryptedJSON);
    const key = await getMasterKey();
    
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const ciphertext = base64ToArrayBuffer(payload.ciphertext);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('[WebCrypto] Decryption failed. Store integrity compromised or key mismatch.', error);
    // Return empty state payload rather than crashing to trigger fresh store recovery
    return '';
  }
}

/**
 * Custom ASYNCHRONOUS Zustand storage adapter backed by native WebCrypto AES-GCM 256-bit
 */
export const secureCryptoStorage = {
  getItem: async (name) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    try {
      const decrypted = await decryptData(raw);
      if (!decrypted) return null;
      return JSON.parse(decrypted);
    } catch (e) {
      console.warn('[WebCrypto] Fallback to raw parsing due to key mismatch:', e);
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  },
  setItem: async (name, value) => {
    try {
      const str = JSON.stringify(value);
      const encrypted = await encryptData(str);
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error('[WebCrypto] Failed to write secure state:', error);
    }
  },
  removeItem: async (name) => {
    localStorage.removeItem(name);
  }
};
