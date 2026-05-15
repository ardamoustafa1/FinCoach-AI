import { useState } from 'react';
import { Trophy, Swords, Crown, TrendingUp, Sparkles, AlertCircle, Medal, Zap, ShieldCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', borderHover: 'var(--border-hover)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Sen (FinCoach AI)', savingsRate: 32, score: 950, isMe: true, avatar: '😎' },
  { id: 2, name: 'Ahmet Yılmaz', savingsRate: 28, score: 820, isMe: false, avatar: '🤠' },
  { id: 3, name: 'Zeynep K.', savingsRate: 25, score: 780, isMe: false, avatar: '👩‍💻' },
  { id: 4, name: 'Caner D.', savingsRate: 15, score: 540, isMe: false, avatar: '🎸' },
  { id: 5, name: 'Merve S.', savingsRate: -5, score: 210, isMe: false, avatar: '🛍️' },
];

const MOCK_BADGES = [
  { id: 1, title: 'FinCoach Muhafızı', desc: 'Bütçeyi aşmadan 1 ay geçirdin.', icon: ShieldCheck, color: '#10B981', unlocked: true },
  { id: 2, title: 'Hız Tutkunu', desc: 'Aylık hedefine 10 gün erken ulaştın.', icon: Zap, color: '#F59E0B', unlocked: true },
  { id: 3, title: 'Tasarruf Ustası', desc: '%30 tasarruf oranını geçtin.', icon: Crown, color: '#7C3AED', unlocked: false },
  { id: 4, title: 'İlk Düello', desc: 'İlk finansal düellonu kazandın.', icon: Medal, color: '#EC4899', unlocked: false },
];

export default function LeaguePage() {
  const toast = useToast();
  const [inviting, setInviting] = useState(false);

  const handleInvite = () => {
    setInviting(true);
    setTimeout(() => {
      setInviting(false);
      const text = 'Seni FinCoach AI Finansal Düelloya davet ediyorum! Bakalım bu ay kim daha az gereksiz harcama yapacak? ⚔️💰 ' + window.location.origin;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      
      try {
        navigator.clipboard.writeText(text);
        toast.success('Davet bağlantısı kopyalandı ve WhatsApp açılıyor.');
      } catch {
        // ignore clipboard error
      }
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`}</style>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1C2038 0%, #141728 100%)',
        border: `1px solid ${P.purpleGlow}`, borderRadius: 24, padding: '40px 32px',
        position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)', flexWrap: 'wrap', gap: 24
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: P.purple, filter: 'blur(100px)', opacity: 0.15 }} />
        
        <div style={{ zIndex: 1, maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '6px 12px', borderRadius: 999, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: P.amber, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sezon 1: Bahar Dönemi</span>
            </div>
            <Sparkles size={16} color={P.amber} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12, lineHeight: 1.1 }}>
            Finansal Düello & Tasarruf Ligi ⚔️
          </h1>
          <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, margin: 0 }}>
            Arkadaşlarına meydan oku! Bu ay kim daha yüksek tasarruf oranına ulaşacak? Gereksiz harcamaları azalt, puanları topla ve liderlik tablosunda zirveye yerleş.
          </p>
        </div>

        <div style={{ zIndex: 1 }}>
          <button
            onClick={handleInvite}
            disabled={inviting}
            style={{
              padding: '16px 24px', borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: inviting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
              transition: 'transform 0.2s', opacity: inviting ? 0.7 : 1
            }}
            onMouseEnter={e => { if(!inviting) e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { if(!inviting) e.currentTarget.style.transform = 'scale(1)' }}
          >
            <Swords size={20} />
            {inviting ? 'Davet Hazırlanıyor...' : 'Meydan Oku (Davet Et)'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        
        {/* Leaderboard */}
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24, gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} color={P.amber} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: P.text1, margin: 0 }}>Liderlik Tablosu</h2>
              <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Tasarruf oranına göre aylık sıralama</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_LEADERBOARD.map((user, idx) => (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 16,
                background: user.isMe ? 'rgba(124,58,237,0.1)' : P.bg3,
                border: `1px solid ${user.isMe ? P.purpleGlow : P.border}`,
                transition: 'transform 0.2s', cursor: 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: idx === 0 ? P.amber : P.text3, width: 24, textAlign: 'center' }}>
                    {idx === 0 ? <Crown size={20} color={P.amber} /> : `#${idx + 1}`}
                  </div>
                  <div style={{ fontSize: 28 }}>{user.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: P.text1, margin: 0 }}>
                      {user.name} {user.isMe && <span style={{ fontSize: 11, background: P.purple, color: '#fff', padding: '2px 6px', borderRadius: 6, marginLeft: 8 }}>SEN</span>}
                    </h3>
                    <p style={{ fontSize: 13, color: P.text3, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={14} color={user.savingsRate > 0 ? P.green : P.red} /> 
                      <span style={{ color: user.savingsRate > 0 ? P.green : P.red }}>%{user.savingsRate} Tasarruf</span>
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: P.text1 }}>{user.score}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: P.text3, letterSpacing: '0.1em' }}>PUAN</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats & Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24, flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color={P.purpleLight} /> Düello Kuralları
            </h3>
            <ul style={{ paddingLeft: 20, margin: 0, color: P.text2, fontSize: 14, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><strong>Puanlama Sistemi:</strong> Gelirine oranla yaptığın her %1'lik tasarruf sana 10 puan kazandırır.</li>
              <li><strong>Eksi Puan:</strong> Bütçe limitlerini aşarsan ceza puanı alırsın! FinCoach AI seni yakından takip ediyor.</li>
              <li><strong>Aylık Sıfırlanma:</strong> Her ayın 1'inde lig sıfırlanır, yeni düello başlar.</li>
              <li>Abonelikleri iptal ederek veya hedeflerine ulaşarak ekstra "FinCoach AI Bonus Puanı" kazanabilirsin.</li>
            </ul>
          </div>
          
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 20, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: P.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(16,185,129,0.4)', animation: 'float 4s ease-in-out infinite' }}>
              <Trophy size={24} color="#fff" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: P.text1, marginBottom: 8 }}>Zirvedesin!</h3>
            <p style={{ fontSize: 14, color: P.text2, margin: 0 }}>Bu ay harika gidiyorsun. Bütçe limitlerine uyarak birinci sıradaki yerini koruyabilirsin.</p>
          </div>
          
          {/* Badges Section */}
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Medal size={18} color={P.amber} /> Kazanılan Rozetler
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {MOCK_BADGES.map(badge => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8,
                    padding: 16, borderRadius: 16, background: badge.unlocked ? `${badge.color}15` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${badge.unlocked ? `${badge.color}40` : P.border}`,
                    opacity: badge.unlocked ? 1 : 0.4, filter: badge.unlocked ? 'none' : 'grayscale(100%)'
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: badge.unlocked ? `0 4px 16px ${badge.color}60` : 'none' }}>
                      <Icon size={20} color="#fff" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{badge.title}</h4>
                      <p style={{ fontSize: 11, color: P.text3, margin: 0, lineHeight: 1.4 }}>{badge.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
