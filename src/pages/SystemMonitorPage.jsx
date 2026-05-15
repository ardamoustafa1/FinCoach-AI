import { useState, useEffect } from 'react';
import { Server, Activity, Database, Cpu, ShieldAlert, Zap, Terminal, GitMerge, ShieldCheck, Globe, Wifi, Key, Filter } from 'lucide-react';
import { fmt } from '../utils/categories';
import PageHeader from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

// Mock transaction generator
const getRandomTx = () => {
  const merchants = ['Starbucks', 'Apple Store', 'Trendyol', 'Uber', 'Steam', 'Migros', 'AWS Cloud'];
  const amt = Math.floor(Math.random() * 2000) + 50;
  const isFraud = amt > 1800; // 1800 üzeri fraud simülasyonu
  return {
    id: `ev-${Math.floor(Math.random() * 100000)}`,
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    amount: amt,
    isFraud
  };
};

export default function SystemMonitorPage() {
  const [logs, setLogs] = useState([]);
  const [activeNodes, setActiveNodes] = useState({ kafka: false, fraud: false, cashflow: false, rag: false });

  const addLog = (msg, color = 'default') => {
    setLogs(prev => {
      const newLogs = [{ msg, color, id: Math.random() }, ...prev];
      return newLogs.slice(0, 8); // Keep last 8
    });
  };

  useEffect(() => {
    // Event Stream Simulator
    const interval = setInterval(() => {
      const tx = getRandomTx();
      const time = new Date().toLocaleTimeString('tr-TR', { hour12: false });
      
      // 1. Transaction arrives
      setActiveNodes({ kafka: true, fraud: false, cashflow: false, rag: false });
      addLog(`[${time}] [API] Yeni İşlem: ${tx.merchant} - ${fmt(tx.amount)}`);
      
      // 2. Kafka Distributes
      setTimeout(() => {
        addLog(`[${time}] [KAFKA] Olay (Event ${tx.id}) kuyruğa alındı ve asenkron yayınlandı.`);
        setActiveNodes({ kafka: true, fraud: true, cashflow: true, rag: true });
        
        // 3. ML Nodes process in parallel
        setTimeout(() => {
          if (tx.isFraud) {
             addLog(`[${time}] [FRAUD_AI] UYARI: İzolasyon Ormanı anomali tespit etti! Cüzdan bloke ediliyor.`, 'red');
          } else {
             addLog(`[${time}] [FRAUD_AI] İşlem temiz. (Güven Skoru: %${92 + Math.floor(Math.random()*7)})`, 'green');
          }
          addLog(`[${time}] [CASHFLOW_AI] Prophet modeli 12 aylık projeksiyonu güncelledi.`, 'blue');
          addLog(`[${time}] [RAG_DB] Pinecone vektör veritabanına embedding eklendi.`, 'purple');
          
          setActiveNodes({ kafka: false, fraud: false, cashflow: false, rag: false });
        }, 600);
      }, 400);

    }, 3500); // New event every 3.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-enter { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .pulse-active { animation: pulseActive 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulseActive { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        
        .flow-line { position: absolute; background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent); background-size: 200% 100%; animation: flowAnim 1s linear infinite; }
        @keyframes flowAnim { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        <PageHeader
          icon={<Zap size={24} />}
          color={P.blue}
          title="Sistem Monitörü"
          subtitle="Apache Kafka event-driven mimarisi ile tüm AI servislerinin canlı sistem topolojisi."
          badge="Canlı"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}>
            <Activity size={16} color={P.green} />
            <span style={{ fontSize: 13, fontWeight: 800, color: P.green }}>0ms Gecikme</span>
          </div>
        </PageHeader>

        {/* TOPOLOGY GRAPH */}
        <div className="animate-enter" style={{ background: '#0f172a', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 24, padding: 40, animationDelay: '0.1s', opacity: 0, position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            
            {/* SOURCE */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 140 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Server size={32} color="#cbd5e1" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>Banka API</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Açık Bankacılık</div>
              </div>
            </div>

            {/* LINE TO KAFKA */}
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
               {activeNodes.kafka && <div className="flow-line" style={{ width: '100%', height: '100%', top: 0, left: 0 }} />}
            </div>

            {/* KAFKA BROKER */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 180 }}>
              <div className={activeNodes.kafka ? 'pulse-active' : ''} style={{ width: 80, height: 80, borderRadius: 20, background: activeNodes.kafka ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)', border: `2px solid ${activeNodes.kafka ? P.blue : 'rgba(59, 130, 246, 0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <GitMerge size={40} color={P.blue} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: P.blue }}>Apache Kafka</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Event Broker (Asenkron)</div>
              </div>
            </div>

            {/* LINES TO ML NODES */}
            <div style={{ width: 80, height: 200, position: 'relative' }}>
              {/* Top Line (Fraud) */}
              <div style={{ position: 'absolute', top: 32, left: 0, width: '100%', height: 2, background: 'rgba(255,255,255,0.1)' }}>
                 {activeNodes.fraud && <div className="flow-line" style={{ width: '100%', height: '100%' }} />}
              </div>
              <div style={{ position: 'absolute', top: 32, left: 0, width: 2, height: 68, background: 'rgba(255,255,255,0.1)' }}>
                 {activeNodes.fraud && <div className="flow-line" style={{ width: '100%', height: '100%', animationDirection: 'reverse' }} />}
              </div>
              
              {/* Middle Line (CashFlow) */}
              <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 2, background: 'rgba(255,255,255,0.1)' }}>
                 {activeNodes.cashflow && <div className="flow-line" style={{ width: '100%', height: '100%' }} />}
              </div>

              {/* Bottom Line (RAG) */}
              <div style={{ position: 'absolute', bottom: 32, left: 0, width: '100%', height: 2, background: 'rgba(255,255,255,0.1)' }}>
                 {activeNodes.rag && <div className="flow-line" style={{ width: '100%', height: '100%' }} />}
              </div>
              <div style={{ position: 'absolute', bottom: 32, left: 0, width: 2, height: 68, background: 'rgba(255,255,255,0.1)' }}>
                 {activeNodes.rag && <div className="flow-line" style={{ width: '100%', height: '100%' }} />}
              </div>
            </div>

            {/* ML NODES */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 240, width: 180 }}>
              
              {/* Fraud Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: activeNodes.fraud ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 16, border: `1px solid ${activeNodes.fraud ? P.red : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s' }}>
                <ShieldAlert size={24} color={activeNodes.fraud ? P.red : '#64748b'} className={activeNodes.fraud ? 'pulse-active' : ''} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: activeNodes.fraud ? P.red : '#f8fafc' }}>İzolasyon Ormanı</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Fraud Tespiti</div>
                </div>
              </div>

              {/* CashFlow Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: activeNodes.cashflow ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 16, border: `1px solid ${activeNodes.cashflow ? P.green : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s' }}>
                <Cpu size={24} color={activeNodes.cashflow ? P.green : '#64748b'} className={activeNodes.cashflow ? 'pulse-active' : ''} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: activeNodes.cashflow ? P.green : '#f8fafc' }}>Prophet Modeli</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Nakit Akışı (12 Ay)</div>
                </div>
              </div>

              {/* Vector DB Node */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: activeNodes.rag ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 16, border: `1px solid ${activeNodes.rag ? P.purple : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.3s' }}>
                <Database size={24} color={activeNodes.rag ? P.purple : '#64748b'} className={activeNodes.rag ? 'pulse-active' : ''} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: activeNodes.rag ? P.purple : '#f8fafc' }}>Pinecone RAG</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Vektör Gömme (Embed)</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* LIVE TERMINAL LOGS & SECURITY PANELS */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          
          <div className="animate-enter" style={{ background: '#020617', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0, flex: '1 1 500px', minHeight: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Terminal size={18} color="#94a3b8" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>SİSTEM LOGLARI (CANLI)</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'monospace' }}>
              {logs.length === 0 && <span style={{ color: '#475569' }}>Sistem dinleniyor. Event bekleniyor...</span>}
              {logs.map((log) => (
                <div key={log.id} className="animate-enter" style={{ 
                  color: log.color === 'red' ? '#ef4444' : log.color === 'green' ? '#10b981' : log.color === 'blue' ? '#3b82f6' : log.color === 'purple' ? '#a855f7' : '#cbd5e1',
                  fontSize: 13, lineHeight: 1.5
                }}>
                  {log.msg}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: '1 1 350px', animationDelay: '0.3s', opacity: 0 }}>
            
            {/* Zero Trust Panel */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.05), transparent)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 24, padding: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                 <div style={{ background: 'rgba(16,185,129,0.2)', padding: 8, borderRadius: 12 }}><ShieldCheck size={20} color={P.green} /></div>
                 <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', margin: 0 }}>Sıfır Güven (Zero-Trust) & RLS</h3>
               </div>
               <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>
                 Uygulama genelinde AES-256 (E2EE) şifreleme ve veritabanı katmanında Row-Level Security aktiftir. Kurucu CTO dahi kullanıcı verilerine erişemez.
               </p>
               <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f172a', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                   <Key size={14} color={P.text3} /> <span style={{ fontSize: 12, color: P.text2, fontWeight: 600 }}>AES-256</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f172a', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                   <Database size={14} color={P.text3} /> <span style={{ fontSize: 12, color: P.text2, fontWeight: 600 }}>PostgreSQL RLS</span>
                 </div>
               </div>
            </div>

            {/* Edge Computing Panel */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), transparent)', border: `1px solid rgba(59,130,246,0.3)`, borderRadius: 24, padding: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                 <div style={{ background: 'rgba(59,130,246,0.2)', padding: 8, borderRadius: 12 }}><Globe size={20} color={P.blue} /></div>
                 <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', margin: 0 }}>Edge Computing (Sınır Bilişim)</h3>
               </div>
               <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>
                 Markowitz optimizasyonu ve AI çıkarımları merkezi sunucularda değil, size en yakın Cloudflare Worker (Edge Node) üzerinde hesaplanır.
               </p>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Wifi size={16} color={P.green} />
                   <span style={{ fontSize: 13, color: P.text2, fontWeight: 600 }}>Aktif Edge: IST-1 (İstanbul)</span>
                 </div>
                 <span style={{ fontSize: 14, fontWeight: 900, color: P.green }}>4ms Gecikme</span>
               </div>
            </div>

            {/* Data Lake & ETL Panel */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05), transparent)', border: `1px solid rgba(124,58,237,0.3)`, borderRadius: 24, padding: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                 <div style={{ background: 'rgba(124,58,237,0.2)', padding: 8, borderRadius: 12 }}><Database size={20} color={P.purple} /></div>
                 <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', margin: 0 }}>Data Lake & ETL Pipeline</h3>
               </div>
               <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>
                 Milyonlarca ham işlem verisi Snowflake Veri Gölü'ne dökülür ve <strong>dbt (data build tool)</strong> ile temizlenerek (ETL) yapay zeka modellerimizin eğitim setine (Training Set) dönüştürülür.
               </p>
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Filter size={16} color={P.purple} />
                   <span style={{ fontSize: 13, color: P.text2, fontWeight: 600 }}>Son ETL Senkronizasyonu:</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.green, display: 'inline-block', boxShadow: '0 0 8px #10b981', animation: 'pulseActive 2s infinite' }} />
                    <span style={{ fontSize: 12, fontWeight: 900, color: P.green }}>BAŞARILI (2sn önce)</span>
                 </div>
               </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
