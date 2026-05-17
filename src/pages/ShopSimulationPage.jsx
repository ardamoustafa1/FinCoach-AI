import { useState, useEffect } from 'react';
import { ShoppingBag, ShieldAlert, ShieldCheck, Zap, Scale, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

import { P } from '../styles/palette';
// ─── DAVRANIŞSAL İKTİSAT MOTORU ───
// Formül: V = A / (1 + kD)
function calculateHyperbolicDiscounting(price) {
  const k = 0.15; // Kullanıcının dürtüsellik katsayısı (Kişilik modelinden gelebilir)
  const years = 5;
  const days = years * 365;
  const expectedROI = 0.08; // Yıllık %8 getiri (Hisse senedi/Fon)
  
  // Gelecekteki Paranın Matematiksel Değeri (Bileşik Faiz)
  const futureValue = price * Math.pow(1 + expectedROI, years);
  
  // İnsanın Beynindeki Öznel (İndirgenmiş) Değeri (Hiperbolik İndirgeme)
  const subjectiveFutureValue = futureValue / (1 + k * days);
  
  // Anlık zevkin nesnel değeri
  const immediateValue = price;

  // İrrasyonalite Skoru (Yüzde olarak ne kadar mantıksız bir karar?)
  // Eğer beynimiz gelecekteki 36.000 TL'yi bugün 1.200 TL gibi algılıyorsa, çok mantıksız bir karar veriyoruzdur.
  const irrationalityRatio = 1 - (subjectiveFutureValue / immediateValue);
  const score = Math.max(0, Math.min(100, Math.round(irrationalityRatio * 100)));

  return { futureValue, subjectiveFutureValue, score };
}

export default function ShopSimulationPage() {
  const [buying, setBuying] = useState(false);
  const [swarmStep, setSwarmStep] = useState(0); // 0: none, 1: Risk, 2: Opp, 3: Psychologist, 4: Orch, 5: Final
  const [psyData, setPsyData] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleBuy = () => {
    setBuying(true);
    setSwarmStep(1); 
    setPsyData(calculateHyperbolicDiscounting(24999));
  };

  useEffect(() => {
    if (swarmStep === 1) {
      const t = setTimeout(() => setSwarmStep(2), 2000);
      return () => clearTimeout(t);
    } else if (swarmStep === 2) {
      const t = setTimeout(() => setSwarmStep(3), 2000);
      return () => clearTimeout(t);
    } else if (swarmStep === 3) {
      const t = setTimeout(() => setSwarmStep(4), 3500); // Psikolog daha uzun okunsun
      return () => clearTimeout(t);
    } else if (swarmStep === 4) {
      const t = setTimeout(() => setSwarmStep(5), 2500);
      return () => clearTimeout(t);
    }
  }, [swarmStep]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#fff', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', overflowY: 'auto' }}>
      <style>{`
        @keyframes pulseBorder { 0%, 100% { border-color: rgba(124,58,237,0.3); } 50% { border-color: rgba(124,58,237,0.8); } }
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
            disabled={buying}
            style={{
              background: '#0071e3', color: '#fff', border: 'none', padding: '18px 32px', borderRadius: 999,
              fontSize: 17, fontWeight: 600, cursor: buying ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            {'Tek Tıkla Satın Al (Apple Pay)'}
          </button>
        </div>
      </div>

      {/* MULTI-AGENT SWARM MODAL */}
      {swarmStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ width: '100%', maxWidth: 540, maxHeight: 'calc(100vh - 64px)', overflowY: 'auto', background: P.bg1, border: `1px solid ${P.border}`, borderRadius: 32, padding: '32px 40px', boxShadow: `0 40px 120px rgba(0,0,0,0.8)`, position: 'relative' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, borderBottom: `1px solid ${P.border}`, paddingBottom: 20 }}>
              <div style={{ background: 'rgba(124,58,237,0.2)', padding: 10, borderRadius: 14 }}><Zap size={24} color={P.purple} /></div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: P.text1, letterSpacing: '-0.01em', margin: 0 }}>Multi-Agent AI Swarm</h2>
                <p style={{ fontSize: 13, color: P.text2, margin: 0 }}>Otonom Yapay Zeka Yönetim Kurulu Kararı</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Agent 1: CFO (Risk) */}
              <div className="animate-enter" style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${P.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldAlert size={20} color={P.red} />
                </div>
                <div style={{ background: P.bg2, borderRadius: '4px 16px 16px 16px', padding: 16, border: `1px solid ${P.border}`, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: P.red, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Ajanı (CFO)</div>
                  <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.5 }}>
                    "Bunu alırsak 12. günde nakit akışı eksiye düşüyor. Temel ihtiyaç değil lüks kategorisinde. Asgari ödeme krizine gireriz. <strong>RED!</strong>"
                  </p>
                </div>
              </div>

              {/* Agent 2: Opportunity */}
              {swarmStep >= 2 && (
                <div className="animate-enter" style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(16, 185, 129, 0.1)', border: `1px solid ${P.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={20} color={P.green} />
                  </div>
                  <div style={{ background: P.bg2, borderRadius: '4px 16px 16px 16px', padding: 16, border: `1px solid ${P.border}`, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: P.green, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fırsat Ajanı (Yatırımcı)</div>
                    <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.5 }}>
                      "Tüketici elektroniği enflasyonu %40. Parayı nakitte tutmak erimesine sebep olur. Gelecek ay zam gelme ihtimali var. <strong>ONAY!</strong>"
                    </p>
                  </div>
                </div>
              )}

              {/* Agent 3: Behavioral Psychologist (Hyperbolic Discounting) */}
              {swarmStep >= 3 && psyData && (
                <div className="animate-enter" style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(6, 182, 212, 0.1)', border: `1px solid ${P.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BrainCircuit size={20} color={P.cyan} />
                  </div>
                  <div style={{ background: P.bg2, borderRadius: '4px 16px 16px 16px', padding: 16, border: `1px solid ${P.cyan}40`, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: P.cyan, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Psikolog Ajan (Davranışsal İktisat)</div>
                    <p style={{ fontSize: 14, color: P.text1, margin: '0 0 8px', lineHeight: 1.5 }}>
                      "Kullanıcının kararını <strong>Hiperbolik İndirgeme</strong> algoritmasıyla analiz ettim. Bu tutar 5 yıl yatırıma dönse <strong>{(psyData.futureValue).toLocaleString('tr-TR', {maximumFractionDigits:0})} ₺</strong> olacak."
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, border: `1px solid ${P.cyan}20` }}>
                      <p style={{ fontSize: 12, color: P.text2, margin: '0 0 4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Anlık Zevk Dürtüsü:</span> <span style={{ color: P.red, fontWeight: 700 }}>Çok Yüksek</span>
                      </p>
                      <p style={{ fontSize: 12, color: P.text2, margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                        <span>İrrasyonalite Skoru:</span> <span style={{ color: P.amber, fontWeight: 700 }}>%{psyData.score} (Mantıksız)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Agent 4: Orchestrator */}
              {swarmStep >= 4 && (
                <div className="animate-enter" style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: 'rgba(124, 58, 237, 0.1)', border: `1px solid ${P.purple}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: swarmStep === 4 ? 'pulseBorder 1.5s infinite' : 'none' }}>
                    <Scale size={20} color={P.purple} />
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), transparent)', borderRadius: '4px 16px 16px 16px', padding: 16, border: `1px solid ${P.purple}`, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: P.purple, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hakem Ajan (Orkestratör)</div>
                    {swarmStep === 4 ? (
                      <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.5, fontStyle: 'italic', opacity: 0.8 }}>
                        Psikolojik ve Finansal veriler sentezleniyor...
                      </p>
                    ) : (
                      <p style={{ fontSize: 14, color: P.text1, margin: 0, lineHeight: 1.5 }}>
                        "Mantıksızlık skoru (%{psyData?.score}) çok yüksek. Peşin alım REDDEDİLDİ. Psikolojik dürtüyü kırmak için <strong>7 Gün Bekleme Kuralı</strong> veya likiditeyi korumak için <strong>6 Taksit</strong> şartı koşuyorum."
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* FINAL ACTION BUTTON */}
            {swarmStep >= 5 && (
              <div className="animate-enter" style={{ marginTop: 32, display: 'flex', gap: 12, animationDelay: '0.2s' }}>
                <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '16px', borderRadius: 16, background: P.bg2, color: P.text1, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', border: `1px solid ${P.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = '#334155'} onMouseLeave={e => e.currentTarget.style.background = P.bg2}>
                  7 Gün Bekle (Önerilen)
                </button>
                <button onClick={() => { toast.info('🏦 Apple Store taksitli ödeme sayfasına yönlendiriliyorsunuz...'); setTimeout(() => navigate(-1), 1500); }} style={{ flex: 1, padding: '16px', borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', border: 'none', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <ShieldCheck size={18} /> Al (6 Taksit)
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
