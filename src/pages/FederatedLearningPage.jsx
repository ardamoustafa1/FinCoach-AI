import { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Cloud, Lock, Cpu, Loader2, Database, Terminal } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

export default function FederatedLearningPage() {
  const [trainingState, setTrainingState] = useState('idle'); // idle, training, uploading, aggregating, done
  const [epoch, setEpoch] = useState(0);
  const [logs, setLogs] = useState([]);

  const addLog = (msg, color = P.text2) => {
    setLogs(prev => [...prev, { msg, color, id: Math.random() }]);
  };

  const startTraining = () => {
    if (trainingState !== 'idle' && trainingState !== 'done') return;
    setTrainingState('training');
    setEpoch(0);
    setLogs([]);
    addLog('[LOCAL] Federated Learning süreci başlatılıyor...', P.blue);
    addLog('[LOCAL] Yerel işlem verileri (Cihaz İçi) RAM\'e alınıyor.', P.text2);
    addLog('[LOCAL] Veriler kesinlikle sunucuya gönderilmiyor (Zero Data Egress).', P.green);
  };

  useEffect(() => {
    if (trainingState === 'training') {
      let currentEpoch = 1;
      const interval = setInterval(() => {
        setEpoch(currentEpoch);
        const loss = (0.8 / currentEpoch).toFixed(4);
        const accuracy = (0.7 + (currentEpoch * 0.02)).toFixed(4);
        addLog(`[TF.js] Epoch ${currentEpoch}/10 - loss: ${loss} - accuracy: ${accuracy}`);
        
        currentEpoch++;
        if (currentEpoch > 10) {
          clearInterval(interval);
          setTimeout(() => setTrainingState('uploading'), 800);
        }
      }, 500); // Fake training time
      return () => clearInterval(interval);
    }

    if (trainingState === 'uploading') {
      setTimeout(() => {
        addLog('[NETWORK] Eğitim tamamlandı. Ham veri (Raw Data) boyutu: 0 Bytes.', P.green);
        addLog('[PRIVACY] Differential Privacy devrede: Ağırlıklara Laplace Gürültüsü (ε=0.1) ekleniyor...', P.amber);
      }, 0);
      
      setTimeout(() => {
        addLog('[NETWORK] Model Ağırlıkları (Weights) AES-256 ile şifreleniyor...', P.purple);
        addLog('[NETWORK] Şifreli Ağırlıklar (4.2 KB) Global Sunucuya gönderiliyor ⬆️', P.blue);
      }, 1000);
      
      const t = setTimeout(() => {
        setTrainingState('aggregating');
      }, 3000);
      return () => clearTimeout(t);
    }

    if (trainingState === 'aggregating') {
      setTimeout(() => {
        addLog('[CLOUD] Global Aggregation (Ortalama Alma) işlemi başlatıldı...', P.amber);
        addLog('[CLOUD] Sizin ve 12.409 diğer kullanıcının ağırlıkları birleştirildi.', P.text2);
      }, 0);
      
      const t = setTimeout(() => {
        setTrainingState('done');
        addLog('[CLOUD] Global Model başarıyla güncellendi ve geri dağıtıldı ⬇️', P.green);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [trainingState]);

  return (
    <>
      <style>{`
        .flow-up { animation: flowUp 1.5s linear infinite; }
        @keyframes flowUp { 0% { transform: translateY(100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(-100%); opacity: 0; } }

        .flow-down { animation: flowDown 1.5s linear infinite; }
        @keyframes flowDown { 0% { transform: translateY(-100%); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(100%); opacity: 0; } }
        
        .pulse-border { animation: pulseBorder 1.5s ease-out infinite; }
        @keyframes pulseBorder { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 100% { box-shadow: 0 0 0 15px rgba(16,185,129,0); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, maxWidth: 900, margin: '0 auto' }}>
        
        <PageHeader
          icon={<ShieldCheck size={24} />}
          color={P.green}
          title="Federated Learning"
          subtitle="Harcama verileriniz cihazınızda kalır, sadece matematiksel ağırlıklar anonim olarak birleştirilir."
          badge="Gizlilik Odaklı AI"
        >
          <button 
            onClick={startTraining}
            disabled={trainingState !== 'idle' && trainingState !== 'done'}
            style={{
              background: trainingState === 'idle' || trainingState === 'done' ? `linear-gradient(135deg, ${P.blue}, #2563EB)` : P.bg3,
              color: trainingState === 'idle' || trainingState === 'done' ? '#fff' : P.text3,
              border: 'none',
              padding: '10px 20px', borderRadius: 14, fontSize: 13, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
              boxShadow: trainingState === 'idle' || trainingState === 'done' ? '0 8px 20px rgba(59,130,246,0.3)' : 'none'
            }}
          >
            {trainingState === 'idle' || trainingState === 'done' ? <Cpu size={16} /> : <Loader2 size={16} className="animate-spin" />}
            {trainingState === 'idle' || trainingState === 'done' ? 'Eğitimi Başlat' : 'Eğitiliyor...'}
          </button>
        </PageHeader>

        {/* VISUALIZATION TOPOLOGY */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 40, animationDelay: '0.1s' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            
            {/* CLOUD NODE */}
            <div style={{
              width: 220, padding: 24, borderRadius: 20,
              background: trainingState === 'aggregating' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
              border: `2px solid ${trainingState === 'aggregating' ? P.blue : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              transition: 'all 0.3s'
            }}>
              <Cloud size={48} color={trainingState === 'aggregating' ? P.blue : P.text3} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>Global AI Modeli</div>
                <div style={{ fontSize: 12, color: P.text2 }}>Merkezi Sunucu (Güvenli)</div>
              </div>
              {trainingState === 'aggregating' && (
                <div style={{ fontSize: 11, fontWeight: 700, color: P.blue, background: 'rgba(59,130,246,0.2)', padding: '4px 8px', borderRadius: 6 }}>
                  Ağırlıklar Birleştiriliyor...
                </div>
              )}
            </div>

            {/* NETWORK LINK */}
            <div style={{ height: 120, width: 60, position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', height: '100%', width: 2, background: 'rgba(255,255,255,0.1)', left: '30%' }} />
              <div style={{ position: 'absolute', height: '100%', width: 2, background: 'rgba(255,255,255,0.1)', right: '30%' }} />
              
              {/* Upload Animation */}
              {trainingState === 'uploading' && (
                <div style={{ position: 'absolute', left: '30%', bottom: 0, height: '100%', width: 2, overflow: 'hidden' }}>
                  <div className="flow-up" style={{ width: '100%', height: 30, background: `linear-gradient(to top, transparent, ${P.blue}, transparent)` }} />
                </div>
              )}

              {/* Download Animation */}
              {trainingState === 'done' && (
                <div style={{ position: 'absolute', right: '30%', top: 0, height: '100%', width: 2, overflow: 'hidden' }}>
                  <div className="flow-down" style={{ width: '100%', height: 30, background: `linear-gradient(to bottom, transparent, ${P.green}, transparent)` }} />
                </div>
              )}

              {/* Status Badge */}
              <div style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                background: P.bg0, border: `1px solid ${P.border}`, padding: '6px 12px', borderRadius: 20,
                display: 'flex', alignItems: 'center', gap: 6, zIndex: 2
              }}>
                <Lock size={12} color={P.text2} />
                <span style={{ fontSize: 11, fontWeight: 800, color: P.text2 }}>E2EE Ağırlıklar</span>
              </div>
            </div>

            {/* LOCAL NODE (USER PHONE) */}
            <div style={{ display: 'flex', gap: 40, width: '100%', justifyContent: 'center' }}>
              <div style={{
                width: 280, padding: 24, borderRadius: 20,
                background: trainingState === 'training' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                border: `2px solid ${trainingState === 'training' ? P.green : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                transition: 'all 0.3s', position: 'relative'
              }}>
                {trainingState === 'training' && <div className="pulse-border" style={{ position: 'absolute', inset: -2, borderRadius: 22, pointerEvents: 'none' }} />}
                
                <Smartphone size={48} color={trainingState === 'training' ? P.green : P.text3} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>Kullanıcı Cihazı (Local)</div>
                  <div style={{ fontSize: 12, color: P.text2 }}>Eğitim burada gerçekleşir</div>
                </div>

                <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 12, border: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: P.text3, fontWeight: 700 }}>EĞİTİM (EPOCH)</span>
                    <span style={{ fontSize: 11, color: P.green, fontWeight: 700 }}>{epoch}/10</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: P.green, width: `${(epoch / 10) * 100}%`, transition: 'width 0.3s linear' }} />
                  </div>
                </div>
              </div>

              {/* LOCAL DATA (NEVER LEAVES) */}
              <div style={{
                width: 200, padding: 24, borderRadius: 20,
                background: 'rgba(239,68,68,0.05)',
                border: `1px dashed rgba(239,68,68,0.4)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, justifyContent: 'center'
              }}>
                <Database size={32} color={P.red} opacity={0.8} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: P.red }}>Ham İşlem Verisi</div>
                  <div style={{ fontSize: 11, color: P.text2, marginTop: 4 }}>Asla Cihazdan Çıkmaz</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TERMINAL LOGS */}
        <div className="animate-enter" style={{ background: P.bg0, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', minHeight: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Terminal size={18} color="#94a3b8" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>FEDERATED AI EĞİTİM LOGLARI</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace' }}>
            {logs.length === 0 && <span style={{ color: '#475569', fontSize: 13 }}>Sistem hazır. Yerel eğitim için başlat butonuna basın.</span>}
            {logs.map((log) => (
              <div key={log.id} className="animate-enter" style={{ color: log.color, fontSize: 13, lineHeight: 1.5 }}>
                {log.msg}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
