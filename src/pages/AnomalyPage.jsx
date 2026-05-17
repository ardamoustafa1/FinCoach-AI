import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { ShieldAlert, Clock, Lock, CheckCircle2, Search } from 'lucide-react';
import { fmt } from '../utils/categories';
import PageHeader, { PageLoader } from '../components/PageHeader';

import { P } from '../styles/palette';
// Generates normal transactions + anomalies to simulate Isolation Forest clustering
function generateTransactions() {
  const data = [];
  
  // Normal Cluster 1: Morning Coffee & Commute (07:00 - 10:00, 30₺ - 150₺)
  for(let i=0; i<30; i++) {
    data.push({
      id: `tx-n1-${i}`, hour: 7 + Math.random() * 3, amount: 30 + Math.random() * 120, isAnomaly: false, desc: 'Sabah Rutini'
    });
  }
  
  // Normal Cluster 2: Lunch & Shopping (12:00 - 16:00, 100₺ - 400₺)
  for(let i=0; i<40; i++) {
    data.push({
      id: `tx-n2-${i}`, hour: 12 + Math.random() * 4, amount: 100 + Math.random() * 300, isAnomaly: false, desc: 'Öğle / Market'
    });
  }

  // Normal Cluster 3: Dinner (18:00 - 22:00, 200₺ - 600₺)
  for(let i=0; i<30; i++) {
    data.push({
      id: `tx-n3-${i}`, hour: 18 + Math.random() * 4, amount: 200 + Math.random() * 400, isAnomaly: false, desc: 'Akşam Yemeği'
    });
  }

  // ANOMALY 1: Late Night, Low Amount (Fraud test)
  data.push({ id: 'a1', hour: 3.5, amount: 120, isAnomaly: true, desc: 'Steam Games (Londra)', reason: 'Alışılmadık Saat (03:30) & Yabancı Lokasyon' });
  
  // ANOMALY 2: High Amount, Normal Time
  data.push({ id: 'a2', hour: 14.2, amount: 8500, isAnomaly: true, desc: 'Apple Store (Web)', reason: 'Standart Sapmanın 12x Üzerinde Tutar' });
  
  // ANOMALY 3: Mid Night, High Amount
  data.push({ id: 'a3', hour: 4.1, amount: 4200, isAnomaly: true, desc: 'Kripto Borsa Transferi', reason: 'Olağandışı Saat + Yüksek Tutar + Yeni Alıcı' });

  return data;
}

export default function AnomalyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [walletLocked, setWalletLocked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      const txData = generateTransactions();
      setData(txData);
      setAnomalies(txData.filter(t => t.isAnomaly));
      setLoading(false);
    }, 1200); // simulate ML processing
    return () => { isMounted = false; };
  }, []);

  const handleLock = () => {
    setWalletLocked(true);
    setTimeout(() => setWalletLocked(false), 3000); // auto unlock for demo
  };

  if (loading || data.length === 0) return <PageLoader message="Unsupervised ML: Isolation Forest modeli eğitiliyor..." />;

  return (
    <>
      <style>{`
        .pulse-red { animation: pulseRed 2s infinite; }
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}</style>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<ShieldAlert size={24} />}
          color={P.red}
          title="Anomali Tespiti"
          subtitle="Gözetimsiz Makine Öğrenmesi (Isolation Forest) ile aykırı harcamaları saniyesinde yakalayın."
          badge="Fraud Detection"
        >
          <button 
            onClick={handleLock}
            disabled={walletLocked}
            className={!walletLocked ? 'pulse-red' : ''}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, border: 'none',
              background: walletLocked ? P.bg3 : `linear-gradient(135deg, ${P.red}, #B91C1C)`, color: walletLocked ? P.text3 : '#fff',
              fontSize: 13, fontWeight: 800, cursor: walletLocked ? 'not-allowed' : 'pointer',
              boxShadow: walletLocked ? 'none' : `0 8px 20px rgba(239,68,68,0.3)`, transition: 'all 0.2s'
            }}
          >
            {walletLocked ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            {walletLocked ? 'Cüzdan Kilitli' : 'Cüzdanı Kilitle'}
          </button>
        </PageHeader>

        {walletLocked && (
          <div className="animate-enter" style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${P.red}`, padding: 20, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, color: P.red }}>
             <ShieldAlert size={24} />
             <div>
               <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Tüm İşlemler Donduruldu</h4>
               <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Cüzdanınız siber saldırı ve çalınma ihtimaline karşı geçici olarak kilitlendi. 3 saniye sonra demo modunda açılacaktır.</p>
             </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* ISOLATION FOREST SCATTER CHART */}
          <div className="animate-enter" style={{ flex: '1 1 500px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Harcama Paternleri Kümelemesi</h3>
                <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Mavi noktalar rutinleriniz. Kırmızı noktalar algoritmanın izole ettiği anomaliler.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: P.blue }} /> <span style={{ fontSize: 12, color: P.text2 }}>Normal</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: P.red }} /> <span style={{ fontSize: 12, color: P.text2 }}>Anomali</span></div>
              </div>
            </div>
            
            <div style={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis type="number" dataKey="hour" name="Saat" unit=":00" domain={[0, 24]} ticks={[0,4,8,12,16,20,24]} stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis type="number" dataKey="amount" name="Tutar" unit=" ₺" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} tickFormatter={v => v > 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                  <ZAxis range={[60, 400]} />
                  <RechartsTooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: P.text3 }}
                    contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                    itemStyle={{ color: P.text1, fontWeight: 700 }}
                    formatter={(val, name) => [name === 'hour' ? `${val.toFixed(1)}` : fmt(val), name === 'hour' ? 'Saat' : 'Tutar']}
                  />
                  <Scatter name="İşlemler" data={data}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isAnomaly ? P.red : P.blue} fillOpacity={entry.isAnomaly ? 1 : 0.4} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DETECTED ANOMALIES LIST */}
          <div className="animate-enter" style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: 16, animationDelay: '0.2s' }}>
            <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, flex: 1 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                 <Search size={20} color={P.red} /> Şüpheli İşlemler ({anomalies.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {anomalies.map(anomaly => (
                  <div key={anomaly.id} style={{ 
                    background: 'rgba(239,68,68,0.05)', border: `1px solid rgba(239,68,68,0.2)`, 
                    borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' 
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: P.red }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{anomaly.desc}</h4>
                        <p style={{ fontSize: 12, color: P.text3, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> Saat: {Math.floor(anomaly.hour)}:{(anomaly.hour % 1 * 60).toFixed(0).padStart(2,'0')}
                        </p>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 900, color: P.red }}>{fmt(anomaly.amount)}</span>
                    </div>
                    <div style={{ background: P.bg0, padding: '8px 12px', borderRadius: 8, marginTop: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: P.text2, margin: '0 0 4px', textTransform: 'uppercase' }}>ML Tespit Nedeni:</p>
                      <p style={{ fontSize: 12, color: P.amber, margin: 0, fontWeight: 600 }}>{anomaly.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
