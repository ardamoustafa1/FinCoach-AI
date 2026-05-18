import { useState, useEffect, useRef } from 'react';
import { Landmark, Loader2, Sparkles, CheckCircle2, Server, ArrowRight, Upload } from 'lucide-react';
import Papa from 'papaparse';

import { P } from '../styles/palette';
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
  // 0: Connecting/Waiting for CSV, 1: Fetching Raw, 2: AI Categorization, 3: Done
  const [visibleItems, setVisibleItems] = useState([]);
  const [categorizedItems, setCategorizedItems] = useState([]);
  const [activeData, setActiveData] = useState(RAW_DATA);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const parsed = results.data.map(row => ({
            raw: row.description || row.aciklama || row.raw,
            amount: parseFloat(row.amount || row.tutar) || 0,
            date: row.date || row.tarih || new Date().toISOString().split('T')[0]
          })).filter(r => r.raw && r.amount);
          if (parsed.length > 0) setActiveData(parsed);
          setStep(1); // Resume flow
        }
      });
    }
  };

  useEffect(() => {
    // 1. Connect
    let t1;
    if (step === 0) {
      t1 = setTimeout(() => setStep(1), 2000);
    }
    
    // 2. Stream Raw Data
    if (step === 1) {
      let count = 0;
      const interval = setInterval(() => {
        if (count < activeData.length) {
          setVisibleItems(prev => [...prev, activeData[count]]);
          count++;
        } else {
          clearInterval(interval);
          setStep(2); // Start AI Categorization
        }
      }, 150);
      return () => {
        if (t1) clearTimeout(t1);
        clearInterval(interval);
      };
    }

    return () => {
      if (t1) clearTimeout(t1);
    };
  }, [step, activeData]);

  useEffect(() => {
    if (step === 2) {
      let count = 0;
      const interval = setInterval(() => {
        if (count < activeData.length) {
          setCategorizedItems(prev => [...prev, count]);
          count++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep(3), 1000);
        }
      }, 600); // Slow motion effect for AI
      return () => clearInterval(interval);
    }
  }, [step, activeData.length]);

  const handleApply = () => {
    const processedTx = activeData.map((raw, i) => {
      const cat = CATEGORIZED_DATA[i] || CATEGORIZED_DATA[0];
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
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Açık Bankacılık Sandbox Senkronizasyonu <span style={{fontSize: 10, backgroundColor: 'rgba(16,185,129,0.18)', color: '#10B981', padding: '2px 6px', borderRadius: 6, verticalAlign: 'middle'}}>Çalışır Sandbox</span></h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {step === 0 && <><Loader2 size={12} color="#94a3b8" className="animate-spin" /><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>API'ye bağlanılıyor...</span></>}
                {step === 1 && <><Server size={12} color="#60a5fa" className="animate-pulse" /><span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>Sandbox veri akışı başlatıldı...</span></>}
                {step === 2 && <><Sparkles size={12} color="#c4b5fd" className="animate-pulse" /><span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600 }}>Yerel kategorizasyon motoru çalışıyor...</span></>}
                {step === 3 && <><CheckCircle2 size={12} color="#10b981" /><span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Senkronizasyon tamamlandı</span></>}
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
          {step === 0 && (
            <div>
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} style={{
                padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}><Upload size={14} /> CSV Yükle</button>
            </div>
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
