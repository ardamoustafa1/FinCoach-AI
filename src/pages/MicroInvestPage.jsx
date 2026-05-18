import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, ArrowRight, Zap, RefreshCw, Layers, Terminal, Activity } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';
import PageHeader from '../components/PageHeader';

import { P } from '../styles/palette';
export default function MicroInvestPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Real-time Yield States
  const [liveYield, setLiveYield] = useState(0);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      const tx = (useStore.getState().transactions || []).filter(t => t.tur === 'gider').slice(0, 50);
      
      let totalSpareChange = 0;
      const recentRounds = [];

      tx.forEach(t => {
        const amount = Number(t.tutar);
        const rounded = Math.ceil(amount / 100) * 100;
        const spareChange = rounded - amount;
        
        if (spareChange > 0 && spareChange < 100) {
          totalSpareChange += spareChange;
          if (recentRounds.length < 5) {
            recentRounds.push({
              magaza: t.magaza || t.aciklama,
              amount: amount,
              rounded: rounded,
              change: spareChange
            });
          }
        }
      });

      const monthlySpareChange = totalSpareChange * (30 / (tx.length || 1));
      const annualProjection = monthlySpareChange * 12;
      const investedValue = annualProjection * 1.25; // DeFi yields

      let projectionSeries = [];
      let currentAmount = 0;
      for(let i=0; i<=12; i++) {
        projectionSeries.push({
          month: i === 0 ? 'Bugün' : i + '. Ay',
          birikim: Math.round(currentAmount)
        });
        currentAmount += monthlySpareChange * 1.02; // Monthly DeFi compounding
      }

      if (isMounted) {
        setData({ totalSpareChange, recentRounds, monthlySpareChange, annualProjection, investedValue });
        setChartData(projectionSeries);
        const saved = localStorage.getItem('fincoach_live_yield');
        setLiveYield(saved && Number(saved) > totalSpareChange ? Number(saved) : totalSpareChange);
        setLoading(false);
      }
    }, 800);

    return () => { isMounted = false; };
  }, []);

  // Real-time Yield Ticker
  useEffect(() => {
    if (loading || !data) return;
    
    // Increment balance slightly every 50ms to simulate live DeFi yields
    const yieldInterval = setInterval(() => {
      setLiveYield(prev => {
        const next = prev + 0.000134;
        localStorage.setItem('fincoach_live_yield', next.toString());
        return next;
      }); 
    }, 50);

    return () => clearInterval(yieldInterval);
  }, [loading, data]);

  // Terminal Logs Animation
  useEffect(() => {
    if (loading) return;

    const protocols = ['FinCoach Vault', 'Round-up Pool', 'Stable Yield Sandbox', 'Risk Guard', 'Auto Compound'];
    const actions = ['Routing', 'Swapping', 'Staking', 'Compounding'];
    const assets = ['USDC', 'ETH', 'DAI', 'USDT'];

    const addLog = () => {
      const p = protocols[Math.floor(Math.random() * protocols.length)];
      const a = actions[Math.floor(Math.random() * actions.length)];
      const t = assets[Math.floor(Math.random() * assets.length)];
      const amt = (Math.random() * 5 + 0.5).toFixed(2);
      const apy = (Math.random() * 12 + 4).toFixed(2);
      const hash = '0x' + Math.random().toString(16).substring(2, 10) + '...';

      setLogs(prev => {
        const newLogs = [...prev, `[${new Date().toISOString().split('T')[1].slice(0,8)}] ${a} ${amt} ${t} to ${p} (APY: ${apy}%) - Tx: ${hash}`];
        return newLogs.slice(-6); // Keep last 6 logs
      });
    };

    // Add initial logs quickly
    addLog();
    setTimeout(addLog, 400);
    setTimeout(addLog, 900);

    // Then random intervals
    const logInterval = setInterval(() => {
      addLog();
    }, 2500);

    return () => clearInterval(logInterval);
  }, [loading]);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.green}30`, borderTopColor: P.green, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>Smart Contractlar Bağlanıyor...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .matrix-bg {
          background-image: radial-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        @keyframes dataStream { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
        
        .yield-text {
          background: linear-gradient(to right, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

        {/* HEADER */}
        <PageHeader
          icon={<Layers size={24} />}
          color={P.green}
          title="Küsürat Kumbarası"
          subtitle="Her harcamanızdan arta kalan küsüratlar sandbox yatırım havuzunda izlenir ve bileşik getiriyle projekte edilir."
          badge="Sandbox Yield"
        />

        {/* LIVE YIELD DASHBOARD */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, animationDelay: '0.1s' }}>
          
          <div style={{ background: '#0a0a0f', border: `1px solid ${P.green}`, borderRadius: 24, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(16,185,129,0.1)', position: 'relative', overflow: 'hidden' }}>
            <Activity size={200} color={P.green} style={{ position: 'absolute', opacity: 0.05, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            <p style={{ fontSize: 14, fontWeight: 800, color: P.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color={P.amber} fill={P.amber} /> Canlı Küsürat Getirisi (Live Yield)
            </p>
            <h2 className="yield-text" style={{ fontSize: 56, fontWeight: 900, margin: 0, fontFamily: 'monospace', letterSpacing: '-0.03em' }}>
              ₺{liveYield.toFixed(6)}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, background: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: 12 }}>
               <RefreshCw size={14} color={P.green} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
               <span style={{ fontSize: 12, fontWeight: 700, color: P.green }}>FinCoach Sandbox Ledger Aktif</span>
            </div>
          </div>

          <div style={{ background: '#050505', border: `1px solid ${P.border}`, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${P.border}` }}>
              <Terminal size={18} color={P.text2} />
              <span style={{ fontSize: 13, fontWeight: 800, color: P.text2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sandbox Ledger Execution Logs</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden', fontFamily: 'monospace', fontSize: 12 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ color: i === logs.length - 1 ? P.green : P.text3, animation: 'fadeSlideUp 0.3s ease' }}>
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, animationDelay: '0.2s' }}>
          
          {/* RECENT ROUNDUPS */}
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color={P.amber} /> Küsürat Akışı
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recentRounds.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: P.bg3, borderRadius: 16, border: `1px solid ${P.border}` }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{item.magaza}</p>
                    <p style={{ fontSize: 12, color: P.text3, margin: 0, textDecoration: 'line-through' }}>{fmt(item.amount)}</p>
                  </div>
                  <ArrowRight size={16} color={P.text3} />
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{fmt(item.rounded)}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: P.green, padding: '2px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      +{fmt(item.change)} Havuz
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECTION CHART */}
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>Sandbox Bileşik Getiri Projeksiyonu</h3>
                <p style={{ fontSize: 13, color: P.text3, margin: 0 }}>Ortalama %12.5 APY ile 1 yıllık tahmini havuz büyümesi.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: P.green, textTransform: 'uppercase', marginBottom: 4 }}>1 Yıllık Hedef</p>
                <p style={{ fontSize: 24, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(data.investedValue)}</p>
              </div>
            </div>
            
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={P.green} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={P.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={P.border} vertical={false} />
                  <XAxis dataKey="month" stroke={P.text3} fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke={P.text3} fontSize={11} tickFormatter={(val) => `₺${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ background: P.bg3, border: `1px solid ${P.border}`, borderRadius: 12 }}
                    itemStyle={{ color: P.text1, fontWeight: 700 }}
                    formatter={(value) => [fmt(value), 'Havuz Değeri']}
                  />
                  <Area type="monotone" dataKey="birikim" stroke={P.green} strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
