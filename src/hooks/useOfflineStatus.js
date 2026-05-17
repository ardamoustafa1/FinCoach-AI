/**
 * useOfflineStatus — Tarayıcının çevrimiçi/çevrimdışı durumunu gerçek zamanlı izleyen hook.
 *
 * navigator.onLine ile başlar, ardından 'online' ve 'offline'
 * event listener'larıyla değişiklikleri yakalar.
 *
 * @returns {{ isOffline: boolean, wasOffline: boolean }} Çevrimdışı durum ve önceki durum
 */
import { useState, useEffect } from 'react';

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  // Bağlantı geri geldiğinde kısa süre "tekrar çevrimiçi" mesajı göstermek için
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    let reconnectTimer;

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);
      // 3 saniye sonra "tekrar çevrimiçi" bildirimini kapat
      reconnectTimer = setTimeout(() => setWasOffline(false), 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      clearTimeout(reconnectTimer);
    };
  }, []);

  return { isOffline, wasOffline };
}
