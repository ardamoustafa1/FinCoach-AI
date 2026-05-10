import { useState, useEffect } from 'react';
import {
  Moon, Sun, Globe, Bell, Trash2, Database, RotateCcw, Save,
  Wallet, QrCode, Shield, Sparkles, ChevronRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { initMockData } from '../data/mockData';
import { getBudgetLimits, saveBudgetLimits } from '../utils/storage';
import { TUM_KATEGORILER } from '../utils/categories';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: '#050714', bg1: '#0D0F1E', bg2: '#141728', bg3: '#1C2038',
  border: 'rgba(255,255,255,0.06)', borderHover: 'rgba(124,58,237,0.4)',
  text1: '#F1F5F9', text2: '#94A3B8', text3: '#64748B',
};

function SettingRow({ icon: Icon, iconColor = P.purple, title, subtitle, action }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderRadius: 18,
        background: hov ? P.bg3 : P.bg2,
        border: `1px solid ${hov ? P.borderHover : P.border}`,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: `${iconColor}1A`, border: `1px solid ${iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={19} color={iconColor} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: P.text1, marginBottom: 2 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: P.text3 }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{action}</div>
    </div>
  );
}

function ActionButton({ onClick, label, color = P.purple, variant = 'fill', disabled }) {
  const [hov, setHov] = useState(false);
  const isFill = variant === 'fill';
  const isDanger = variant === 'danger';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '8px 18px', borderRadius: 11, fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        border: isFill ? 'none' : `1px solid ${isDanger ? 'rgba(239,68,68,0.3)' : `${color}40`}`,
        background: isFill
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : isDanger
            ? hov ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.08)'
            : hov ? `${color}25` : `${color}12`,
        color: isFill ? '#fff' : isDanger ? P.red : color,
        boxShadow: isFill && hov ? `0 8px 20px ${color}50` : 'none',
        transform: isFill && hov ? 'translateY(-1px)' : 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}

export default function SettingsPage({ theme, onToggleTheme }) {
  const [limits, setLimits] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => { setLimits(getBudgetLimits()); }, []);

  const handleLimitChange = (kat, value) => { setLimits(prev => ({ ...prev, [kat]: Number(value) })); setIsSaved(false); };

  const handleSaveLimits = () => {
    saveBudgetLimits(limits); setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLoadDemoData = () => {
    if (window.confirm('Demo verileri yeniden yüklenecek. Mevcut yerel veriler silinsin mi?')) {
      localStorage.clear(); initMockData(); window.location.reload();
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      localStorage.clear(); window.location.reload();
    }
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .limit-input { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.09) !important; border-radius: 11px !important; color: #F1F5F9 !important; font-family: inherit; }
        .limit-input:focus { border-color: rgba(124,58,237,0.55) !important; background: rgba(124,58,237,0.08) !important; outline: none !important; }
        .limit-input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── HERO ── */}
        <div style={{
          background: P.bg2, border: `1px solid ${P.border}`,
          borderRadius: 20, padding: '28px 32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 2, borderRadius: 999, background: 'linear-gradient(90deg, #7c3aed, #3b82f6, #10b981)', backgroundSize: '300% 100%', animation: 'gradientShift 4s ease infinite' }} />
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(124,58,237,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: P.text3, marginBottom: 8 }}>Demo Kontrol Merkezi</p>
          <h1 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 6 }}>Ayarlar</h1>
          <p style={{ fontSize: 14, color: P.text2 }}>Uygulama tercihlerinizi yönetin</p>
        </div>

        {/* ── GENERAL SETTINGS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Genel</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
          </div>

          <SettingRow
            icon={theme === 'dark' ? Moon : Sun}
            iconColor={theme === 'dark' ? P.purple : P.amber}
            title="Tema"
            subtitle={theme === 'dark' ? 'Koyu mod aktif' : 'Açık mod aktif'}
            action={<ActionButton onClick={onToggleTheme} label="Değiştir" color={P.purple} variant="ghost" />}
          />

          <SettingRow
            icon={Globe}
            iconColor="#06B6D4"
            title="Dil"
            subtitle="Türkçe"
            action={<span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`, fontSize: 13, color: P.text2 }}>🇹🇷 Türkçe</span>}
          />

          <SettingRow
            icon={Bell}
            iconColor={P.amber}
            title="Bildirimler"
            subtitle="Hatırlatıcılar ve uyarılar"
            action={<span style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, fontWeight: 700, color: P.green }}>Aktif</span>}
          />

          <SettingRow
            icon={Shield}
            iconColor={P.green}
            title="Gizlilik"
            subtitle="Tüm veriler yerel olarak saklanır"
            action={<span style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, fontWeight: 700, color: P.green }}>Güvenli</span>}
          />
        </div>

        {/* ── BUDGET LIMITS ── */}
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: `${P.purple}1A`, border: `1px solid ${P.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color={P.purple} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: P.text1, marginBottom: 2 }}>Aylık Kategori Limitleri</p>
                <p style={{ fontSize: 12, color: P.text3 }}>Kategorilere göre bütçe sınırlarınızı belirleyin</p>
              </div>
            </div>
            <button onClick={handleSaveLimits} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: isSaved ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #7c3aed, #6366f1)',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.25s',
              boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
            }}>
              <Save size={15} />
              {isSaved ? 'Kaydedildi ✓' : 'Kaydet'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {TUM_KATEGORILER.filter(k => k !== 'Diğer').map(kat => (
              <div key={kat}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{kat} (₺)</label>
                <input
                  type="number" min="0" step="100"
                  value={limits[kat] || ''}
                  onChange={(e) => handleLimitChange(kat, e.target.value)}
                  placeholder="Limit yok"
                  className="limit-input"
                  style={{ width: '100%', padding: '11px 14px', fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── DATA MANAGEMENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Veri Yönetimi</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
          </div>

          <SettingRow
            icon={Sparkles}
            iconColor={P.purple}
            title="Demo Verilerini Yükle"
            subtitle="120 gerçekçi işlemle uygulamayı keşfet"
            action={<ActionButton onClick={handleLoadDemoData} label="Yükle" color={P.purple} />}
          />

          <SettingRow
            icon={Database}
            iconColor={P.amber}
            title="Veri Yedeği"
            subtitle="Tüm localStorage temizlenir ve demo veri seti kurulur"
            action={<ActionButton onClick={handleLoadDemoData} label="Yenile" color={P.amber} />}
          />

          <SettingRow
            icon={RotateCcw}
            iconColor={P.red}
            title="Tüm Verileri Sıfırla"
            subtitle="Bu işlem geri alınamaz"
            action={<ActionButton onClick={handleClearData} label="Temizle" variant="danger" />}
          />
        </div>

        {/* ── QR CODE ── */}
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(124,58,237,0.06)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>
            <div style={{ padding: 16, borderRadius: 18, background: '#fff', boxShadow: '0 8px 30px rgba(124,58,237,0.25)', flexShrink: 0 }}>
              <QRCodeSVG value="https://butceai.vercel.app" size={160} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 99, padding: '4px 14px', fontSize: 11, fontWeight: 700, color: P.purpleLight, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                <QrCode size={11} /> Sunum QR
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: P.text1, letterSpacing: '-0.01em', marginBottom: 8 }}>Demo QR Kodu</h3>
              <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.7, marginBottom: 16 }}>
                Bu QR kodu hackathon sunumunuz için kullanın.<br />
                Cihazınızla okutarak uygulamaya anında erişin.
              </p>
              <p style={{ fontSize: 13, color: P.text3, wordBreak: 'break-all', background: P.bg3, padding: '10px 14px', borderRadius: 10, border: `1px solid ${P.border}`, fontFamily: 'monospace' }}>
                https://butceai.vercel.app
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
