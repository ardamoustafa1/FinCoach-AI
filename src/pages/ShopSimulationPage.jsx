import { useState } from 'react';
import { ShoppingBag, ShieldAlert, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const P = {
  purple: '#7C3AED', red: '#EF4444', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)', bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', border: 'var(--border-color)'
};

export default function ShopSimulationPage() {
  const [buying, setBuying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const navigate = useNavigate();

  const handleBuy = () => {
    setBuying(true);
    setTimeout(() => {
      setBlocked(true);
      if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#fff', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflowY: 'auto' }} className={blocked ? 'shake-animation' : ''}>
      <style>{`
        @keyframes shake { 0%, 100% {transform: translateX(0);} 10%, 30%, 50%, 70%, 90% {transform: translateX(-10px);} 20%, 40%, 60%, 80% {transform: translateX(10px);} }
        .shake-animation { animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}</style>
      
      {/* Mock Apple Store Header */}
      <div style={{ borderBottom: '1px solid #d2d2d7', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>TechStore</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, fontWeight: 500, color: '#1d1d1f' }}>
          <span style={{cursor: 'pointer'}} onClick={() => navigate(-1)}>Geri Dön</span>
          <ShoppingBag size={16} />
        </div>
      </div>

      {/* Product Content */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px', display: 'flex', flexWrap: 'wrap', gap: 60 }}>
        <div style={{ flex: '1 1 400px', background: '#f5f5f7', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <img src="https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/airpods-max-select-silver-202011?wid=940&hei=1112&fmt=png-alpha&.v=1604021221000" alt="AirPods Max" style={{ width: '80%', objectFit: 'contain' }} />
        </div>
        
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>AirPods Max - Gümüş</h1>
          <p style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>24.999 ₺</p>
          
          <div style={{ background: '#f5f5f7', padding: 24, borderRadius: 18, marginBottom: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Teknik Özellikler</h3>
            <ul style={{ fontSize: 14, color: '#515154', lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
              <li>Aktif Gürültü Engelleme</li>
              <li>Şeffaf Mod</li>
              <li>Kişiselleştirilmiş Uzamsal Ses</li>
            </ul>
          </div>

          <button 
            onClick={handleBuy}
            disabled={buying || blocked}
            style={{
              background: '#0071e3', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: 999,
              fontSize: 17, fontWeight: 600, cursor: (buying || blocked) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              opacity: (buying && !blocked) ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            {buying && !blocked ? <div style={{width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /> : null}
            {!buying && !blocked ? 'Sepete Ekle' : blocked ? 'İşlem Engellendi' : 'Güvenli Ödeme Bekleniyor...'}
          </button>
        </div>
      </div>

      {/* AI Block Modal */}
      {blocked && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ width: '100%', maxWidth: 440, background: P.bg1, border: `1px solid ${P.red}`, borderRadius: 32, padding: 40, boxShadow: `0 32px 120px rgba(239, 68, 68, 0.4)`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: P.red }} />
            
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(239, 68, 68, 0.1)', border: `2px solid ${P.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulseGlow 2s infinite' }}>
              <ShieldAlert size={40} color={P.red} />
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 12 }}>BütçeAI Otonom Engellemesi</h2>
            <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, marginBottom: 24 }}>
              <strong style={{ color: P.text1 }}>24.999 ₺</strong> tutarındaki bu harcama dürtüsel olarak sınıflandırıldı. Eğer bunu alırsan, <span style={{ color: P.red, fontWeight: 700 }}>bu ayki kredi kartı asgarisini ödeyemeyecek</span> ve hedefinden 2 ay sapacaksın.
            </p>
            
            <div style={{ background: P.bg2, borderRadius: 16, padding: 20, marginBottom: 32, textAlign: 'left', border: `1px solid ${P.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: P.text3 }}>Kategori:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: P.text1 }}>Teknoloji (Limit Aşımı: %340)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: P.text3 }}>Gelecek Etkisi:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: P.red }}>-₺36.500 (Bileşik Faiziyle)</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => navigate(-1)} style={{ padding: '16px', borderRadius: 16, background: P.bg0, color: P.text1, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', border: `1px solid ${P.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = P.bg2}>
                <Shield size={18} /> Ajanı Dinle ve Geri Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
