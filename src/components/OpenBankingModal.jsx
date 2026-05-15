import { useState, useEffect } from 'react';
import { Landmark, Loader2, Sparkles, CheckCircle2, Server, ArrowRight } from 'lucide-react';

const P = {
  purple: '#7C3AED', green: '#10B981', blue: '#3B82F6', amber: '#F59E0B', red: '#EF4444',
  bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const RAW_DATA = [
  { raw: "POS/MIGROS A.S. ISTANBUL", amount: 450.50, date: "2026-05-12" },
  { raw: "KART ISLEMI STARBUCKS COFFEE TR", amount: 125.00, date: "2026-05-11" },
  { raw: "KIRAM NET GAYRIMENKUL - MAYIS", amount: 15000.00, date: "2026-05-01" },
  { raw: "UBER *TRIP HELP.UBER.COM", amount: 320.00, date: "2026-05-08" },
  { raw: "NETFLIX.COM AMSTERDAM NL", amount: 229.99, date: "2026-05-03" },
  { raw: "ENKASU ELEKTRIK FATURA ODEME", amount: 650.20, date: "2026-05-05" },
  { raw: "GETIR PERAKENDE LOJISTIK AS", amount: 415.00, date: "2026-05-10" }
];

const CATEGORIZED_DATA = [
  { magaza: "Migros", kategori: "Market", icon: "🛒", color: P.green },
  { magaza: "Starbucks", kategori: "Yemek", icon: "🍔", color: P.red },
  { magaza: "Ev Kirası", kategori: "Fatura", icon: "📄", color: P.amber },
  { magaza: "Uber", kategori: "Ulaşım", icon: "🚌", color: P.blue },
  { magaza: "Netflix", kategori: "Eğlence", icon: "🎮", color: '#A855F7' },
  { magaza: "Elektrik Faturası", kategori: "Fatura", icon: "📄", color: P.amber },
  { magaza: "Getir", kategori: "Yemek Siparişi", icon: "🛵", color: '#F97316' }
];

export default function OpenBankingModal({ onComplete }) {
  const [step, setStep] = useState(0); 
  // 0: Connecting, 1: Fetching Raw, 2: AI Categorization, 3: Done
  const [visibleItems, setVisibleItems] = useState([]);
  const [categorizedItems, setCategorizedItems] = useState([]);

  useEffect(() => {
    // 1. Connect
    const t1 = setTimeout(() => setStep(1), 2000);
    
    // 2. Stream Raw Data
    const t2 = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        if (count < RAW_DATA.length) {
          setVisibleItems(prev => [...prev, RAW_DATA[count]]);
          count++;
        } else {
          clearInterval(interval);
          setStep(2); // Start AI Categorization
        }
      }, 150);
    }, 2500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (step === 2) {
      let count = 0;
      const interval = setInterval(() => {
        if (count < RAW_DATA.length) {
          setCategorizedItems(prev => [...prev, count]);
          count++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep(3), 1000);
        }
      }, 600); // Slow motion effect for AI
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleApply = () => {
    const processedTx = RAW_DATA.map((raw, i) => {
      const cat = CATEGORIZED_DATA[i];
      return {
        id: crypto.randomUUID(),
        tarih: raw.date,
        tutar: raw.amount,
        magaza: cat.magaza,
        aciklama: `Açık Bankacılık: ${raw.raw}`,
        kategori: cat.kategori,
        tur: 'gider',
        not: 'Otomatik senkronize edildi',
        createdAt: new Date().toISOString()
      };
    });
    onComplete(processedTx);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <style>{`
        @keyframes scan { 0% { top: 0; opacity: 0; } 10%, 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .data-row-enter { animation: fadeSlideUp 0.3s ease forwards; }
      `}</style>
      
      <div style={{
        width: '100%', maxWidth: 700,
        background: '#09090b', border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 0 80px rgba(59,130,246,0.2)',
        position: 'relative', display: 'flex', flexDirection: 'column', height: 600
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(59,130,246,0.1) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={24} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Açık Bankacılık Senkronizasyonu</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {step === 0 && <><Loader2 size={12} color="#94a3b8" className="animate-spin" /><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>API'ye bağlanılıyor...</span></>}
                {step === 1 && <><Server size={12} color="#60a5fa" className="animate-pulse" /><span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>Veriler çekiliyor...</span></>}
                {step === 2 && <><Sparkles size={12} color="#c4b5fd" className="animate-pulse" /><span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600 }}>LLM Kategorizasyonu yapılıyor...</span></>}
                {step === 3 && <><CheckCircle2 size={12} color="#10b981" /><span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>İşlem tamamlandı</span></>}
              </div>
            </div>
          </div>
          {step === 3 && (
            <button onClick={handleApply} style={{
              padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #3B82F6, #10B981)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)', animation: 'fadeSlideUp 0.4s ease'
            }}>Kayıtlara Ekle</button>
          )}
        </div>

        {/* List View */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#050505', position: 'relative' }}>
          {step === 2 && (
             <div style={{ position: 'absolute', left: 0, right: 0, height: 100, background: 'linear-gradient(180deg, transparent, rgba(124,58,237,0.2), transparent)', animation: 'scan 2.5s linear infinite', zIndex: 10, pointerEvents: 'none' }} />
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
            {visibleItems.map((item, idx) => {
              const isCategorized = categorizedItems.includes(idx);
              const catData = CATEGORIZED_DATA[idx];
              
              return (
                <div key={idx} className="data-row-enter" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', borderRadius: 12,
                  background: isCategorized ? 'rgba(255,255,255,0.04)' : 'transparent',
                  border: `1px solid ${isCategorized ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)'}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  {/* Raw Data Left */}
                  <div style={{ flex: 1, opacity: isCategorized ? 0.4 : 1, transition: 'opacity 0.4s' }}>
                    <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#cbd5e1', margin: '0 0 4px', fontWeight: 600 }}>{item.raw}</p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontFamily: 'monospace' }}>{item.date} • ₺{item.amount.toFixed(2)}</p>
                  </div>

                  {/* Transformation Arrow */}
                  {isCategorized && (
                    <div style={{ padding: '0 16px', color: '#60a5fa', animation: 'fadeSlideUp 0.3s ease' }}>
                      <ArrowRight size={16} />
                    </div>
                  )}

                  {/* AI Categorized Data Right */}
                  {isCategorized && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, animation: 'fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                       <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{catData.magaza}</p>
                         <p style={{ fontSize: 11, fontWeight: 700, color: catData.color, margin: 0 }}>{catData.kategori}</p>
                       </div>
                       <div style={{ width: 40, height: 40, borderRadius: 12, background: `${catData.color}20`, border: `1px solid ${catData.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                         {catData.icon}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
