import { useState, useMemo } from 'react';
import { Clock, TrendingUp, AlertTriangle, Calculator } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSupabaseData } from '../hooks/useSupabaseData';

const P = {
  purple: '#7C3AED', purpleLight: '#A78BFA', purpleGlow: 'rgba(124,58,237,0.35)',
  green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg0: 'var(--bg-main)', bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)',
};

const TOXIC_CATEGORIES = ['Dışarıda Yemek', 'Alışveriş', 'Kahve', 'Abonelikler'];

export default function TimeMachinePage() {
  const { transactions } = useSupabaseData();
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(15); // Yıllık getiri oranı % (örneğin hisse senedi/fon)
  const [investSavings, setInvestSavings] = useState(true);

  // Mevcut durum analizi
  const analysis = useMemo(() => {
    if (!transactions || transactions.length === 0) return { monthlySaving: 0, toxicWaste: 0 };
    
    // Son 30 günlük işlemleri al
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    const recentTx = transactions.filter(t => new Date(t.tarih) >= thirtyDaysAgo);
    const gelir = recentTx.filter(t => t.tur === 'gelir').reduce((s, t) => s + Number(t.tutar), 0);
    const gider = recentTx.filter(t => t.tur === 'gider').reduce((s, t) => s + Number(t.tutar), 0);
    const monthlySaving = Math.max(0, gelir - gider);

    const toxicWaste = recentTx.filter(t => TOXIC_CATEGORIES.some(c => t.kategori?.includes(c)) && t.tur === 'gider')
                               .reduce((s, t) => s + Number(t.tutar), 0);

    return { monthlySaving: monthlySaving || 500, toxicWaste: toxicWaste || 200, income: gelir || 10000 };
  }, [transactions]);

  // Gelecek Projeksiyonu
  const chartData = useMemo(() => {
    const data = [];
    let currentWealth = 0;
    let toxicCost = 0;
    
    const monthlyRate = (returnRate / 100) / 12;

    for (let i = 0; i <= years; i++) {
      data.push({
        year: new Date().getFullYear() + i,
        wealth: Math.round(currentWealth),
        lostToToxic: Math.round(toxicCost)
      });

      // 1 Yıl (12 ay) ileri sar
      for (let m = 0; m < 12; m++) {
        if (investSavings) {
          currentWealth = currentWealth * (1 + monthlyRate) + analysis.monthlySaving;
          toxicCost = toxicCost * (1 + monthlyRate) + analysis.toxicWaste;
        } else {
          currentWealth += analysis.monthlySaving;
          toxicCost += analysis.toxicWaste;
        }
      }
    }
    return data;
  }, [years, returnRate, investSavings, analysis]);

  const finalWealth = chartData[chartData.length - 1].wealth;
  const finalToxic = chartData[chartData.length - 1].lostToToxic;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1C2038, #0D0F1E)', border: `1px solid ${P.blue}40`, borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', boxShadow: `0 12px 40px ${P.blue}20` }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: P.blue, filter: 'blur(100px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: P.purple, filter: 'blur(100px)', opacity: 0.2 }} />
        
        <div style={{ zIndex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ background: `${P.blue}20`, padding: '6px 12px', borderRadius: 999, border: `1px solid ${P.blue}40` }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: P.blue, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Otonom Gelecek Simülatörü</span>
            </div>
            <Clock size={16} color={P.blue} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 12 }}>
            Zaman Makinesi 🕰️
          </h1>
          <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, maxWidth: 600 }}>
            Şu anki tasarruf alışkanlıkların ve toksik harcamaların yıllar içinde neye dönüşecek? Gelecekteki finansal ikizinle yüzleşmeye hazır ol.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Controls */}
        <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color={P.purpleLight} /> Simülasyon Parametreleri
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Zaman Çizelgesi (Yıl)
                <span style={{ color: P.purpleLight }}>{years} Yıl İleri</span>
              </label>
              <input type="range" min="1" max="40" value={years} onChange={e => setYears(Number(e.target.value))} style={{ width: '100%', accentColor: P.purple }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: P.text3, marginTop: 4 }}>
                <span>1 Yıl</span><span>40 Yıl</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: P.text2, marginBottom: 12 }}>
                Yıllık Yatırım Getirisi (%)
                <span style={{ color: P.green }}>%{returnRate}</span>
              </label>
              <input type="range" min="0" max="50" value={returnRate} onChange={e => setReturnRate(Number(e.target.value))} style={{ width: '100%', accentColor: P.green }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: P.bg3, borderRadius: 14, border: `1px solid ${P.border}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.text1 }}>Tasarrufu Bileşik Faize Koy</div>
                <div style={{ fontSize: 11, color: P.text3, marginTop: 2 }}>Enflasyon ve fon etkisini simüle eder</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                <input type="checkbox" checked={investSavings} onChange={e => setInvestSavings(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: investSavings ? P.green : P.bg4, transition: '.4s', borderRadius: 34 }}>
                  <span style={{ position: 'absolute', content: '""', height: 16, width: 16, left: investSavings ? 24 : 4, bottom: 4, backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }} />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), transparent)', border: `1px solid ${P.green}40`, borderRadius: 20, padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: P.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={16} /> {years} Yıl Sonraki Servetin
            </div>
            <div style={{ fontSize: 42, fontWeight: 900, color: P.text1, letterSpacing: '-0.03em' }}>
              ₺{new Intl.NumberFormat('tr-TR').format(finalWealth)}
            </div>
            <p style={{ fontSize: 13, color: P.text2, marginTop: 8 }}>
              Şu anki aylık {analysis.monthlySaving}₺ tasarrufun ile elde edilecek.
            </p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), transparent)', border: `1px solid ${P.red}40`, borderRadius: 20, padding: 24, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: P.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} /> Toksik Alışkanlıklarının Maliyeti
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.03em' }}>
              -₺{new Intl.NumberFormat('tr-TR').format(finalToxic)}
            </div>
            <p style={{ fontSize: 13, color: P.text2, marginTop: 8 }}>
              "Dışarıda Kahve" ve benzeri gereksiz harcamaları yatırıma dönüştürseydin bu kadar ekstra paran olacaktı. 
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, height: 400 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, marginBottom: 24 }}>Bileşik Büyüme Projeksiyonu</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P.green} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={P.green} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorToxic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={P.red} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={P.red} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
            <XAxis dataKey="year" stroke={P.text3} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `₺${(v/1000)}k`} stroke={P.text3} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#1C2038', border: `1px solid ${P.border}`, borderRadius: 12, color: P.text1 }}
              formatter={(value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)}
            />
            <Area type="monotone" dataKey="wealth" name="Biriken Servet" stroke={P.green} strokeWidth={3} fillOpacity={1} fill="url(#colorWealth)" />
            <Area type="monotone" dataKey="lostToToxic" name="Kayıp (Toksik Harcamalar)" stroke={P.red} strokeWidth={3} fillOpacity={1} fill="url(#colorToxic)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
