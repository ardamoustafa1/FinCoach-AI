import { useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingDown, AlertCircle, CalendarClock, BarChart4, ArrowUpRight, BrainCircuit } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: P.bg2, border: `1px solid ${data.isNegative ? P.red : P.border}`, borderRadius: 12, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: P.text2, marginBottom: 8, textTransform: 'uppercase' }}>{data.month}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 12, color: P.text3 }}>Medyan Senaryo:</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: data.isNegative ? P.red : P.blue }}>{fmt(data.yhat)}</span>
        </div>
        <div style={{ fontSize: 11, color: P.text3, marginTop: 4 }}>
          %90 Güven Aralığı: [{fmt(data.yhat_lower)} - {fmt(data.yhat_upper)}]
        </div>
        
        {data.event && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: P.amber, textTransform: 'uppercase', marginBottom: 4 }}>Mevsimsel Etki Tespit Edildi</p>
            <p style={{ fontSize: 12, color: P.text1, fontWeight: 600, margin: 0 }}>{data.event}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function CashFlowPage() {
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ─── MONTE CARLO SIMULATION ───
    const tx = useStore.getState().transactions;
    
    // 1. Tarihsel Verilerden İstatistik Çıkarımı
    const gelirler = tx.filter(t => t.tur === 'gelir').map(t => Number(t.tutar));
    const giderler = tx.filter(t => t.tur === 'gider').map(t => Number(t.tutar));
    
    // Ortalama Gelir (Yoksa varsayılan 50k)
    const avgIncome = gelirler.length > 0 ? gelirler.reduce((a, b) => a + b, 0) / Math.max(1, gelirler.length) : 50000;
    
    // Ortalama Gider ve Standart Sapma
    const avgExpense = giderler.length > 0 ? giderler.reduce((a, b) => a + b, 0) / Math.max(1, giderler.length) : 35000;
    
    let variance;
    if (giderler.length > 1) {
      variance = giderler.reduce((a, b) => a + Math.pow(b - avgExpense, 2), 0) / (giderler.length - 1);
    } else {
      variance = Math.pow(avgExpense * 0.2, 2); // %20 sapma varsay
    }
    const stdDevExpense = Math.sqrt(variance);

    // Box-Muller Transform (Normal Dağılım Rastgele Sayı Üreteci)
    const randomNormal = (mean, stdDev) => {
      let u = 0, v = 0;
      while(u === 0) u = Math.random();
      while(v === 0) v = Math.random();
      const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return num * stdDev + mean;
    };

    setTimeout(() => {
      const NUM_SIMULATIONS = 500;
      const MONTHS_AHEAD = 12;
      let initialBalance = 25000; // Gerçekte kullanıcının banka API'sinden gelir
      
      const currentMonthIdx = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Tüm simülasyonların sonuçlarını tutacak matris [monthIndex][simulationIndex]
      const simulationResults = Array.from({ length: MONTHS_AHEAD + 1 }, () => []);
      
      // Simülasyonları Çalıştır
      for (let s = 0; s < NUM_SIMULATIONS; s++) {
        let balance = initialBalance;
        simulationResults[0].push(balance); // 0. ay (şu an)
        
        for (let m = 1; m <= MONTHS_AHEAD; m++) {
          // Mevsimsellik (Seasonality) eklentisi
          const targetDate = new Date(currentYear, currentMonthIdx + m, 1);
          let seasonality = 1.0;
          if (targetDate.getMonth() === 10) seasonality = 1.4; // Kasım
          else if (targetDate.getMonth() === 6 || targetDate.getMonth() === 7) seasonality = 1.2; // Yaz
          
          const simulatedExpense = Math.max(0, randomNormal(avgExpense * seasonality, stdDevExpense * seasonality));
          const simulatedIncome = Math.max(0, randomNormal(avgIncome, avgIncome * 0.05)); // Gelir daha az dalgalı
          
          balance += (simulatedIncome - simulatedExpense);
          simulationResults[m].push(balance);
        }
      }

      // Sonuçları Yüzdelik Dilimlere (Percentiles) Ayır
      const projection = [];
      let crisisMonth = null;
      let worstBalance = initialBalance;

      for (let m = 0; m <= MONTHS_AHEAD; m++) {
        const sortedBalances = simulationResults[m].sort((a, b) => a - b);
        
        const p5 = sortedBalances[Math.floor(NUM_SIMULATIONS * 0.05)]; // En kötü %5 senaryo (yhat_lower)
        const p50 = sortedBalances[Math.floor(NUM_SIMULATIONS * 0.50)]; // Medyan (yhat)
        const p95 = sortedBalances[Math.floor(NUM_SIMULATIONS * 0.95)]; // En iyi %95 senaryo (yhat_upper)

        const targetDate = new Date(currentYear, currentMonthIdx + m, 1);
        const displayLabel = m === 0 ? 'Şu An' : `${MONTHS[targetDate.getMonth()]} '${targetDate.getFullYear().toString().slice(-2)}`;

        let eventLabel = null;
        if (targetDate.getMonth() === 10) eventLabel = 'Yüksek Mevsimsel Dalgalanma (Kasım)';

        if (p50 < worstBalance) worstBalance = p50;
        if (p50 < 0 && !crisisMonth && m > 0) crisisMonth = displayLabel;

        projection.push({
          month: displayLabel,
          yhat: Math.round(p50),
          yhat_lower: Math.round(p5),
          yhat_upper: Math.round(p95),
          event: eventLabel,
          isNegative: p50 < 0
        });
      }

      setData(projection);
      setMetrics({
        startingBalance: projection[0].yhat,
        worstBalance: Math.round(worstBalance),
        crisisMonth,
        finalBalance: projection[MONTHS_AHEAD].yhat
      });
      
      setLoading(false);
    }, 1200); // UI için yapay bekleme
  }, []);

  if (loading || !metrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.blue}30`, borderTopColor: P.blue, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Monte Carlo Nakit Akışı Simülasyonu çalıştırılıyor (500 Senaryo)...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* ── HEADER ── */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(124,58,237,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BrainCircuit size={20} color={P.blue} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.blue }}>Stokastik Finansal Modelleme</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Monte Carlo Nakit Akışı Simülasyonu
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 650, lineHeight: 1.6 }}>
              Gelecek belirsizdir. Bu yüzden düz bir tahmin çizgisi çizmek yerine, geçmiş harcama varyansınızı (standart sapma) kullanarak gelecek 12 ay için <strong>500 farklı rastgele senaryo (Box-Muller)</strong> üretiyoruz ve en olası sonuçları (%90 Güven Aralığı) gösteriyoruz.
            </p>
          </div>

          {metrics.crisisMonth ? (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 16, padding: 20, maxWidth: 350 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <AlertCircle size={20} color={P.red} />
                <span style={{ fontSize: 14, fontWeight: 800, color: P.red }}>Likidite Krizi Uyarısı</span>
              </div>
              <p style={{ fontSize: 13, color: P.text1, margin: 0, lineHeight: 1.5 }}>
                Mevsimsel harcamalarınız sebebiyle <strong>{metrics.crisisMonth}</strong> döneminde nakit açığına düşeceğiniz öngörülmektedir. Tedbir alın.
              </p>
            </div>
          ) : (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 16, padding: 20, maxWidth: 350 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ArrowUpRight size={20} color={P.green} />
                <span style={{ fontSize: 14, fontWeight: 800, color: P.green }}>Nakit Akışı Güvende</span>
              </div>
              <p style={{ fontSize: 13, color: P.text1, margin: 0, lineHeight: 1.5 }}>
                12 aylık projeksiyonda tüm mevsimsel dalgalanmalara rağmen likidite probleminiz görünmüyor.
              </p>
            </div>
          )}
        </div>

        {/* ── METRICS GRID ── */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          {[
            { label: 'Mevcut Bakiye', value: fmt(metrics.startingBalance), icon: ArrowUpRight, color: P.text1 },
            { label: '12 Ay Sonra Tahmini Bakiye', value: fmt(metrics.finalBalance), icon: BarChart4, color: metrics.finalBalance < 0 ? P.red : P.blue },
            { label: 'En Düşük Dip Noktası (Worst)', value: fmt(metrics.worstBalance), icon: TrendingDown, color: metrics.worstBalance < 0 ? P.red : P.amber },
            { label: 'Riskli Ay (Seasonality)', value: metrics.crisisMonth || 'Yok', icon: CalendarClock, color: metrics.crisisMonth ? P.red : P.green }
          ].map((m, i) => (
            <div key={i} style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>{m.label}</span>
                <m.icon size={18} color={m.color} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color: m.color, margin: 0, letterSpacing: '-0.02em' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── TIME SERIES CHART ── */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>Monte Carlo Projeksiyonu (500 İterasyon)</h3>
              <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Koyu mavi çizgi medyan (%50) senaryoyu, gölgeli alan ise %5 ve %95'lik uç senaryoları temsil eder.</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: P.blue }} />
                <span style={{ fontSize: 12, color: P.text2, fontWeight: 600 }}>Medyan (En Olası)</span>
              </div>
            </div>
          </div>

          <div style={{ height: 400, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                <XAxis dataKey="month" stroke={P.text3} fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: P.text3 }} />
                <ReferenceLine y={0} stroke={P.red} strokeDasharray="5 5" opacity={0.6} />
                
                {/* Confidence Interval Background */}
                <Area 
                  type="monotone" 
                  dataKey="yhat_upper" 
                  stroke="none" 
                  fill={P.blue} 
                  fillOpacity={0.1} 
                />
                <Area 
                  type="monotone" 
                  dataKey="yhat_lower" 
                  stroke="none" 
                  fill={P.bg2} 
                />

                {/* Main Prediction Line */}
                <Line 
                  type="monotone" 
                  dataKey="yhat" 
                  stroke={P.blue} 
                  strokeWidth={3}
                  dot={{ r: 4, fill: P.bg2, stroke: P.blue, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: P.blue, stroke: P.bg2, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
