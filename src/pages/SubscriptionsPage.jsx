import { useState, useEffect } from 'react';
import { 
  ShieldAlert, Bot, CheckCircle2, Loader2, PlayCircle, Video, Music, Dumbbell
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';

/* ─── Palette ─── */
const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const MOCK_SUBSCRIPTIONS = [
  { id: 'sub_1', name: 'Netflix', price: 229.99, cycle: 'Aylık', icon: Video, color: '#E50914', category: 'Eğlence' },
  { id: 'sub_2', name: 'Spotify', price: 59.99, cycle: 'Aylık', icon: Music, color: '#1DB954', category: 'Eğlence' },
  { id: 'sub_3', name: 'MacFit', price: 850.00, cycle: 'Aylık', icon: Dumbbell, color: '#F59E0B', category: 'Sağlık' },
  { id: 'sub_4', name: 'YouTube Premium', price: 57.99, cycle: 'Aylık', icon: PlayCircle, color: '#FF0000', category: 'Eğlence' },
];

export default function SubscriptionsPage() {
  const toast = useToast();
  const [subs, setSubs] = useState(MOCK_SUBSCRIPTIONS);
  const [cancelingId, setCancelingId] = useState(null);
  const [agentStep, setAgentStep] = useState(0); // 0: off, 1-5: steps
  const [agentLogs, setAgentLogs] = useState([]);

  const handleCancel = (sub) => {
    setCancelingId(sub.id);
    setAgentStep(1);
    setAgentLogs([`[AI Agent] Görev başlatıldı: ${sub.name} iptali.`]);
  };

  useEffect(() => {
    if (agentStep === 0 || !cancelingId) return;

    const sub = subs.find(s => s.id === cancelingId);
    
    const steps = [
      { delay: 1000, step: 2, log: `[Puppeteer] Headless tarayıcı başlatılıyor...` },
      { delay: 2500, step: 3, log: `[Navigation] ${sub.name.toLowerCase()}.com adresine gidiliyor ve oturum açılıyor...` },
      { delay: 4500, step: 4, log: `[Vision AI] DOM analiz edildi. 'Hesap Ayarları' > 'Aboneliği İptal Et' butonu bulundu.` },
      { delay: 6500, step: 5, log: `[Action] İptal onayı verildi. Karanlık kalıplar (dark patterns) aşıldı.` },
      { delay: 8500, step: 6, log: `[Success] ${sub.name} aboneliği başarıyla iptal edildi! 🎉` },
    ];

    const timeouts = steps.map(s => setTimeout(() => {
      setAgentStep(s.step);
      setAgentLogs(prev => [...prev, s.log]);
      if (s.step === 6) {
        setTimeout(() => {
          setSubs(prev => prev.map(item => item.id === cancelingId ? { ...item, canceled: true } : item));
          setCancelingId(null);
          setAgentStep(0);
          setAgentLogs([]);
          toast.success(`${sub.name} aboneliği otonom olarak iptal edildi!`);
        }, 3000);
      }
    }, s.delay));

    return () => timeouts.forEach(clearTimeout);
  }, [agentStep, cancelingId, subs, toast]);

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.2); }
          50% { box-shadow: 0 0 40px rgba(124,58,237,0.6); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .agent-modal-enter { animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        <PageHeader
          icon={<ShieldAlert size={24} />}
          color="#EF4444"
          title="Abonelik Taksıpçisi"
          subtitle="Unuttuğunuz abonelikleri tespit edin, yapay zeka ajanımız sizin yerinize iptal etsin."
          badge="Agentic AI"
        />

        {/* ── SUBSCRIPTIONS LIST ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {subs.map(sub => {
            const isCanceled = sub.canceled;
            const isCanceling = cancelingId === sub.id;
            
            return (
              <div key={sub.id} style={{
                background: P.bg2,
                border: `1px solid ${isCanceled ? P.border : isCanceling ? P.purple : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 20, padding: 24,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isCanceled ? 0.6 : 1,
                boxShadow: isCanceling ? '0 0 32px rgba(124,58,237,0.3)' : '0 12px 32px rgba(0,0,0,0.2)',
                filter: isCanceled ? 'grayscale(100%)' : 'none'
              }}>
                {/* Accent line */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: isCanceled ? P.border : sub.color }} />
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${sub.color}15`, border: `1px solid ${sub.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <sub.icon size={24} color={sub.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{sub.name}</h3>
                      <p style={{ fontSize: 12, color: P.text3, margin: 0, fontWeight: 600 }}>{sub.category} • {sub.cycle}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: P.text1, margin: 0 }}>₺{sub.price}</p>
                    <p style={{ fontSize: 11, color: P.text3, margin: 0 }}>/ ay</p>
                  </div>
                </div>

                {isCanceled ? (
                  <div style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: 'rgba(16,185,129,0.1)', border: '1px dashed rgba(16,185,129,0.3)',
                    color: P.green, fontSize: 13, fontWeight: 800, textAlign: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}>
                    <CheckCircle2 size={16} /> İptal Edildi
                  </div>
                ) : (
                  <button
                    onClick={() => handleCancel(sub)}
                    disabled={cancelingId !== null}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.1)`,
                      color: '#fff', fontSize: 14, fontWeight: 800, cursor: cancelingId ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if(!cancelingId) { e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444, #7C3AED)'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(239,68,68,0.4)'; } }}
                    onMouseLeave={e => { if(!cancelingId) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; } }}
                  >
                    {isCanceling ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Bot size={18} />}
                    {isCanceling ? 'Agent Devrede...' : 'Otonom İptal Et'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── AGENT MODAL ── */}
        {agentStep > 0 && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
          }}>
            <div className="agent-modal-enter" style={{
              width: '100%', maxWidth: 700,
              background: '#09090b', border: '1px solid rgba(124,58,237,0.4)',
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 0 80px rgba(124,58,237,0.3)',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)',
                padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Bot size={24} color="#c4b5fd" className={agentStep < 6 ? "animate-pulse" : ""} />
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.05em' }}>Agent Terminal</h3>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Otonom tarayıcı kontrolü sağlanıyor...</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                </div>
              </div>

              {/* Terminal Body */}
              <div style={{ padding: 24, minHeight: 320, position: 'relative', fontFamily: 'monospace' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.25) 50%)', backgroundSize: '100% 4px', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
                  {agentLogs.map((log, i) => {
                    const isLast = i === agentLogs.length - 1;
                    const isSuccess = log.includes('Success');
                    return (
                      <div key={i} style={{
                        color: isSuccess ? '#10b981' : (isLast && agentStep < 6) ? '#c4b5fd' : '#64748b',
                        fontSize: 14, display: 'flex', gap: 12, lineHeight: 1.5,
                        animation: 'fadeSlideUp 0.3s ease'
                      }}>
                        <span style={{ color: '#3b82f6', userSelect: 'none' }}>~ %</span>
                        <span>{log}</span>
                        {(isLast && agentStep < 6) && (
                          <span style={{ width: 8, height: 16, background: '#c4b5fd', display: 'inline-block', animation: 'pulse 1s infinite', marginLeft: 4 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {agentStep === 6 && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, rgba(16,185,129,0.2) 0%, transparent 70%)', animation: 'ping 2s ease-out' }} />
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
