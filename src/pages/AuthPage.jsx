/**
 * FinCoach AI — Kimlik Doğrulama  ·  "Obsidian & Champagne"
 * Sıfırdan tasarlanmış split-screen deneyim. Tüm giriş/kayıt/demo
 * mantığı birebir korunmuştur.
 */
import { useEffect, useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Phone, Wallet,
  Shield, ShieldCheck, ShieldAlert, Check,
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/demoAccount';
import { Aurora, GridLines, Reveal, SplitWords } from '../components/motion';
import { P } from '../styles/palette';

const USER_SCOPED_KEYS = [
  'fincoach_transactions',
  'fincoach_goals',
  'fincoach_budget_limits',
  'fincoach_gelir',
  'fincoach_category_rules',
  'fincoach_mock_initialized',
  'fincoach_profile',
  'fincoach_income',
  'fincoach_bank',
  'fincoach_emotion_logs',
  'fincoach_demo_session',
];

function clearUserScopedCache() {
  USER_SCOPED_KEYS.forEach((key) => localStorage.removeItem(key));
}

/* ─── Şifre Güç Ölçer ─── */
function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  const checks = [
    { label: 'En az 6 karakter', pass: password.length >= 6 },
    { label: 'Büyük harf', pass: /[A-Z]/.test(password) },
    { label: 'Küçük harf', pass: /[a-z]/.test(password) },
    { label: 'Rakam', pass: /[0-9]/.test(password) },
    { label: 'Özel karakter', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  checks.forEach(c => { if (c.pass) score++; });

  const levels = [
    { label: 'Çok Zayıf', color: '#DB5C4E', icon: ShieldAlert },
    { label: 'Zayıf', color: '#C0705C', icon: ShieldAlert },
    { label: 'Orta', color: '#D2894F', icon: Shield },
    { label: 'Güçlü', color: '#34C08A', icon: ShieldCheck },
    { label: 'Çok Güçlü', color: '#C3CBD3', icon: ShieldCheck },
  ];
  const level = levels[Math.max(0, score - 1)];
  const Icon = level.icon;

  return (
    <div style={{ marginTop: 2, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 9 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? level.color : 'var(--hairline)',
            transition: 'background .45s var(--ease-out-expo)',
            boxShadow: i <= score ? `0 0 10px ${level.color}55` : 'none',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} color={level.color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: level.color }}>{level.label}</span>
        </span>
        <span className="num" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{score}/5</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 14px', marginTop: 10 }}>
        {checks.map(c => (
          <span key={c.label} style={{
            fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 5,
            color: c.pass ? P.green : 'var(--text-muted)',
            transition: 'color .35s ease',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: c.pass ? P.green : 'var(--hairline)',
              transition: 'background .35s ease',
            }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Telefon Formatlayıcı ─── */
const formatPhone = (val) => {
  const digits = val.replace(/\D/g, '');
  let res = '';
  if (digits.length === 0) return '';

  let pure = digits;
  if (pure.startsWith('0')) pure = pure.substring(1);
  pure = pure.substring(0, 10);

  if (pure.length > 0) {
    res = '0 (';
    res += pure.substring(0, 3);
    if (pure.length > 3) res += ') ' + pure.substring(3, 6);
    if (pure.length > 6) res += ' ' + pure.substring(6, 8);
    if (pure.length > 8) res += ' ' + pure.substring(8, 10);
  }
  return res;
};

/* ─── Input ─── */
function AuthInput({ icon: Icon, type = 'text', placeholder, value, onChange, right, maxLength, autoComplete }) {
  const [focus, setFocus] = useState(false);
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: focus ? 'rgba(195,203,211,0.06)' : 'var(--bg-surface)',
        border: `1px solid ${focus ? 'rgba(195,203,211,0.5)' : 'var(--border-color)'}`,
        borderRadius: 13, padding: '14px 16px', marginBottom: 11,
        transition: 'border-color .35s ease, background .35s ease, box-shadow .35s ease',
        boxShadow: focus ? '0 0 0 4px rgba(195,203,211,0.08)' : 'none',
      }}
    >
      {Icon && <Icon size={16} color={focus ? P.gold : 'var(--text-muted)'} style={{ flexShrink: 0, transition: 'color .3s' }} />}
      <input
        aria-label={placeholder}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--text-primary)', fontSize: 14.5, fontFamily: 'inherit', minWidth: 0,
        }}
      />
      {right}
    </label>
  );
}

/* ─── Sol marka paneli ─── */
const HIGHLIGHTS = [
  ['26 modül', 'Dashboard\'dan federated learning\'e kadar tek abonelikte.'],
  ['Uçtan uca şifreleme', 'Hassas alanlar tarayıcınızda AES-GCM ile şifrelenir.'],
  ['Türkçe AI koç', 'Kendi verinizi okuyup rakamla cevap veren asistan.'],
];

function BrandPanel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HIGHLIGHTS.length), 4200);
    return () => clearInterval(t);
  }, []);

  return (
    <aside
      className="auth-brand"
      style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', borderRight: '1px solid var(--border-color)',
        background: 'linear-gradient(165deg, rgba(195,203,211,0.07), transparent 58%)',
      }}
    >
      <Aurora color="rgba(195,203,211,0.30)" size={480} top="-14%" left="-16%" duration={22} />
      <Aurora color="rgba(52,192,138,0.14)" size={400} bottom="-12%" right="-14%" duration={26} delay={3} />
      <GridLines opacity={0.05} size={72} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: P.gradBrand,
          display: 'grid', placeItems: 'center', boxShadow: '0 8px 22px rgba(139,148,157,0.32)',
        }}>
          <Wallet size={17} color="#0C0E10" strokeWidth={2.4} />
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>
          FinCoach<span style={{ color: P.green }}> AI</span>
        </span>
      </div>

      <div style={{ position: 'relative', maxWidth: 460 }}>
        <h2 className="display" style={{ fontSize: 'clamp(34px, 3.6vw, 56px)', color: 'var(--text-primary)', marginBottom: 26 }}>
          <SplitWords text="Paranızın sessiz mimarı." step={70} highlight={[2]} />
        </h2>

        <div style={{ position: 'relative', minHeight: 92 }}>
          {HIGHLIGHTS.map(([title, body], idx) => (
            <div
              key={title}
              style={{
                position: idx === 0 ? 'relative' : 'absolute', inset: idx === 0 ? undefined : 0,
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? 'none' : 'translateY(14px)',
                filter: i === idx ? 'none' : 'blur(5px)',
                transition: 'all .7s var(--ease-out-expo)',
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: P.gold, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{body}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 26 }}>
          {HIGHLIGHTS.map((h, idx) => (
            <span key={h[0]} style={{
              width: i === idx ? 26 : 8, height: 3, borderRadius: 99,
              background: i === idx ? P.gold : 'var(--hairline)',
              transition: 'all .6s var(--ease-out-expo)',
            }} />
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', gap: 26, flexWrap: 'wrap' }}>
        {[['12.400+', 'kullanıcı'], ['₺61M', 'takip edilen varlık'], ['%99,9', 'uptime']].map(([v, l]) => (
          <div key={l}>
            <p className="num" style={{ fontSize: 17, color: 'var(--text-primary)', marginBottom: 2 }}>{v}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ═══════════════════ Sayfa ═══════════════════ */

export default function AuthPage({ onAuth, initialMode = 'login', onBack }) {
  const [mode, setMode] = useState(initialMode === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const triggerShake = () => { setShake(false); setTimeout(() => setShake(true), 10); setTimeout(() => setShake(false), 400); };

  const eyeBtn = (show, toggle) => (
    <button
      type="button"
      aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
      onClick={toggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  const handleLogin = async (credentials = {}) => {
    const loginEmail = credentials.email ?? email;
    const loginPassword = credentials.password ?? password;

    setError('');
    if (!loginEmail || !loginPassword) { setError('Lütfen tüm alanları doldurun.'); triggerShake(); return; }

    if (loginEmail.toLowerCase() === DEMO_EMAIL.toLowerCase() && loginPassword === DEMO_PASSWORD) {
      clearUserScopedCache();
      localStorage.setItem('fincoach_demo_session', 'true');
      onAuth({
        id: 'demo-local-123',
        email: DEMO_EMAIL,
        name: 'Demo Kullanıcı',
        phone: '+90 555 000 00 00',
        onboardingCompleted: true,
        isDemo: true,
      });
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail.toLowerCase(),
      password: loginPassword,
    });

    if (authError) {
      const msg = authError?.message || 'Bir hata oluştu.';
      setError(msg === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : msg);
      if (!String(msg).startsWith('✅')) triggerShake();
      setLoading(false);
      return;
    }

    if (data.user) {
      clearUserScopedCache();
      const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      let profile = existingProfile;
      if (!profile) {
        const { data: createdProfile } = await supabase.from('profiles').upsert([{
          id: data.user.id,
          full_name: (data.user.email || 'Kullanıcı').split('@')[0],
          email: data.user.email,
          onboarding_completed: false
        }]).select().single();
        profile = createdProfile;
      }

      const authData = {
        name: profile?.full_name || (data.user.email || 'Kullanıcı').split('@')[0],
        email: data.user.email,
        id: data.user.id,
        phone: profile?.phone_text || '',
        onboardingCompleted: Boolean(profile?.onboarding_completed),
        isDemo: (data.user.email || '').toLowerCase() === DEMO_EMAIL.toLowerCase()
      };

      onAuth(authData);
    }
    setLoading(false);
  };

  const handleDemoLogin = () => {
    setMode('login');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    clearUserScopedCache();
    localStorage.setItem('fincoach_demo_session', 'true');
    onAuth({
      id: 'demo-local-123',
      email: DEMO_EMAIL,
      name: 'Demo Kullanıcı',
      phone: '+90 555 000 00 00',
      onboardingCompleted: true,
      isDemo: true,
    });
  };

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirm) { setError('Lütfen tüm alanları doldurun.'); triggerShake(); return; }

    const purePhone = phone.replace(/\D/g, '');
    if (purePhone.length < 10) {
      setError('Lütfen geçerli bir telefon numarası girin.');
      triggerShake();
      return;
    }
    if (!purePhone.startsWith('05') && !purePhone.startsWith('5')) {
      setError('Telefon numarası 5 ile başlamalıdır.');
      triggerShake();
      return;
    }

    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); triggerShake(); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); triggerShake(); return; }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      const errMsg = authError.message;
      if (errMsg.includes('email sending') || errMsg.includes('rate limit') || errMsg.includes('sending limit')) {
        setError('E-posta gönderim limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin veya farklı bir e-posta kullanın.');
        triggerShake();
      } else if (errMsg.includes('already registered') || errMsg.includes('User already registered')) {
        setError('Bu e-posta zaten kayıtlı. Giriş Yap sekmesini deneyin.');
        triggerShake();
      } else if (errMsg.includes('Password')) {
        setError('Şifre en az 6 karakter olmalıdır.');
        triggerShake();
      } else {
        setError(errMsg);
        if (errMsg && !String(errMsg).startsWith('✅')) triggerShake();
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert([
        { id: data.user.id, full_name: name, phone_text: phone, email: data.user.email }
      ]).select();
      if (profileError) {
        setError('Profil oluşturulamadı. Supabase RLS profil ekleme iznini kontrol edin.');
        triggerShake();
        setLoading(false);
        return;
      }

      if (data.session) {
        clearUserScopedCache();
        const authData = { name, email: data.user.email, id: data.user.id, phone, onboardingCompleted: false, isDemo: false };
        onAuth(authData);
        return;
      }
      setError('✅ Kayıt başarılı! E-postanızı kontrol edin ve doğrulama linkine tıklayın.');
    }
    setLoading(false);
  };

  const switchMode = (m) => {
    setMode(m); setError('');
    setName(''); setPhone(''); setEmail(''); setPassword(''); setConfirm('');
  };

  const isOk = error.startsWith('✅');

  return (
    <div
      className="auth-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        background: 'var(--bg-main)',
      }}
    >
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0);} 10%,30%,50%,70%,90%{transform:translateX(-5px);} 20%,40%,60%,80%{transform:translateX(5px);} }
        .shake { animation: shake .4s ease-in-out !important; }
        .auth-mobile-brand { display: none; }
        @media (max-width: 900px) { .auth-mobile-brand { display: flex; } }
        @media (max-width: 900px) {
          .auth-shell { grid-template-columns: 1fr !important; }
          .auth-brand { display: none !important; }
        }
      `}</style>

      <BrandPanel />

      {/* Form sütunu */}
      <main style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 28px', position: 'relative',
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute', top: 30, left: 28,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px',
              fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', fontFamily: 'inherit',
              transition: 'color .3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft size={15} /> Ana sayfa
          </button>
        )}

        <div className={shake ? 'shake' : ''} style={{ width: '100%', maxWidth: 424, margin: '0 auto' }}>
          {/* Mobil marka */}
          <div className="auth-mobile-brand" style={{ alignItems: 'center', gap: 11, marginBottom: 30 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: P.gradBrand, display: 'grid', placeItems: 'center' }}>
              <Wallet size={16} color="#0C0E10" strokeWidth={2.4} />
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>
              FinCoach<span style={{ color: P.green }}> AI</span>
            </span>
          </div>

          <Reveal variant="up">
            <h1 className="display" style={{ fontSize: 'clamp(30px, 3.4vw, 42px)', color: 'var(--text-primary)', marginBottom: 10 }}>
              {mode === 'login' ? <>Tekrar <em>hoş geldiniz</em></> : <>Hesabınızı <em>oluşturun</em></>}
            </h1>
          </Reveal>
          <Reveal variant="up" delay={90}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 30, lineHeight: 1.6 }}>
              {mode === 'login'
                ? 'Bulut senkronizasyonu aktif. Kaldığınız yerden devam edin.'
                : 'Otuz saniyede kurulum, kredi kartı gerekmez.'}
            </p>
          </Reveal>

          {/* Sekmeler */}
          <Reveal variant="up" delay={150}>
            <div style={{
              display: 'flex', gap: 4, marginBottom: 26, padding: 4,
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 13,
            }}>
              {[['login', 'Giriş Yap'], ['register', 'Kayıt Ol']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                    border: `1px solid ${mode === key ? 'rgba(195,203,211,0.32)' : 'transparent'}`,
                    background: mode === key ? 'rgba(195,203,211,0.13)' : 'transparent',
                    color: mode === key ? P.gold : 'var(--text-muted)',
                    transition: 'all .4s var(--ease-out-expo)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Demo kartı */}
          {mode === 'login' && (
            <Reveal variant="up" delay={200}>
              <div style={{
                border: '1px solid rgba(52,192,138,0.24)', background: 'rgba(52,192,138,0.06)',
                borderRadius: 16, padding: 16, marginBottom: 22,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 12 }}>
                  <div>
                    <p className="eyebrow" style={{ fontSize: 9.5, color: P.green, marginBottom: 5 }}>Canlı Demo</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Dolu veri seti, 26 modül, WhatsApp akışı — kayıt gerekmez.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Demo hesabı ile giriş yap"
                    onClick={handleDemoLogin}
                    disabled={loading}
                    style={{
                      flexShrink: 0, border: 'none', borderRadius: 10,
                      background: P.green, color: '#04130d', padding: '10px 15px',
                      fontSize: 12, fontWeight: 800, fontFamily: 'inherit',
                      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1,
                    }}
                  >
                    Demo gir
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>E-posta: <strong className="num" style={{ color: 'var(--text-secondary)' }}>{DEMO_EMAIL}</strong></span>
                  <span>Şifre: <strong className="num" style={{ color: 'var(--text-secondary)' }}>{DEMO_PASSWORD}</strong></span>
                </div>
              </div>
            </Reveal>
          )}

          {/* Form */}
          <Reveal variant="up" delay={250}>
            <div>
              {mode === 'register' && (
                <>
                  <AuthInput icon={User} placeholder="Ad Soyad" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
                  <AuthInput
                    icon={Phone}
                    placeholder="0 (5xx) xxx xx xx"
                    value={phone}
                    onChange={e => setPhone(formatPhone(e.target.value))}
                    maxLength={17}
                    autoComplete="tel"
                  />
                </>
              )}
              <AuthInput icon={Mail} type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
              <AuthInput
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                placeholder="Şifre"
                value={password}
                onChange={e => setPassword(e.target.value)}
                right={eyeBtn(showPass, () => setShowPass(v => !v))}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {mode === 'register' && <PasswordStrength password={password} />}
              {mode === 'register' && (
                <AuthInput
                  icon={Lock}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Şifre (Tekrar)"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  right={eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
                  autoComplete="new-password"
                />
              )}

              {error && (
                <div style={{
                  background: isOk ? 'rgba(52,192,138,0.09)' : 'rgba(219,92,78,0.09)',
                  border: `1px solid ${isOk ? 'rgba(52,192,138,0.28)' : 'rgba(219,92,78,0.28)'}`,
                  borderRadius: 12, padding: '12px 15px', margin: '4px 0 16px', fontSize: 13,
                  lineHeight: 1.5, color: isOk ? P.green : P.red,
                  animation: 'fadeSlideUp .35s var(--ease-out-expo) both',
                }}>
                  {isOk ? error : `⚠️ ${error}`}
                </div>
              )}

              <button
                className="btn-gold"
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                style={{
                  width: '100%', marginTop: 8, marginBottom: 20,
                  opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Yükleniyor…' : <>{mode === 'login' ? 'Giriş yap' : 'Hesabı oluştur'} <ArrowRight size={16} /></>}
              </button>
            </div>
          </Reveal>

          {/* Güven satırı */}
          <Reveal variant="fade" delay={340}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', paddingTop: 6 }}>
              {['AES-GCM şifreleme', 'KVKK uyumlu', 'İstediğin an sil'].map((t) => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  <Check size={12} color={P.gold} strokeWidth={2.6} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
