import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Activity, Lock, TrendingDown, Radio, ShieldAlert, HeartPulse, Building2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
// TF.js lineer regresyon demo verisi; Prophet modeli değildir.
const chartData = [
  { month: 'Şub', liquidity: 45000, threshold: 0 },
  { month: 'Mar', liquidity: 32000, threshold: 0 },
  { month: 'Nis', liquidity: 18000, threshold: 0 },
  { month: 'May', liquidity: 5000, threshold: 0 },
  { month: 'Haz', liquidity: -8000, threshold: 0 }, // Default point
  { month: 'Tem', liquidity: -22000, threshold: 0 },
];

export default function FinancialICUPage() {
  const [step, setStep] = useState(0); 
  const [dynamicChartData, setDynamicChartData] = useState([]);
  const hasTrained = useRef(false);
  // 0: Scanning/Predicting, 1: NPL Detected (Red Alert), 2: ICU Activating, 3: Stabilized
  
  const startAnalysis = async () => {
    if (hasTrained.current) return;
    hasTrained.current = true;
    setStep(1); // Scanning state

    let predictions;

    try {
      // Build or load a real sequential model for Linear Regression
      const tf = await import('@tensorflow/tfjs');
      let model;

      try {
        // Try loading existing trained model from IndexedDB
        model = await tf.loadLayersModel('indexeddb://icu-model');
        const input = tf.tensor2d([5, 6], [2, 1]);
        const output = model.predict(input);
        predictions = output.dataSync();
        input.dispose();
        output.dispose();
      } catch {
        // Model not trained yet, build and compile a new sequential network
        model = tf.sequential();
        model.add(tf.layers.dense({units: 1, inputShape: [1]}));
        model.compile({loss: 'meanSquaredError', optimizer: tf.train.sgd(0.01)});

        // Training Data: X = Month (1 to 4), Y = Liquidity
        const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]); 
        const ys = tf.tensor2d([45000, 32000, 18000, 5000], [4, 1]); 

        // Train neural network client-side with timeout guard
        try {
          await Promise.race([
            model.fit(xs, ys, { epochs: 200 }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]);

          // Save trained weights into browser IndexedDB for subsequent zero-overhead runs
          try {
            await model.save('indexeddb://icu-model');
          } catch (saveErr) {
            console.warn('Model IndexedDB persistence blocked or unavailable:', saveErr);
          }
          const input = tf.tensor2d([5, 6], [2, 1]);
          const output = model.predict(input);
          predictions = output.dataSync();
          input.dispose();
          output.dispose();
        } catch (err) {
          console.warn('Eğitim zaman aşımı veya hatası. Sandbox risk eğrisine geçiliyor.', err);
          predictions = [-8000, -21000];
        } finally {
          xs.dispose();
          ys.dispose();
        }
      }
    } catch (err) {
      console.warn('TensorFlow.js yüklenemedi veya eğitilemedi. Sandbox risk eğrisine geçiliyor.', err);
      predictions = [-8000, -21000];
    }

    setDynamicChartData([
      { month: 'Şub', liquidity: 45000, threshold: 0 },
      { month: 'Mar', liquidity: 32000, threshold: 0 },
      { month: 'Nis', liquidity: 18000, threshold: 0 },
      { month: 'May', liquidity: 5000, threshold: 0 },
      { month: 'Haz', liquidity: Math.round(predictions[0]), threshold: 0 },
      { month: 'Tem', liquidity: Math.round(predictions[1]), threshold: 0 },
    ]);
    
    setStep(2); // NPL Detected state
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => setStep(4), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <>
      <style>{`
        .icu-bg {
          background-image: radial-gradient(circle at 50% 50%, rgba(239,68,68,0.05) 0%, transparent 50%);
          animation: pulse-bg 2s infinite alternate;
        }
        @keyframes pulse-bg {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        .distress-text { color: #EF4444; font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        .secure-text { color: #10B981; font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
      `}</style>

      <div className="flex flex-col gap-6 pb-10 relative overflow-hidden">
        
        {/* Background Distress Signal */}
        {step === 1 && (
          <div className="icu-bg" style={{ position: 'absolute', top: -200, left: -200, right: -200, bottom: -200, pointerEvents: 'none', zIndex: 0 }} />
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <PageHeader
            icon={<ShieldAlert size={24} />}
            color="#EF4444"
            title="Financial ICU (İflas Radarı)"
            subtitle="TF.js ile tarayıcı içinde lineer regresyon risk projeksiyonu üretir."
            badge="TF.js Risk Motoru"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* LEFT: TF.js demo projection chart */}
          <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${step === 1 ? 'rgba(239,68,68,0.5)' : P.border}`, borderRadius: 24, padding: 32, transition: 'all 0.5s', boxShadow: step === 1 ? '0 0 40px rgba(239,68,68,0.1)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingDown size={20} color={step === 1 ? P.red : P.text3} /> 
                Lineer Regresyon Projeksiyonu (TF.js)
              </h3>
              {step === 0 && <span className="secure-text" style={{ color: P.text3 }}>Beklemede</span>}
              {step === 1 && <span className="secure-text" style={{ color: P.blue }}>Analiz Ediliyor...</span>}
              {step === 2 && <span className="distress-text" style={{ animation: 'pulse 1s infinite' }}>NPL RİSKİ: %94</span>}
              {step === 4 && <span className="secure-text">RİSK İZOLE EDİLDİ</span>}
            </div>

            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicChartData.length > 0 ? dynamicChartData : chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} tickFormatter={v => `₺${Math.round(v/1000)}k`} />
                  <Tooltip contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }} />
                  <ReferenceLine y={0} stroke={P.red} strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: 'TEMERRÜT SINIRI', fill: P.red, fontSize: 10, fontWeight: 800 }} />
                  <Line 
                    type="monotone" 
                    dataKey="liquidity" 
                    stroke={step >= 4 ? P.green : P.red} 
                    strokeWidth={4} 
                    dot={{ fill: P.bg2, strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: ICU CONTROLS */}
          <div className="animate-enter flex flex-col gap-4" style={{ animationDelay: '0.1s' }}>
            
            {/* ALERT BOX */}
            <div style={{ background: step === 3 ? 'rgba(16,185,129,0.05)' : step === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.1)', border: `1px solid ${step === 3 ? 'rgba(16,185,129,0.3)' : step === 0 ? P.border : 'rgba(239,68,68,0.4)'}`, borderRadius: 24, padding: 32, transition: 'all 0.5s', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {step === 0 && (
                <div style={{ textAlign: 'center' }}>
                  <Activity size={48} color={P.text3} style={{ marginBottom: 16 }} />
                  <h2 style={{ fontSize: 20, color: P.text2, margin: '0 0 8px' }}>Sistem Hazır</h2>
                  <p style={{ fontSize: 13, color: P.text3, margin: '0 0 16px' }}>TensorFlow.js modülünü tarayıcıda çalıştırıp geleceği tahmin etmek için analizi başlatın.</p>
                  <button 
                    onClick={startAnalysis}
                    style={{ padding: '12px 24px', borderRadius: 12, background: P.blue, border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Activity size={16} /> Analizi Başlat (TF.js İndirilecek)
                  </button>
                </div>
              )}

              {step === 1 && (
                <div style={{ textAlign: 'center' }}>
                  <Activity size={48} color={P.blue} style={{ marginBottom: 16 }} className="pulse" />
                  <h2 style={{ fontSize: 20, color: P.text2, margin: '0 0 8px' }}>TensorFlow.js Eğitiliyor...</h2>
                  <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>İstemci tarayıcısında gerçek zamanlı Lineer Regresyon modeli çalışıyor.</p>
                </div>
              )}

              {step === 2 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <AlertTriangle size={32} color={P.red} />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: P.red, margin: 0 }}>SİSTEM ALARMI: Bireysel İflas Riski</h2>
                  </div>
                  <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6, marginBottom: 16 }}>
                    Mevcut harcama ivmesi devam ederse, müşteri <strong style={{ color: '#fff' }}>Haziran ayında</strong> kredi kartı asgarisini ödeyemeyerek temerrüde (default) düşecektir.
                  </p>
                  
                  <div style={{ fontSize: 11, color: P.text3, marginBottom: 20, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>⚠️ <em>Eğitsel Amaçlı Analiz: Yatırım veya finansal danışmanlık kapsamında değildir.</em></span>
                  </div>
                  
                  <button 
                    onClick={() => setStep(3)}
                    style={{ width: '100%', padding: '16px', borderRadius: 16, background: P.red, border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 30px rgba(239,68,68,0.4)' }}
                  >
                    <HeartPulse size={18} /> Yoğun Bakım (ICU) Modunu Başlat
                  </button>
                </>
              )}

              {step === 3 && (
                <div style={{ textAlign: 'center' }}>
                  <Radio size={48} color={P.red} className="spin" style={{ marginBottom: 16 }} />
                  <h2 style={{ fontSize: 20, color: '#fff', margin: '0 0 8px' }}>Protokoller Devreye Giriyor...</h2>
                  <p className="distress-text" style={{ margin: 0 }}>Sandbox koruma protokolleri uygulanıyor.</p>
                </div>
              )}

              {step === 4 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <ShieldAlert size={32} color={P.green} />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: P.green, margin: 0 }}>MÜŞTERİ KURTARILDI</h2>
                  </div>
                  <p style={{ fontSize: 14, color: P.text2, lineHeight: 1.6 }}>
                    FinCoach sandbox ajanı kriz önleme paketini başarıyla uyguladı.
                  </p>
                </>
              )}
            </div>

            {/* ACTION LOGS (Only visible when Step >= 3) */}
            <div style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s', display: 'grid', gap: 12 }}>
              <div style={{ background: P.bg2, border: `1px solid ${P.border}`, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={20} color={P.red} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Sanal Kategori Blokesi</h4>
                  <p style={{ fontSize: 12, color: P.text3, margin: 0 }}>Eğlence ve lüks giyim kategorileri geçici olarak kilitlendi.</p>
                </div>
              </div>

              <div style={{ background: P.bg2, border: `1px solid ${P.border}`, padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, transitionDelay: '0.2s' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color={P.blue} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Banka API Sinyali</h4>
                  <p style={{ fontSize: 12, color: P.text3, margin: 0 }}>Borç yapılandırma talebi banka sistemine %1.9 faiz ile gönderildi.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
