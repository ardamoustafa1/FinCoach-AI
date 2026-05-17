/**
 * OfflineBanner — Çevrimdışı durumu ve yeniden bağlantıyı bildiren şık, animasyonlu banner.
 *
 * Kullanım: <OfflineBanner /> (useOfflineStatus hook'unu dahili kullanır)
 *
 * Davranış:
 *  - Çevrimdışı: Kırmızı "İnternet bağlantısı yok" banner'ı (yukarıdan kayar)
 *  - Tekrar çevrimiçi: 3 saniyelik yeşil "Bağlantı yeniden sağlandı" bildirimi
 *  - Çevrimiçi: Hiçbir şey render edilmez (DOM'da yer kaplamaz)
 */
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const { isOffline, wasOffline } = useOfflineStatus();

  if (!isOffline && !wasOffline) return null;

  const isReconnected = !isOffline && wasOffline;

  return (
    <>
      <style>{`
        @keyframes slideDownBanner {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideUpBanner {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
        .offline-banner {
          animation: slideDownBanner 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .reconnect-banner {
          animation: slideDownBanner 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     slideUpBanner 0.35s cubic-bezier(0.4, 0, 0.2, 1) 2.6s forwards;
        }
      `}</style>

      <div
        className={isReconnected ? 'reconnect-banner' : 'offline-banner'}
        role="alert"
        aria-live="assertive"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '12px 24px',
          background: isReconnected
            ? 'linear-gradient(135deg, #065f46, #10B981)'
            : 'linear-gradient(135deg, #7f1d1d, #EF4444)',
          borderBottom: `1px solid ${isReconnected ? '#34d399' : '#fca5a5'}`,
          boxShadow: isReconnected
            ? '0 4px 24px rgba(16,185,129,0.3)'
            : '0 4px 24px rgba(239,68,68,0.3)',
          /* Dokunma kolaylığı: minimum 48px yükseklik (WCAG touch target) */
          minHeight: 48,
        }}
      >
        {isReconnected ? (
          <Wifi size={16} color="#fff" />
        ) : (
          <WifiOff size={16} color="#fff" />
        )}

        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.02em',
        }}>
          {isReconnected
            ? 'İnternet bağlantısı yeniden sağlandı ✓'
            : 'İnternet bağlantısı yok — Çevrimdışı moddasınız'}
        </span>

        {!isReconnected && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.75)',
            background: 'rgba(255,255,255,0.15)',
            padding: '3px 10px',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            Veriler yerel olarak saklanıyor
          </span>
        )}
      </div>

      {/* Banner yüksekliği kadar içeriği aşağı it */}
      {isOffline && <div style={{ height: 48 }} aria-hidden="true" />}
    </>
  );
}
