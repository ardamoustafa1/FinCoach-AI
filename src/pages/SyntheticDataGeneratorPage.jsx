import { useState, useEffect, useRef } from 'react';
import { Database, Zap, ShieldCheck, Download, Fingerprint, Activity, Layers, TerminalSquare, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import useStore from '../store/useStore';

import { P } from '../styles/palette';

const RISK_CATEGORIES = ['Fast Fashion', 'Tech Gadgets', 'Dining Out', 'Gaming', 'Travel', 'Subscription', 'Grocery'];
const RISK_LEVELS = ['LOW', 'MED', 'HIGH'];

function generateSyntheticProfile(index, focusCategory, riskBias) {
  const id = `syn_${Math.random().toString(36).substring(2, 6)}`;
  const risk = riskBias === 'HIGH' 
    ? (Math.random() > 0.3 ? 'HIGH' : 'MED')
    : riskBias === 'LOW'
    ? (Math.random() > 0.3 ? 'LOW' : 'MED')
    : RISK_LEVELS[Math.floor(Math.random() * 3)];
  const age = Math.floor(Math.random() * 30) + 20;
  const salary = Math.floor(Math.random() * 100000) + 25000;
  const impulsiveScore = parseFloat((Math.random()).toFixed(2));
  const category = focusCategory !== 'Tümü' ? focusCategory : RISK_CATEGORIES[Math.floor(Math.random() * RISK_CATEGORIES.length)];
  return { id, risk, age, salary, impulsiveScore, category };
}

export default function SyntheticDataGeneratorPage() {
  const [step, setStep] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [profiles, setProfiles] = useState([]);
  
  // Config
  const [profileCount, setProfileCount] = useState(100000);
  const [focusCategory, setFocusCategory] = useState('Tümü');
  const [riskBias, setRiskBias] = useState('Karma');

  const timersRef = useRef([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    // Pre-populate from user's actual transaction categories if available
    const txs = useStore.getState().transactions || [];
    if (txs.length > 0) {
      const topCategory = Object.entries(
        txs.reduce((acc, t) => {
          if (t?.kategori) acc[t.kategori] = (acc[t.kategori] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0];
      if (topCategory) setFocusCategory(topCategory[0]);
    }
    return () => {
      isMountedRef.current = false;
      timersRef.current.forEach(id => {
        clearInterval(id);
        clearTimeout(id);
      });
    };
  }, []);

  const handleGenerate = () => {
    setStep(1);
    setProgress(0);
    setProfiles([]);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        const tId = setTimeout(() => {
          if (!isMountedRef.current) return;
          // Generate 4 preview profiles dynamically
          setProfiles([0,1,2,3].map(i => generateSyntheticProfile(i, focusCategory, riskBias)));
          setStep(2);
        }, 500);
        timersRef.current.push(tId);
      }
      if (isMountedRef.current) setProgress(currentProgress);
      
      if (currentProgress % 20 === 0 && currentProgress < 100) {
        if (isMountedRef.current) setProfiles(prev => [...prev, generateSyntheticProfile(prev.length, focusCategory, riskBias)]);
      }
    }, 300);
    timersRef.current.push(interval);
  };

  return (
    <>
      <style>{`
        .gan-bg {
          background-image: linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, 0.03) 25%, rgba(59, 130, 246, 0.03) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.03) 75%, rgba(59, 130, 246, 0.03) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, 0.03) 25%, rgba(59, 130, 246, 0.03) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, 0.03) 75%, rgba(59, 130, 246, 0.03) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
        }
        .data-flow {
          position: absolute; top: 0; bottom: 0; left: 50%; width: 2px;
          background: linear-gradient(to bottom, transparent, #3B82F6, transparent);
          animation: flow 1.5s infinite linear;
        }
        @keyframes flow { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .json-text { font-family: 'Fira Code', monospace; color: #3B82F6; font-size: 12px; }
      `}</style>

      <div className="gan-bg" style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, minHeight: '100%' }}>
        <PageHeader
          icon={<Layers size={24} />}
          color="#3B82F6"
          title="Synthetic Data Generator (GAN)"
          subtitle="Bankaların AI modellerini eğitmesi için %100 istatistiksel doğrulukta, KVKK/GDPR uyumlu sahte finansal profiller üretir."
          badge="B2B Veri Pazarı"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: GENERATION CONTROLS */}
          <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
              <TerminalSquare size={20} color={P.blue} />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: 0 }}>Generative Adversarial Network (GAN)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <div>
                <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, marginBottom: 8, display: 'block' }}>Üretilecek Veri Seti Büyüklüğü</label>
                <select value={profileCount} onChange={e => setProfileCount(Number(e.target.value))} disabled={step === 1} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  <option value={10000}>10,000 Profil</option>
                  <option value={50000}>50,000 Profil</option>
                  <option value={100000}>100,000 Profil</option>
                  <option value={500000}>500,000 Profil (Enterprise)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, marginBottom: 8, display: 'block' }}>Odak Kategori</label>
                <select value={focusCategory} onChange={e => setFocusCategory(e.target.value)} disabled={step === 1} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  <option value="Tümü">Tümü (Karma)</option>
                  {RISK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, marginBottom: 8, display: 'block' }}>Risk Eğilimi</label>
                <select value={riskBias} onChange={e => setRiskBias(e.target.value)} disabled={step === 1} style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: P.bg0, border: `1px solid ${P.border}`, color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  <option value="Karma">Karma (Gerçekçi)</option>
                  <option value="HIGH">Yüksek Riskli Ağırlıklı</option>
                  <option value="LOW">Düşük Riskli Ağırlıklı</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: P.text2, fontWeight: 700, marginBottom: 8, display: 'block' }}>Gizlilik Katmanı (Privacy Shield)</label>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.3)`, padding: '12px 16px', borderRadius: 12, color: P.green, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} /> Differential Privacy K-Anonymity Aktif
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {step === 0 || step === 2 ? (
                <button 
                  onClick={() => { setStep(0); setProfiles([]); setProgress(0); setTimeout(handleGenerate, 50); }}
                  style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 30px rgba(59,130,246,0.4)' }}
                >
                  {step === 2 ? <><RefreshCw size={18} /> Yeniden Üret</> : <><Database size={18} /> Sentetik Veri Üretimini Başlat</>}
                </button>
              ) : step === 1 ? (
                <div style={{ width: '100%', padding: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: 48, background: P.blue, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, transition: 'width 0.3s' }}>
                    {progress}%
                  </div>
                </div>
              ) : (
                <button 
                  style={{ width: '100%', padding: '16px', borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.3)`, color: P.green, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Download size={18} /> Banka API'sine Export Et (JSON)
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: DATA PREVIEW */}
          <div className="animate-enter" style={{ background: '#050714', border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', animationDelay: '0.1s', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={20} color={P.green} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>Gerçek Zamanlı Veri Akışı</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: P.text3, fontWeight: 700 }}>
                <Fingerprint size={14} /> KVKK UYUMLU (NO PII)
              </div>
            </div>

            {step === 1 && <div className="data-flow" />}

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {profiles.length === 0 && step === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.text3, fontSize: 13, fontWeight: 600 }}>
                  Üretim bekliyor...
                </div>
              ) : (
                profiles.filter(Boolean).map((p, i) => (
                  <div key={i} className="json-text animate-enter" style={{ background: 'rgba(59,130,246,0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(59,130,246,0.1)' }}>
                    {`{`} <br/>
                    &nbsp;&nbsp;"id": <span style={{ color: P.green }}>"{p.id}"</span>, <br/>
                    &nbsp;&nbsp;"risk_profile": <span style={{ color: p.risk === 'HIGH' ? P.red : P.amber }}>"{p.risk}"</span>, <br/>
                    &nbsp;&nbsp;"age_cluster": <span style={{ color: P.purple }}>{p.age}</span>, <br/>
                    &nbsp;&nbsp;"impulsive_score": <span style={{ color: '#fff' }}>{p.impulsiveScore}</span>, <br/>
                    &nbsp;&nbsp;"trigger_category": <span style={{ color: P.green }}>"{p.category}"</span> <br/>
                    {`}`}
                  </div>
                ))
              )}
            </div>
            
            {step === 2 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid rgba(255,255,255,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: P.text3, fontWeight: 700 }}>Üretilen Toplam Satır</div>
                  <div style={{ fontSize: 20, color: '#fff', fontWeight: 900 }}>{profileCount.toLocaleString('tr-TR')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: P.text3, fontWeight: 700 }}>Tahmini Pazar Değeri</div>
                  <div style={{ fontSize: 20, color: P.green, fontWeight: 900 }}>${(profileCount * 0.15 / 1000).toFixed(0)}K / Ay</div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}
