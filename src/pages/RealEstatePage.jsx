import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Home, Calculator, AlertOctagon, CheckCircle2, TrendingDown } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
export default function RealEstatePage() {
  const [housePrice, setHousePrice] = useState(3000000);
  const [downPayment, setDownPayment] = useState(500000);
  const [termMonths, setTermMonths] = useState(120);
  const [interestRate, setInterestRate] = useState(3.20); // Monthly interest rate
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Auto-calculate on input change
  useEffect(() => {
    let isMounted = true;
    setTimeout(() => { if (isMounted) setLoading(true); }, 0);
    const timer = setTimeout(() => {
      if (!isMounted) return;
      const tx = useStore.getState().transactions;
      const monthlyIncome = tx.filter(t => t.tur === 'gelir').reduce((a, b) => a + Number(b.tutar), 0) || 50000;
      
      const principal = housePrice - downPayment;
      const r = interestRate / 100;
      const n = termMonths;
      
      // Amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1]
      let monthlyPayment;
      if (r > 0) {
        monthlyPayment = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        monthlyPayment = principal / n;
      }

      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - principal;
      const dtiRatio = (monthlyPayment / monthlyIncome) * 100;

      // Amortization Schedule
      let remainingPrincipal = principal;
      const schedule = [];
      for (let i = 1; i <= n; i++) {
        if (i === 1 || i % 12 === 0 || i === n) {
          const interestPayment = remainingPrincipal * r;
          const principalPayment = monthlyPayment - interestPayment;
          remainingPrincipal -= principalPayment;
          
          schedule.push({
            month: `${i}. Ay`,
            KalanAnapara: Math.max(0, Math.round(remainingPrincipal)),
            OdenenFaiz: Math.round(interestPayment)
          });
        } else {
          // just compute without adding to chart to save render time
          const interestPayment = remainingPrincipal * r;
          const principalPayment = monthlyPayment - interestPayment;
          remainingPrincipal -= principalPayment;
        }
      }

      // AI Decision Logic
      let decision;
      let message;
      
      if (dtiRatio > 55) {
        decision = 'rejected';
        const requiredDownPayment = housePrice - (((monthlyIncome * 0.40) * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)));
        message = `REDDEDİLDİ: Bu evi almak seni finansal olarak batırır. Aylık taksit (₺${Math.round(monthlyPayment).toLocaleString()}), toplam gelirinin %${Math.round(dtiRatio)}'si! Peşinatı en az ₺${Math.round(requiredDownPayment).toLocaleString()}'ye çıkarana kadar bekle veya daha ucuz bir ev bak.`;
      } else if (dtiRatio > 40) {
        decision = 'warning';
        message = `RİSKLİ BÖLGE: Kredi onaylanabilir ancak taksitler bütçeni çok zorlayacak. Acil durum fonunu tüketme ihtimalin yüksek. Ya vadeyi uzat ya da peşinatı artır.`;
      } else {
        decision = 'approved';
        message = `ONAYLANDI: Finansal sağlığın bu krediyi kaldırmak için yeterli. Aylık taksitler gelirinin %${Math.round(dtiRatio)}'si kadar. Kredi çekmek için uygun bir zaman.`;
      }

      setAnalysis({
        monthlyPayment, totalPayment, totalInterest, principal,
        dtiRatio, monthlyIncome, decision, message, schedule
      });
      setLoading(false);
    }, 500);

    return () => { isMounted = false; clearTimeout(timer); };
  }, [housePrice, downPayment, termMonths, interestRate]);

  return (
    <>
      <style>{`
        input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%; background: ${P.purple}; cursor: pointer; margin-top: -8px; box-shadow: 0 0 10px ${P.purple}80; }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: ${P.bg3}; border-radius: 3px; border: 1px solid ${P.border}; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<Home size={24} />}
          color="#14B8A6"
          title="Ev & Kredi Hesaplayıcı"
          subtitle="Almak istediğiniz evin kredinizi batırıp batırmayacağını yapay zeka analiz etsin."
          badge="AI Gayrimenkul"
        />

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          {/* LEFT: INPUT CONTROLS */}
          <div className="animate-enter" style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calculator size={18} color={P.text2} /> Kredi Parametreleri
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* House Price */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: P.text2 }}>Ev Fiyatı</label>
                    <span style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>{fmt(housePrice)}</span>
                  </div>
                  <input type="range" min={1000000} max={15000000} step={100000} value={housePrice} onChange={e => setHousePrice(Number(e.target.value))} />
                </div>

                {/* Down Payment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: P.text2 }}>Peşinat</label>
                    <span style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>{fmt(downPayment)}</span>
                  </div>
                  <input type="range" min={0} max={housePrice} step={50000} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} />
                  <p style={{ fontSize: 11, color: P.text3, margin: '8px 0 0 0', textAlign: 'right' }}>Peşinat Oranı: %{((downPayment / housePrice) * 100).toFixed(0)}</p>
                </div>

                {/* Term */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: P.text2 }}>Vade (Ay)</label>
                    <span style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>{termMonths} Ay</span>
                  </div>
                  <input type="range" min={12} max={120} step={12} value={termMonths} onChange={e => setTermMonths(Number(e.target.value))} />
                </div>

                {/* Interest Rate */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: P.text2 }}>Aylık Faiz Oranı (%)</label>
                    <span style={{ fontSize: 15, fontWeight: 900, color: P.text1 }}>%{interestRate.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.5} max={6.0} step={0.05} value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AI ANALYSIS & CHART */}
          <div className="animate-enter" style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 24, animationDelay: '0.1s' }}>
            
            {loading || !analysis ? (
              <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                 <div style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${P.purple}30`, borderTopColor: P.purple, animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* AI DECISION BANNER */}
                <div style={{
                  background: analysis.decision === 'rejected' ? 'rgba(239,68,68,0.1)' : analysis.decision === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${analysis.decision === 'rejected' ? 'rgba(239,68,68,0.3)' : analysis.decision === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  borderRadius: 24, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start'
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: analysis.decision === 'rejected' ? P.red : analysis.decision === 'warning' ? P.amber : P.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {analysis.decision === 'rejected' ? <AlertOctagon size={24} color="#fff" /> : analysis.decision === 'warning' ? <AlertOctagon size={24} color="#fff" /> : <CheckCircle2 size={24} color="#fff" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 900, color: P.text1, margin: '0 0 8px' }}>Yapay Zeka Kararı</h3>
                    <p style={{ fontSize: 14, color: P.text2, margin: 0, lineHeight: 1.6, fontWeight: 600 }}>{analysis.message}</p>
                  </div>
                </div>

                {/* FINANCIAL SUMMARY */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Aylık Taksit Tutarı</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(analysis.monthlyPayment)}</p>
                    <p style={{ fontSize: 12, color: analysis.dtiRatio > 50 ? P.red : P.text3, margin: '4px 0 0 0', fontWeight: 600 }}>Maaşınızın %{analysis.dtiRatio.toFixed(1)}'i</p>
                  </div>
                  <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Banka Toplam Geri Ödeme</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: P.red, margin: 0 }}>{fmt(analysis.totalPayment)}</p>
                    <p style={{ fontSize: 12, color: P.text3, margin: '4px 0 0 0' }}>Anapara: {fmt(analysis.principal)}</p>
                  </div>
                </div>

                {/* AMORTIZATION CHART */}
                <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingDown size={18} color={P.text2} /> Amortisman Grafiği
                  </h3>
                  
                  <div style={{ height: 250, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysis.schedule} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={P.purple} stopOpacity={0.5}/>
                            <stop offset="95%" stopColor={P.purple} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                        <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                        <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                          itemStyle={{ color: P.text1, fontWeight: 700 }}
                          formatter={(value) => [fmt(value), 'Kalan Anapara']}
                        />
                        <Area type="monotone" dataKey="KalanAnapara" stroke={P.purple} strokeWidth={3} fillOpacity={1} fill="url(#colorPrincipal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
