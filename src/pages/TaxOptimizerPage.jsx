import { useState, useEffect } from 'react';
import { Calculator, Download, CheckCircle2, Receipt, Search, Building2, Car, Coffee, Info, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const DEDUCTIBLE_CATEGORIES = {
  'Ulaşım': { icon: Car, rate: 0.18, name: 'Ulaşım & Yakıt', color: P.blue },
  'Yemek': { icon: Coffee, rate: 0.10, name: 'Temsil & Ağırlama', color: P.amber },
  'Fatura': { icon: Building2, rate: 0.20, name: 'Ofis & İletişim', color: P.green }
};

export default function TaxOptimizerPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({ items: [], totalExpense: 0, totalDeductible: 0, taxSaved: 0 });

  useEffect(() => {
    setTimeout(() => {
      const tx = useStore.getState().transactions;
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const monthlyTx = tx.filter(t => t.tur === 'gider' && t.tarih.startsWith(currentMonth));
      
      let totalExpense = 0;
      let totalDeductible = 0;
      let taxSaved = 0;
      const items = [];

      monthlyTx.forEach(t => {
        const amount = Number(t.tutar);
        totalExpense += amount;
        
        if (DEDUCTIBLE_CATEGORIES[t.kategori]) {
          const catInfo = DEDUCTIBLE_CATEGORIES[t.kategori];
          const deductibleAmt = amount * 1.0; // Assuming 100% can be submitted
          const taxBenefit = deductibleAmt * catInfo.rate; // Simple tax bracket assumption
          
          totalDeductible += deductibleAmt;
          taxSaved += taxBenefit;

          items.push({
            id: t.id,
            tarih: t.tarih,
            magaza: t.magaza || t.aciklama,
            tutar: amount,
            kategori: t.kategori,
            taxBenefit,
            info: catInfo
          });
        }
      });

      setData({ items, totalExpense, totalDeductible, taxSaved });
      setLoading(false);
    }, 800);
  }, []);

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      // Create a dummy PDF download
      const element = document.createElement("a");
      const file = new Blob(["MOCK PDF CONTENT"], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = "FinCoach_Vergi_Raporu.pdf";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${P.green}30`, borderTopColor: P.green, animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 14, fontWeight: 600, color: P.text2, letterSpacing: '0.05em' }}>OCR fişleri ve vergiden düşülebilir kalemler taranıyor...</p>
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
        
        {/* HEADER */}
        <div className="animate-enter" style={{
          background: `linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(59,130,246,0.05) 100%)`,
          border: `1px solid ${P.border}`, borderRadius: 24, padding: '32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calculator size={20} color={P.green} />
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: P.green }}>AI Vergi Asistanı</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Vergi ve Kesinti Optimizasyonu
            </h1>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
              FinCoach OCR yapay zekası, okuduğu fişleri analiz ederek freelancer ve şirket sahipleri için <strong style={{color: P.text1}}>vergiden düşülebilir giderleri</strong> otomatik tespit eder.
            </p>
          </div>

          <button 
            onClick={generateReport}
            disabled={generating}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 16, border: 'none',
              background: generating ? P.bg3 : `linear-gradient(135deg, ${P.green}, #059669)`, color: generating ? P.text3 : '#fff',
              fontSize: 14, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer',
              boxShadow: generating ? 'none' : `0 8px 24px rgba(16,185,129,0.3)`, transition: 'all 0.2s'
            }}
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {generating ? 'Rapor Hazırlanıyor...' : 'Muhasebeciye Gönder (PDF)'}
          </button>
        </div>

        {/* METRICS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>Toplam Aylık Gider</span>
              <Receipt size={18} color={P.text3} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(data.totalExpense)}</p>
          </div>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase' }}>Vergiden Düşülebilir</span>
              <Search size={18} color={P.blue} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.blue, margin: 0 }}>{fmt(data.totalDeductible)}</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.green, textTransform: 'uppercase' }}>Tahmini Vergi İadesi/Tasarrufu</span>
              <CheckCircle2 size={18} color={P.green} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 900, color: P.green, margin: 0 }}>+{fmt(data.taxSaved)}</p>
          </div>
        </div>

        {/* DETAILED LIST */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s', opacity: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: 0 }}>Giderleştirilebilir Kalemler (Bu Ay)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: P.bg3, padding: '6px 12px', borderRadius: 999, border: `1px solid ${P.border}` }}>
               <Info size={14} color={P.text3} />
               <span style={{ fontSize: 11, fontWeight: 600, color: P.text2 }}>KDV ve Kurumlar Vergisi Tahminidir</span>
            </div>
          </div>

          {data.items.length === 0 ? (
            <p style={{ color: P.text3, fontSize: 14 }}>Bu ay için vergiden düşülebilir uygun fiş bulunamadı.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: P.bg3, borderRadius: 16, border: `1px solid ${P.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${item.info.color}15`, border: `1px solid ${item.info.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.info.icon size={18} color={item.info.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{item.magaza}</p>
                      <p style={{ fontSize: 11, color: P.text3, margin: 0 }}>{item.tarih} • {item.info.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: P.text1, margin: '0 0 4px' }}>{fmt(item.tutar)}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: P.green, margin: 0 }}>+{fmt(item.taxBenefit)} Tasarruf</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
