import { useCallback, useEffect, useState } from 'react';
import {
  Moon, Sun, Globe, Bell, Database, RotateCcw, Save,
  Wallet, QrCode, Shield, Sparkles, Flame, LogOut,
  User, Mail, Phone, Lock, Eye, EyeOff, Check, X, Edit3, BadgeCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { initMockData } from '../data/mockData';
import useStore from '../store/useStore';
import { TUM_KATEGORILER } from '../utils/categories';
import { supabase } from '../utils/supabase';
import { authFetch } from '../utils/api';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
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
  const [limits, setLimits] = useState(() => useStore.getState().budgetLimits);
  const [isSaved, setIsSaved] = useState(false);
  const [roastMode, setRoastMode] = useState(() => localStorage.getItem('fincoach_roast_mode') === 'true');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [whatsappError, setWhatsappError] = useState('');

  // Profile state
  const getAuthUser = () => { try { return JSON.parse(localStorage.getItem('fincoach_auth_user') || '{}'); } catch { return {}; } };
  const [profile, setProfile] = useState(() => ({
    name: localStorage.getItem('fincoach_user_name') || getAuthUser().name || '',
    email: getAuthUser().email || '',
    phone: localStorage.getItem('fincoach_phone') || '',
  }));
  const [editField, setEditField] = useState(null); // 'name' | 'email' | 'phone'
  const [editValue, setEditValue] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [showPassSection, setShowPassSection] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  // Email verification
  const [emailVerified, setEmailVerified] = useState(() => localStorage.getItem('fincoach_email_verified') === 'true');
  const [verificationSent, setVerificationSent] = useState(false);

  const loadWhatsAppStatus = useCallback(async () => {
    try {
      setWhatsappError('');
      const response = await authFetch('/api/whatsapp/status');
      if (!response.ok) throw new Error('WhatsApp durumu alınamadı.');
      setWhatsappStatus(await response.json());
    } catch (err) {
      setWhatsappError(err.message || 'WhatsApp durumu alınamadı.');
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(loadWhatsAppStatus, 0);
    const interval = setInterval(loadWhatsAppStatus, 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [loadWhatsAppStatus]);

  const startEdit = (field) => { setEditField(field); setEditValue(profile[field]); };
  const cancelEdit = () => { setEditField(null); setEditValue(''); };
  const saveField = async (field) => {
    const value = editValue.trim();
    if (!value) return;

    setProfileError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (field === 'email') {
          const { error: authError } = await supabase.auth.updateUser({ email: value });
          if (authError) throw authError;
        }

        const payload = {};
        if (field === 'name') payload.full_name = value;
        if (field === 'phone') payload.phone_text = value;
        if (field === 'email') payload.email = value;
        if (Object.keys(payload).length) {
          const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
          if (error) throw error;
        }
      }
    } catch (err) {
      console.error('[Settings] Profil Supabase güncellemesi başarısız:', err);
      setProfileError(err.message || 'Profil güncellenemedi. Lütfen tekrar deneyin.');
      return;
    }

    const updated = { ...profile, [field]: value };
    setProfile(updated);
    if (field === 'name') { localStorage.setItem('fincoach_user_name', value); }
    if (field === 'phone') { localStorage.setItem('fincoach_phone', value); }
    if (field === 'email') {
      const auth = getAuthUser();
      localStorage.setItem('fincoach_auth_user', JSON.stringify({ ...auth, email: value }));
      setEmailVerified(false); localStorage.removeItem('fincoach_email_verified');
    }

    setEditField(null); setEditValue('');
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordChange = async () => {
    setPassError('');
    const auth = getAuthUser();
    if (!auth.email) { setPassError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.'); return; }
    if (!currentPass) { setPassError('Mevcut şifrenizi girin.'); return; }
    if (newPass.length < 6) { setPassError('Yeni şifre en az 6 karakter olmalı.'); return; }
    if (newPass !== confirmPass) { setPassError('Yeni şifreler eşleşmiyor.'); return; }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: auth.email,
      password: currentPass,
    });
    if (signInError) {
      setPassError('Mevcut şifre yanlış veya oturum doğrulanamadı.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
    if (updateError) {
      setPassError(updateError.message || 'Şifre güncellenemedi.');
      return;
    }

    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPassSaved(true); setPassError('');
    setTimeout(() => { setPassSaved(false); setShowPassSection(false); }, 2500);
  };

  const sendVerification = async () => {
    setVerificationSent(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: profile.email });
    if (error) {
      setProfileError(error.message || 'Doğrulama e-postası gönderilemedi.');
      setVerificationSent(false);
      return;
    }
    setTimeout(() => setVerificationSent(false), 3000);
  };

  const toggleRoastMode = () => {
    const newVal = !roastMode;
    setRoastMode(newVal);
    localStorage.setItem('fincoach_roast_mode', newVal);
  };

  const handleLimitChange = (kat, value) => { setLimits(prev => ({ ...prev, [kat]: Number(value) })); setIsSaved(false); };

  const handleSaveLimits = () => {
    useStore.getState().saveBudgetLimits(limits); setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearLocalAppData = () => {
    const keepKeys = ['fincoach_auth_user', 'fincoach_user_name', 'fincoach_phone', 'fincoach_roast_mode', 'fincoach_email_verified'];
    const preserved = Object.fromEntries(
      keepKeys
        .map(key => [key, localStorage.getItem(key)])
        .filter(([, value]) => value !== null)
    );

    Object.keys(localStorage)
      .filter(key => key.startsWith('fincoach_'))
      .forEach(key => localStorage.removeItem(key));

    Object.entries(preserved).forEach(([key, value]) => localStorage.setItem(key, value));
  };

  const executeDataAction = () => {
    if (confirmAction === 'demo') {
      clearLocalAppData();
      initMockData();
      window.location.reload();
    }
    if (confirmAction === 'clear') {
      clearLocalAppData();
      window.location.reload();
    }
  };

  const handleLoadDemoData = () => setConfirmAction('demo');

  const handleClearData = () => setConfirmAction('clear');

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('fincoach_onboarding_completed');
    localStorage.removeItem('fincoach_auth_user');
    window.location.replace('/');
  };

  return (
    <>
      {confirmAction && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,7,20,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#141728',
            border: `1px solid ${confirmAction === 'clear' ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.28)'}`,
            borderRadius: 24, padding: '34px 32px', maxWidth: 420, width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            animation: 'fadeSlideUp 0.2s ease',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: confirmAction === 'clear' ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.14)',
              border: `1px solid ${confirmAction === 'clear' ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              {confirmAction === 'clear' ? <Database size={24} color={P.red} /> : <Sparkles size={24} color={P.purpleLight} />}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', textAlign: 'center', marginBottom: 10 }}>
              {confirmAction === 'clear' ? 'Yerel Veriler Temizlensin mi?' : 'Demo Verileri Yüklensin mi?'}
            </h3>
            <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
              {confirmAction === 'clear'
                ? 'Bu işlem cihazdaki FinCoach AI işlem, hedef ve tercih verilerini temizler. Supabase oturumunuz korunur.'
                : 'Mevcut yerel işlem ve hedef verileri demo veri setiyle değiştirilecek. Supabase oturumunuz korunur.'}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmAction(null)}
                style={{ flex: 1, padding: '13px 0', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontWeight: 700, cursor: 'pointer' }}
              >
                Vazgeç
              </button>
              <button
                onClick={executeDataAction}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: 14, border: 'none',
                  background: confirmAction === 'clear' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff', fontWeight: 800, cursor: 'pointer'
                }}
              >
                {confirmAction === 'clear' ? 'Temizle' : 'Yükle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,7,20,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#141728', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 24, padding: '36px 32px', maxWidth: 400, width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            animation: 'fadeSlideUp 0.2s ease',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <LogOut size={24} color='#EF4444' />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', textAlign: 'center', marginBottom: 10 }}>Çıkış Yapmak İstiyor Musunuz?</h3>
            <p style={{ fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
              Oturumunuz sonlandırılacak ve tekrar giriş ekranına yönlendirileceksiniz.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >İptal</button>
              <button
                onClick={confirmLogout}
                style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg, #EF4444, #DC2626)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(239,68,68,0.35)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Çıkış Yap</button>
            </div>
          </div>
        </div>
      )}

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

        {/* ── PERSONAL INFORMATION ── */}
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '22px 28px 18px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${P.purple}1A`, border: `1px solid ${P.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color={P.purple} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: P.text1, marginBottom: 1 }}>Kişisel Bilgiler</p>
                <p style={{ fontSize: 12, color: P.text3 }}>Hesap bilgilerinizi yönetin</p>
              </div>
            </div>
            {profileSaved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12, fontWeight: 700, color: P.green }}>
                <Check size={13} /> Kaydedildi
              </span>
            )}
          </div>

          {profileError && (
            <div style={{ padding: '12px 28px', borderBottom: `1px solid ${P.border}`, background: 'rgba(239,68,68,0.08)', color: P.red, fontSize: 12, fontWeight: 700 }}>
              {profileError}
            </div>
          )}

          {/* Avatar + name row */}
          <div style={{ padding: '24px 28px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 3px rgba(124,58,237,0.2)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 2 }}>{profile.name || 'Ad girilmedi'}</p>
              <p style={{ fontSize: 13, color: P.text3 }}>{profile.email || 'E-posta girilmedi'}</p>
            </div>
          </div>

          {/* Fields */}
          {[
            { key: 'name', label: 'Ad Soyad', icon: User, value: profile.name, placeholder: 'Örn: Arda Yılmaz' },
            { key: 'email', label: 'E-posta Adresi', icon: Mail, value: profile.email, placeholder: 'Örn: arda@email.com' },
            { key: 'phone', label: 'Telefon Numarası', icon: Phone, value: profile.phone, placeholder: 'Örn: +90 555 000 00 00' },
          ].map(({ key, label, icon: Icon, value, placeholder }) => (
            <div key={key} style={{ padding: '18px 28px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={P.text3} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
                {editField === key ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveField(key); if (e.key === 'Escape') cancelEdit(); }}
                      placeholder={placeholder}
                      style={{ flex: 1, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 10, padding: '8px 12px', color: P.text1, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                    />
                    <button onClick={() => saveField(key)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color={P.green} /></button>
                    <button onClick={cancelEdit} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} color={P.red} /></button>
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: value ? P.text1 : P.text3, fontStyle: value ? 'normal' : 'italic' }}>
                    {value || `${label} girilmedi`}
                    {key === 'email' && (
                      <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 99, background: emailVerified ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${emailVerified ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, fontSize: 11, fontWeight: 700, color: emailVerified ? P.green : P.amber, verticalAlign: 'middle' }}>
                        {emailVerified ? <><BadgeCheck size={11} /> Doğrulandı</> : '⚠ Doğrulanmadı'}
                      </span>
                    )}
                  </p>
                )}
              </div>
              {editField !== key && (
                <button onClick={() => startEdit(key)} style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: P.purpleLight, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
                ><Edit3 size={12} /> Düzenle</button>
              )}
            </div>
          ))}

          {/* Email verification */}
          {!emailVerified && profile.email && (
            <div style={{ padding: '16px 28px', borderBottom: `1px solid ${P.border}`, background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>📧</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: P.amber, marginBottom: 2 }}>E-posta adresi doğrulanmadı</p>
                    <p style={{ fontSize: 12, color: P.text3 }}>Güvenliğiniz için e-posta adresinizi doğrulayın</p>
                  </div>
                </div>
                <button
                  onClick={sendVerification}
                  disabled={verificationSent}
                  style={{ padding: '8px 18px', borderRadius: 10, background: verificationSent ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: P.amber, fontSize: 13, fontWeight: 700, cursor: verificationSent ? 'default' : 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                >
                  {verificationSent ? '✓ Gönderildi...' : 'Doğrulama Gönder'}
                </button>
              </div>
            </div>
          )}

          {/* Password change */}
          <div style={{ padding: '18px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setShowPassSection(v => !v)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={15} color={P.text3} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: P.text1 }}>Şifre Değiştir</p>
                  <p style={{ fontSize: 12, color: P.text3 }}>Hesap güvenliğinizi güncelleyin</p>
                </div>
              </div>
              <span style={{ fontSize: 18, color: P.text3, transition: 'transform 0.2s', display: 'inline-block', transform: showPassSection ? 'rotate(180deg)' : 'none' }}>⌄</span>
            </div>

            {showPassSection && (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ label: 'Mevcut Şifre', val: currentPass, set: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { label: 'Yeni Şifre', val: newPass, set: setNewPass, show: showNew, toggle: () => setShowNew(v => !v) },
                  { label: 'Yeni Şifre (Tekrar)', val: confirmPass, set: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(v => !v) }
                ].map(({ label, val, set, show, toggle }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.border}`, borderRadius: 12, padding: '12px 16px' }}>
                    <input
                      type={show ? 'text' : 'password'}
                      placeholder={label}
                      value={val}
                      onChange={e => set(e.target.value)}
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: P.text1, fontSize: 14, fontFamily: 'inherit' }}
                    />
                    <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.text3, padding: 0, display: 'flex' }}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                ))}
                {passError && <p style={{ fontSize: 12, color: P.red, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>⚠️ {passError}</p>}
                {passSaved && <p style={{ fontSize: 12, color: P.green, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>✓ Şifre başarıyla güncellendi!</p>}
                <button
                  onClick={handlePasswordChange}
                  style={{ padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(124,58,237,0.3)', transition: 'opacity 0.2s', marginTop: 4 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >Şifre Güncelle</button>
              </div>
            )}
          </div>
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
            icon={Flame}
            iconColor={P.red}
            title="Acımasız Koç Modu 🔥"
            subtitle={roastMode ? 'Açık (Sert eleştiri alıyorsunuz)' : 'Kapalı (Standart kibar AI)'}
            action={
              <ActionButton 
                onClick={toggleRoastMode} 
                label={roastMode ? 'Kapat' : 'Aç'} 
                color={roastMode ? P.text3 : P.red} 
                variant={roastMode ? 'ghost' : 'fill'} 
              />
            }
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

        {/* ── WHATSAPP OPERATIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>WhatsApp Operasyon Paneli</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.3), transparent)' }} />
          </div>

          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 18, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: whatsappStatus?.ready ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)',
                  border: `1px solid ${whatsappStatus?.ready ? 'rgba(16,185,129,0.28)' : 'rgba(245,158,11,0.28)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Phone size={20} color={whatsappStatus?.ready ? P.green : P.amber} />
                </div>
                <div>
                  <p style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 900, color: P.text1 }}>
                    {whatsappStatus?.ready ? 'WhatsApp bot canlı' : whatsappStatus?.enabled === false ? 'WhatsApp devre dışı' : 'WhatsApp bağlantısı bekleniyor'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: P.text3, lineHeight: 1.5 }}>
                    Durum: {whatsappStatus?.state || 'bilinmiyor'} · Kayıt modu: {whatsappStatus?.defaultUserMode ? 'tek kullanıcı' : 'telefon eşleşmesi'}
                  </p>
                </div>
              </div>
              <ActionButton onClick={loadWhatsAppStatus} label="Yenile" color={P.green} variant="soft" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
              {[
                ['Son mesaj', whatsappStatus?.lastMessageAt ? new Date(whatsappStatus.lastMessageAt).toLocaleString('tr-TR') : 'Henüz yok'],
                ['Son kayıt', whatsappStatus?.lastSavedAt ? new Date(whatsappStatus.lastSavedAt).toLocaleString('tr-TR') : 'Henüz yok'],
                ['Supabase kayıt', whatsappStatus?.hasSupabaseStore ? 'Aktif' : 'Eksik'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 14, padding: 14 }}>
                  <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.text3 }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: P.text1 }}>{value}</p>
                </div>
              ))}
            </div>

            {(whatsappError || whatsappStatus?.lastError) && (
              <p style={{ margin: '14px 0 0', fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
                {whatsappError || whatsappStatus.lastError}
              </p>
            )}
          </div>
        </div>

        {/* ── ACCOUNT MANAGEMENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.text3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Hesap Yönetimi</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }} />
          </div>

          <SettingRow
            icon={LogOut}
            iconColor={P.red}
            title="Çıkış Yap"
            subtitle="Mevcut oturumunuzu sonlandırır"
            action={<ActionButton onClick={handleLogout} label="Çıkış Yap" variant="danger" />}
          />
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
              <QRCodeSVG value="https://fincoach.vercel.app" size={160} />
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
                https://fincoach.vercel.app
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
