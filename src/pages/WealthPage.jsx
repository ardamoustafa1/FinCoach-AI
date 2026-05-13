import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Briefcase, Landmark, ShieldCheck, Activity, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { getTransactions } from '../utils/storage';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const PORTFOLIO_PROFILES = {
  conservative: {
    name: 'Muhafazakar Profil',
    desc: 'Düşük risk toleransı. Sermaye koruması ön plandadır.',
    allocation: [
      { name: 'Mevduat / Tahvil', value: 60, color: P.blue },
      { name: 'Fiziki Altın', value: 30, color: P.amber },
      { name: 'Büyük Ölçekli Hisse', value: 10, color: P.purple }
    ],
    expectedReturn: 35 // %35
  },
  balanced: {
    name: 'Dengeli Profil',
    desc: 'Orta risk toleransı. Büyüme ve koruma arasında denge.',
    allocation: [
      { name: 'Hisse Senedi (BIST 30)', value: 40, color: P.purple },
      { name: 'Mevduat / Eurobond', value: 35, color: P.blue },
      { name: 'Değerli Maden (Altın)', value: 25, color: P.amber }
    ],
    expectedReturn: 55 // %55
  },
  aggressive: {
    name: 'Agresif Büyüme Profili',
    desc: 'Yüksek risk toleransı. Maksimum getiri odaklı.',
    allocation: [
      { name: 'Teknoloji & Büyüme Hisseleri', value: 65, color: P.purple },
      { name: 'Kripto Varlıklar', value: 20, color: P.red },
      { name: 'Yabancı Hisse Fonları', value: 15, color: P.blue }
    ],
    expectedReturn: 85 // %85
  }
};

export default function WealthPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Kurumsal Risk Profili Analizi (Algorithmic Wealth Management)
    const tx = getTransactions();
    
    setTimeout(() => {
      // 1. Harcama Volatilitesi Hesaplama (Mocked for logic)
      const expenses = tx.filter(t => t.tur === 'gider').map(t => Number(t.tutar));
      const avgExpense = expenses.reduce((a, b) => a + b, 0) / (expenses.length || 1);
      
      // Variance calculation
      const variance = expenses.reduce((a, b) => a + Math.pow(b - avgExpense, 2), 0) / (expenses.length || 1);
      const volatility = Math.sqrt(variance) / (avgExpense || 1); // Coefficient of Variation
      
      // 2. Acil Durum Fonu Oranı
      const totalIncome = tx.filter(t => t.tur === 'gelir').reduce((a, b) => a + Number(b.tutar), 0) || 50000;
      const totalExpense = avgExpense * (expenses.length || 1) || 30000;
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      const emergencyFund = 120000; // Mocked

      // 3. Risk Tolerans Skoru Belirleme (0-100)
      // Yüksek tasarruf ve yüksek acil fon = Daha fazla risk alabilir.
      // Yüksek harcama volatilitesi = Düşük risk almalı.
      let riskScore = 50;
      if (savingsRate > 25) riskScore += 20;
      if (emergencyFund > totalExpense * 6) riskScore += 15;
      if (volatility > 0.8) riskScore -= 20; // Düzensiz harcaması olan risk alamaz

      let activeProfileKey = 'balanced';
      if (riskScore > 70) activeProfileKey = 'aggressive';
      if (riskScore < 40) activeProfileKey = 'conservative';

      setMetrics({
        riskScore: Math.round(Math.min(100, Math.max(0, riskScore))),
        volatility: (volatility * 100).toFixed(1),
        savingsRate: savingsRate.toFixed(1),
        emergencyFundMonths: (emergencyFund / (totalExpense || 1)).toFixed(1)
      });
      setProfile(PORTFOLIO_PROFILES[activeProfileKey]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.purple}30`, borderTopColor: P.purple, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Harcama volatilitesi ve risk toleransı analiz ediliyor...</p>
      </div>
    );
  }

  // 5 Yıllık Projeksiyon Verisi
  const projectionData = [1, 2, 3, 4, 5].map(year => {
    const baseSavings = 100000; // Başlangıç
    const annualAddition = 50000; // Yıllık eklenen
    // Standart Mevduat Getirisi (Örn %20)
    const standardReturn = baseSavings * Math.pow(1.20, year) + annualAddition * ((Math.pow(1.20, year) - 1) / 0.20);
    // AI Portföy Getirisi
    const aiReturnRate = 1 + (profile.expectedReturn / 100);
    const aiReturn = baseSavings * Math.pow(aiReturnRate, year) + annualAddition * ((Math.pow(aiReturnRate, year) - 1) / (profile.expectedReturn / 100));

    return {
      year: `${year}. Yıl`,
      Mevduat: Math.round(standardReturn),
      'Yapay Zeka Portföyü': Math.round(aiReturn)
    };
  });

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(59,130,246,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Landmark size={20} color={P.purple} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.purple }}>AI Wealth Management</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Varlık Yönetimi ve Risk Profili
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
              FinCoach AI, harcama alışkanlıklarınızı ve finansal dayanıklılığınızı analiz ederek size en uygun algoritmik yatırım stratejisini sunar.
            </p>
          </div>
        </div>

        {/* RISK ANALYSIS RESULTS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          {[
            { label: 'Risk Tolerans Skoru', value: `${metrics.riskScore} / 100`, icon: Target, color: metrics.riskScore > 60 ? P.purple : P.blue },
            { label: 'Harcama Volatilitesi', value: `%${metrics.volatility}`, icon: Activity, color: metrics.volatility > 60 ? P.red : P.green, desc: 'Aylık gider dalgalanması' },
            { label: 'Tasarruf Oranı', value: `%${metrics.savingsRate}`, icon: TrendingUp, color: metrics.savingsRate > 20 ? P.green : P.amber },
            { label: 'Nakit Tamponu', value: `${metrics.emergencyFundMonths} Ay`, icon: ShieldCheck, color: metrics.emergencyFundMonths > 3 ? P.green : P.red, desc: 'Acil durum fonu yeterliliği' }
          ].map((m, i) => (
            <div key={i} style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>{m.label}</span>
                <m.icon size={18} color={m.color} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color: m.color, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{m.value}</p>
              {m.desc && <p style={{ fontSize: 11, color: P.text3, margin: 0 }}>{m.desc}</p>}
            </div>
          ))}
        </div>

        {/* PORTFOLIO DISTRIBUTION */}
        <div className="animate-enter" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', animationDelay: '0.2s', opacity: 0 }}>
          
          <div style={{ flex: '1 1 350px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 24px' }}>AI Önerilen Portföy Dağılımı</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 180, height: 180, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={profile.allocation} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                      {profile.allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }} itemStyle={{ color: P.text1, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{profile.name}</h4>
                  <p style={{ fontSize: 12, color: P.text3, margin: 0 }}>{profile.desc}</p>
                </div>
                {profile.allocation.map(a => (
                  <div key={a.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color }} />
                      <span style={{ fontSize: 13, color: P.text2, fontWeight: 600 }}>{a.name}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: P.text1 }}>%{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 450px', background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>5 Yıllık Getiri Projeksiyonu</h3>
            <p style={{ fontSize: 13, color: P.text3, margin: '0 0 24px' }}>Standart mevduata karşı AI destekli portföyün bileşik büyümesi.</p>
            
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis dataKey="year" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }} />
                  <Bar dataKey="Mevduat" fill={P.bg3} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Yapay Zeka Portföyü" fill={P.purple} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
