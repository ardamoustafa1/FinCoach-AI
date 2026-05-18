import { supabase } from './supabase';

const DB_NAME = 'fincoach-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Saves a transaction action to the IndexedDB sync queue when offline.
 */
export async function saveToOfflineQueue(transaction, action = 'add') {
  const db = await openDB();
  const sessionData = await supabase.auth.getSession();
  const session = sessionData?.data?.session;
  
  if (!session?.user) {
    console.warn('[OfflineSync] User is not authenticated. Saving to local storage only.');
    return;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isLocalDemo = String(session?.access_token || '').startsWith('local-demo-token-') || !supabaseUrl || !supabaseAnonKey;

  let endpoint = isLocalDemo ? '/local-demo/transactions' : `${supabaseUrl}/rest/v1/transactions`;
  let method = 'POST';
  let payload = {};

  if (action === 'add') {
    method = 'POST';
    payload = {
      user_id: session.user.id,
      aciklama: transaction.aciklama,
      tutar: Number(transaction.tutar),
      tarih: transaction.tarih || new Date().toISOString().split('T')[0],
      kategori: transaction.kategori,
      magaza: transaction.magaza,
      tur: transaction.tur || 'gider'
    };
  } else if (action === 'update') {
    method = 'PATCH';
    endpoint = isLocalDemo ? `/local-demo/transactions/${transaction.id}` : `${supabaseUrl}/rest/v1/transactions?id=eq.${transaction.id}`;
    payload = {};
    if (transaction.aciklama !== undefined) payload.aciklama = transaction.aciklama;
    if (transaction.tutar !== undefined) payload.tutar = Number(transaction.tutar);
    if (transaction.tarih !== undefined) payload.tarih = transaction.tarih;
    if (transaction.kategori !== undefined) payload.kategori = transaction.kategori;
    if (transaction.magaza !== undefined) payload.magaza = transaction.magaza;
    if (transaction.tur !== undefined) payload.tur = transaction.tur || 'gider';
  } else if (action === 'delete') {
    method = 'DELETE';
    endpoint = isLocalDemo ? `/local-demo/transactions/${transaction.id}` : `${supabaseUrl}/rest/v1/transactions?id=eq.${transaction.id}`;
  }

  const syncItem = {
    id: transaction.id || crypto.randomUUID(),
    action,
    endpoint,
    method,
    headers: {
      'apikey': supabaseAnonKey || 'local-demo',
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    payload,
    localDemo: isLocalDemo,
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(syncItem);
    request.onsuccess = () => {
      console.log(`[OfflineSync] Action '${action}' successfully queued for transaction:`, transaction.id);
      triggerBackgroundSync();
      resolve(syncItem);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Registers background sync or triggers direct worker sync message.
 */
export async function triggerBackgroundSync() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // If Background Sync API is supported (e.g. Chrome, Firefox)
      if ('sync' in registration) {
        await registration.sync.register('sync-transactions');
        console.log('[OfflineSync] Background Sync registered successfully with tag: sync-transactions');
      } else {
        // Fallback: Send postMessage trigger to service worker immediately
        if (registration.active) {
          registration.active.postMessage({ type: 'TRIGGER_SYNC' });
          console.log('[OfflineSync] Sent TRIGGER_SYNC fallback message to Service Worker.');
        }
      }
    } catch (err) {
      console.warn('[OfflineSync] Failed to trigger background sync:', err);
    }
  }
}

/**
 * Checks queue length.
 */
export async function getOfflineQueueLength() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
