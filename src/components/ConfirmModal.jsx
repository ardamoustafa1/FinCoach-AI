import { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Sparkles, Info, CheckCircle, LogOut, Bell } from 'lucide-react';
import { P } from '../styles/palette';

/**
 * FinCoach AI — Evrensel Onay/Bilgi Modalı
 *
 * Kullanım:
 * <ConfirmModal
 *   isOpen={bool}
 *   onConfirm={() => {}}
 *   onCancel={() => {}}
 *   variant="danger" | "warning" | "success" | "info" | "purple"
 *   icon={<LucideIcon />}          // opsiyonel, default variant'a göre belirlenir
 *   title="Başlık"
 *   description="Açıklama metni"
 *   confirmLabel="Onayla"          // default: "Onayla"
 *   cancelLabel="İptal"            // default: "İptal"
 *   hideCancelButton={false}       // sadece bilgi modalları için
 * />
 */

const VARIANT_CONFIG = {
  danger: {
    border: 'rgba(219,92,78,0.3)',
    iconBg: 'rgba(219,92,78,0.12)',
    iconBorder: 'rgba(219,92,78,0.25)',
    confirmBg: 'linear-gradient(135deg, #DB5C4E, #973B31)',
    confirmShadow: 'rgba(219,92,78,0.35)',
    Icon: Trash2,
    iconColor: '#DB5C4E',
  },
  warning: {
    border: 'rgba(210,137,79,0.3)',
    iconBg: 'rgba(210,137,79,0.12)',
    iconBorder: 'rgba(210,137,79,0.25)',
    confirmBg: 'linear-gradient(135deg, #D2894F, #AE6F3C)',
    confirmShadow: 'rgba(210,137,79,0.35)',
    Icon: AlertTriangle,
    iconColor: '#D2894F',
  },
  success: {
    border: 'rgba(52,192,138,0.3)',
    iconBg: 'rgba(52,192,138,0.12)',
    iconBorder: 'rgba(52,192,138,0.25)',
    confirmBg: 'linear-gradient(135deg, #34C08A, #1E8A62)',
    confirmShadow: 'rgba(52,192,138,0.35)',
    Icon: CheckCircle,
    iconColor: '#34C08A',
  },
  info: {
    border: 'rgba(110,147,196,0.3)',
    iconBg: 'rgba(110,147,196,0.12)',
    iconBorder: 'rgba(110,147,196,0.25)',
    confirmBg: 'linear-gradient(135deg, #6E93C4, #527CAE)',
    confirmShadow: 'rgba(110,147,196,0.35)',
    Icon: Info,
    iconColor: '#6E93C4',
  },
  purple: {
    border: 'rgba(195,203,211,0.3)',
    iconBg: 'rgba(195,203,211,0.12)',
    iconBorder: 'rgba(195,203,211,0.25)',
    confirmBg: 'linear-gradient(135deg, #C3CBD3, #7A828A)',
    confirmShadow: 'rgba(195,203,211,0.35)',
    Icon: Sparkles,
    iconColor: '#E4E9ED',
  },
  logout: {
    border: 'rgba(219,92,78,0.25)',
    iconBg: 'rgba(219,92,78,0.12)',
    iconBorder: 'rgba(219,92,78,0.25)',
    confirmBg: 'linear-gradient(135deg, #DB5C4E, #B94B3F)',
    confirmShadow: 'rgba(219,92,78,0.35)',
    Icon: LogOut,
    iconColor: '#DB5C4E',
  },
  notification: {
    border: 'rgba(210,137,79,0.25)',
    iconBg: 'rgba(210,137,79,0.12)',
    iconBorder: 'rgba(210,137,79,0.25)',
    confirmBg: 'linear-gradient(135deg, #D2894F, #AE6F3C)',
    confirmShadow: 'rgba(210,137,79,0.35)',
    Icon: Bell,
    iconColor: '#D2894F',
  },
};

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  variant = 'purple',
  icon: CustomIcon,
  title,
  description,
  confirmLabel = 'Onayla',
  cancelLabel = 'İptal',
  hideCancelButton = false,
}) {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.purple;
  const IconComp = CustomIcon || cfg.Icon;

  return (
    <>
      <style>{`
        @keyframes fc-modal-backdrop { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fc-modal-slide    { from { opacity: 0; transform: translate(-50%,-50%) scale(0.92) translateY(20px); } to { opacity: 1; transform: translate(-50%,-50%) scale(1) translateY(0); } }
        .fc-confirm-btn:hover { opacity: 0.85 !important; transform: translateY(-1px) !important; }
        .fc-cancel-btn:hover  { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          animation: 'fc-modal-backdrop 0.2s ease both',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-modal-title"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          zIndex: 10001,
          width: 'min(420px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          background: 'linear-gradient(160deg, #121417 0%, #101113 100%)',
          border: `1px solid ${cfg.border}`,
          borderRadius: 28,
          padding: '36px 32px 28px',
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset`,
          animation: 'fc-modal-slide 0.32s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Close X */}
        {!hideCancelButton && (
          <button
            onClick={onCancel}
            aria-label="Kapat"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: P.text3, transition: 'all 0.2s',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Icon */}
        <div style={{
          width: 60, height: 60, borderRadius: 18,
          background: cfg.iconBg,
          border: `1px solid ${cfg.iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: `0 8px 24px ${cfg.confirmShadow}40`,
        }}>
          <IconComp size={26} color={cfg.iconColor} />
        </div>

        {/* Title */}
        <h3
          id="fc-modal-title"
          style={{
            fontSize: 20, fontWeight: 900,
            color: '#F2F4F5',
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p style={{
            fontSize: 14, color: P.text2,
            textAlign: 'center',
            lineHeight: 1.7,
            marginBottom: 28,
          }}>
            {description}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {!hideCancelButton && (
            <button
              className="fc-cancel-btn"
              onClick={onCancel}
              style={{
                flex: 1, padding: '13px 0',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: P.text2, fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            className="fc-confirm-btn"
            onClick={onConfirm}
            style={{
              flex: 1, padding: '13px 0',
              borderRadius: 14, border: 'none',
              background: cfg.confirmBg,
              color: '#fff', fontWeight: 800, fontSize: 14,
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${cfg.confirmShadow}`,
              transition: 'all 0.2s',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
