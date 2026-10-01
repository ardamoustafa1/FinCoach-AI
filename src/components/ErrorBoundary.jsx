import { Component } from 'react';
import { trackEvent } from '../utils/analytics';

const colors = {
  bg: '#0A0B0C',
  panel: '#111427',
  border: 'rgba(255,255,255,0.08)',
  text: '#F7F9FA',
  muted: '#9BA1A6',
  primary: '#C3CBD3',
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uygulama hata sınırı:', error, info);
    trackEvent('frontend_error', {
      message: error?.message || 'unknown',
      componentStack: info?.componentStack?.slice(0, 800),
    });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        color: colors.text,
      }}>
        <section style={{
          width: 'min(100%, 460px)',
          background: colors.panel,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        }}>
          <p style={{ margin: '0 0 8px', color: '#F1F4F6', fontSize: 12, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            FinCoach AI
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 28, lineHeight: 1.15, fontWeight: 900 }}>
            Ekran güvenli moda alındı.
          </h1>
          <p style={{ margin: '0 0 22px', color: colors.muted, fontSize: 15, lineHeight: 1.6 }}>
            Beklenmeyen bir arayüz hatası yakalandı. Oturumun korunur; sayfayı yenileyerek kaldığın yerden devam edebilirsin.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              border: 0,
              borderRadius: 12,
              background: colors.primary,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 900,
              padding: '13px 16px',
            }}
          >
            Sayfayı Yenile
          </button>
        </section>
      </div>
    );
  }
}
