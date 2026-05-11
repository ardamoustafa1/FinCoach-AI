import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

/* ─── Şifre Güç Ölçer ─── */
function PasswordStrength({ password }) {
  if (!password) return null;

  let score = 0;
  const checks = [
    { label: 'En az 6 karakter', pass: password.length >= 6 },
    { label: 'Büyük harf içeriyor', pass: /[A-Z]/.test(password) },
    { label: 'Küçük harf içeriyor', pass: /[a-z]/.test(password) },
    { label: 'Rakam içeriyor', pass: /[0-9]/.test(password) },
    { label: 'Özel karakter içeriyor', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  checks.forEach(c => { if (c.pass) score++; });

  const levels = [
    { label: 'Çok Zayıf', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: ShieldAlert },
    { label: 'Zayıf', color: '#F97316', bg: 'rgba(249,115,22,0.15)', icon: ShieldAlert },
    { label: 'Orta', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: Shield },
    { label: 'Güçlü', color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: ShieldCheck },
    { label: 'Çok Güçlü', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', icon: ShieldCheck },
  ];
  const level = levels[Math.max(0, score - 1)];
  const pct = (score / 5) * 100;
  const Icon = level.icon;

  return (
    <div style={{ marginTop: -4, marginBottom: 12 }}>
      {/* Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 99,
            background: i <= score ? level.color : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s ease',
            boxShadow: i <= score ? `0 0 8px ${level.color}40` : 'none',
          }} />
        ))}
      </div>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} color={level.color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: level.color }}>{level.label}</span>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{score}/5 kriter</span>
      </div>
      {/* Criteria dots */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
        {checks.map(c => (
          <span key={c.label} style={{
            fontSize: 10, color: c.pass ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'color 0.3s',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: c.pass ? '#10B981' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s',
            }} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Input bileşeni ─── */
function AuthInput({ icon: Icon, type = 'text', placeholder, value, onChange, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '14px 16px', marginBottom: 12,
      transition: 'border-color 0.2s, background 0.2s',
    }}>
      {Icon && <Icon size={17} color="rgba(167,139,250,0.7)" style={{ flexShrink: 0 }} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: '#F1F5F9', fontSize: 15, fontFamily: 'inherit',
        }}
        onFocus={e => {
          e.currentTarget.parentElement.style.borderColor = 'rgba(124,58,237,0.6)';
          e.currentTarget.parentElement.style.background = 'rgba(124,58,237,0.08)';
        }}
        onBlur={e => {
          e.currentTarget.parentElement.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.parentElement.style.background = 'rgba(255,255,255,0.05)';
        }}
      />
      {right}
    </div>
  );
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const eyeBtn = (show, toggle) => (
    <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.3)' }}>
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Lütfen tüm alanları doldurun.'); return; }
    
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-posta veya şifre hatalı.' : authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profil bilgisini çek (opsiyonel, isterseniz app.jsx'de de yapabilirsiniz)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      
      const authData = { 
        name: profile?.full_name || data.user.email.split('@')[0], 
        email: data.user.email,
        id: data.user.id
      };
      
      localStorage.setItem('butceai_auth_user', JSON.stringify(authData));
      localStorage.setItem('butceai_user_name', authData.name);
      onAuth(authData);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirm) { setError('Lütfen tüm alanları doldurun.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (password !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (authError) {
      // Türkçe hata çevirileri
      const errMsg = authError.message;
      if (errMsg.includes('email sending') || errMsg.includes('rate limit') || errMsg.includes('sending limit')) {
        setError('E-posta gönderim limiti aşıldı. Lütfen birkaç dakika bekleyip tekrar deneyin veya farklı bir e-posta kullanın.');
      } else if (errMsg.includes('already registered') || errMsg.includes('User already registered')) {
        setError('Bu e-posta zaten kayıtlı. Giriş Yap sekmesini deneyin.');
      } else if (errMsg.includes('Password')) {
        setError('Şifre en az 6 karakter olmalıdır.');
      } else {
        setError(errMsg);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profili oluştur (hata olsa bile devam et)
      await supabase.from('profiles').upsert([
        { id: data.user.id, full_name: name, email: data.user.email }
      ]).select();

      // E-posta onayı kapalıysa (demo modu) direkt giriş yap
      if (data.session) {
        const authData = { name, email: data.user.email, id: data.user.id };
        localStorage.setItem('butceai_auth_user', JSON.stringify(authData));
        localStorage.setItem('butceai_user_name', name);
        onAuth(authData);
        return;
      }

      // E-posta onayı açıksa bilgi mesajı göster
      setError('✅ Kayıt başarılı! E-postanızı kontrol edin ve doğrulama linkine tıklayın.');
    }
    setLoading(false);
  };

  const switchMode = (m) => {
    setMode(m); setError('');
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050714', position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55%', height: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)' }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 460, zIndex: 10, animation: 'fadeSlideUp 0.4s ease' }}>
        <style>{`
          @keyframes fadeSlideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
          @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
          .auth-submit:hover { opacity: 0.88 !important; transform: translateY(-1px) !important; }
          .auth-tab-active { background: rgba(124,58,237,0.18) !important; color: #a78bfa !important; border-color: rgba(124,58,237,0.4) !important; }
        `}</style>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #7c3aed, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}>
            <Sparkles size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#F1F5F9', letterSpacing: '-0.03em', margin: 0 }}>
            Bütçe<span style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Gerçek zamanlı bulut senkronizasyonu aktif ☁️</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 28, padding: '36px 32px', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 2, background: 'linear-gradient(90deg, #7c3aed, #6366f1, #10b981)', backgroundSize: '300% 100%', animation: 'gradShift 4s ease infinite' }} />

          <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4 }}>
            {[['login', 'Giriş Yap'], ['register', 'Kayıt Ol']].map(([key, label]) => (
              <button key={key} onClick={() => switchMode(key)} className={mode === key ? 'auth-tab-active' : ''} style={{ flex: 1, padding: '10px 0', borderRadius: 11, background: 'transparent', border: '1px solid transparent', color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>{label}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', marginBottom: 6 }}>{mode === 'login' ? 'Tekrar hoş geldin 👋' : 'Hesap oluştur ✨'}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>{mode === 'login' ? 'Supabase ile güvenli giriş' : 'Verilerinizi bulutta saklayın'}</p>

          {mode === 'register' && <AuthInput icon={User} placeholder="Ad Soyad" value={name} onChange={e => setName(e.target.value)} />}
          <AuthInput icon={Mail} type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
          <AuthInput icon={Lock} type={showPass ? 'text' : 'password'} placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} right={eyeBtn(showPass, () => setShowPass(v => !v))} />
          {mode === 'register' && <PasswordStrength password={password} />}
          {mode === 'register' && <AuthInput icon={Lock} type={showConfirm ? 'text' : 'password'} placeholder="Şifre (Tekrar)" value={confirm} onChange={e => setConfirm(e.target.value)} right={eyeBtn(showConfirm, () => setShowConfirm(v => !v))} />}

          {error && <div style={{
            background: error.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${error.startsWith('✅') ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13,
            color: error.startsWith('✅') ? '#6ee7b7' : '#fca5a5'
          }}>{error.startsWith('✅') ? error : `⚠️ ${error}`}</div>}

          <button className="auth-submit" onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading} style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #6366f1)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 12px 32px rgba(124,58,237,0.4)', marginBottom: 20 }}>
            {loading ? 'Yükleniyor...' : <>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} <ArrowRight size={17} /></>}
          </button>

        </div>
      </div>
    </div>
  );
}
