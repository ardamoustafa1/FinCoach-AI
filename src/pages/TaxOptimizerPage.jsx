import { useState, useEffect } from 'react';
import { Calculator, Download, CheckCircle2, Receipt, Search, Building2, Car, Coffee, Info, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { fmt } from '../utils/categories';
import PageHeader, { PageLoader } from '../components/PageHeader';

import { P } from '../styles/palette';
const DEDUCTIBLE_CATEGORIES = {
  'Ulaşım': { icon: Car, rate: 0.18, name: 'Ulaşım & Yakıt', color: P.blue },
  'Yemek Siparişi': { icon: Coffee, rate: 0.10, name: 'Temsil & Ağırlama', color: P.amber },
  'Restoran': { icon: Coffee, rate: 0.10, name: 'Temsil & Ağırlama', color: P.amber },
  'Yemek': { icon: Coffee, rate: 0.10, name: 'Temsil & Ağırlama', color: P.amber },
  'Fatura': { icon: Building2, rate: 0.20, name: 'Ofis & İletişim', color: P.green },
  'Sağlık': { icon: Receipt, rate: 0.08, name: 'Sağlık Gideri', color: P.red },
  'Alışveriş': { icon: Receipt, rate: 0.05, name: 'İşletme Gideri Adayı', color: P.purple }
};

export default function TaxOptimizerPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({ items: [], totalExpense: 0, totalDeductible: 0, taxSaved: 0 });

  useEffect(() => {
    setTimeout(() => {
      const tx = useStore.getState().transactions;
      const currentMonth = new Date();
      
      // Calculate date 3 months ago (first day of that month)
      const threeMonthsAgo = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 2, 1);
      const minDateStr = threeMonthsAgo.toISOString().slice(0, 10); // YYYY-MM-DD
      
      const eligibleTx = tx.filter(t => t.tur === 'gider' && t.tarih >= minDateStr);
      
      let totalExpense = 0;
      let totalDeductible = 0;
      let taxSaved = 0;
      const items = [];

      eligibleTx.forEach(t => {
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

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      
      setTimeout(() => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // ─── HEADER ───
        doc.setFillColor(124, 58, 237);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('FinCoach AI - Vergi Optimizasyon Raporu', margin, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 28);
        doc.text(`Dönem: ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}`, margin, 34);
        y = 52;

        // ─── SUMMARY BOX ───
        doc.setDrawColor(124, 58, 237);
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 4, 4, 'FD');
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        const colWidth = (pageWidth - margin * 2) / 3;
        
        // Col 1: Total Expense
        doc.text('TOPLAM AYLIK GİDER', margin + 8, y + 10);
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text(fmt(data.totalExpense), margin + 8, y + 22);
        
        // Col 2: Deductible
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text('VERGİDEN DÜŞÜLEBİLİR', margin + colWidth + 8, y + 10);
        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text(fmt(data.totalDeductible), margin + colWidth + 8, y + 22);
        
        // Col 3: Tax Saved
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text('TAHMİNİ VERGİ İADESİ', margin + colWidth * 2 + 8, y + 10);
        doc.setFontSize(16);
        doc.setTextColor(16, 185, 129);
        doc.text('+' + fmt(data.taxSaved), margin + colWidth * 2 + 8, y + 22);
        
        y += 42;

        // ─── TABLE HEADER ───
        doc.setFillColor(30, 41, 59);
        doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TARİH', margin + 4, y + 7);
        doc.text('MAĞAZA / AÇIKLAMA', margin + 30, y + 7);
        doc.text('KATEGORİ', margin + 90, y + 7);
        doc.text('TUTAR', margin + 125, y + 7);
        doc.text('VERGİ TASARRUFU', margin + 145, y + 7);
        y += 12;

        // ─── TABLE ROWS ───
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        if (data.items.length === 0) {
          doc.setTextColor(148, 163, 184);
          doc.text('Bu dönemde vergiden düşülebilir uygun kalem bulunamadı.', margin + 4, y + 5);
          y += 14;
        } else {
          data.items.forEach((item, idx) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            
            // Alternating row background
            if (idx % 2 === 0) {
              doc.setFillColor(248, 250, 252);
              doc.rect(margin, y - 2, pageWidth - margin * 2, 10, 'F');
            }
            
            doc.setTextColor(71, 85, 105);
            doc.text(item.tarih || '-', margin + 4, y + 5);
            doc.setTextColor(15, 23, 42);
            doc.text((item.magaza || '-').substring(0, 28), margin + 30, y + 5);
            doc.setTextColor(100, 116, 139);
            doc.text(item.info?.name || item.kategori || '-', margin + 90, y + 5);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(fmt(item.tutar), margin + 125, y + 5);
            doc.setTextColor(16, 185, 129);
            doc.text('+' + fmt(item.taxBenefit), margin + 145, y + 5);
            doc.setFont('helvetica', 'normal');
            y += 10;
          });
        }

        y += 10;

        // ─── DISCLAIMER ───
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'italic');
        doc.text('Bu rapor FinCoach AI tarafından otomatik olarak oluşturulmuştur.', margin, y);
        y += 5;
        doc.text('Vergi oranları tahminidir ve gerçek vergi beyannamesi yerine geçmez.', margin, y);
        y += 5;
        doc.text('Detaylı bilgi için bir mali müşavire danışmanız önerilir.', margin, y);
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(124, 58, 237);
        doc.text('FinCoach AI - Yapay Zeka Destekli Finansal Koçluk Platformu', margin, y);

        // ─── SAVE ───
        doc.save(`FinCoach_Vergi_Raporu_${new Date().toISOString().slice(0, 7)}.pdf`);
        setGenerating(false);
      }, 1200);
    } catch {
      setGenerating(false);
    }
  };

  if (loading) return <PageLoader message="OCR fişleri ve vergiden düşülebilir kalemler taranıyor..." />;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<Calculator size={24} />}
          color="#EC4899"
          title="Vergi Asistanı"
          subtitle="Giderlerinizi sınıflandırıp vergi tasarrufu adaylarını PDF rapora dönüştürün."
          badge="Kural Motoru"
        >
          <button 
            onClick={generateReport}
            disabled={generating}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14, border: 'none',
              background: generating ? P.bg3 : `linear-gradient(135deg, #EC4899, #DB2777)`, color: generating ? P.text3 : '#fff',
              fontSize: 13, fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer',
              boxShadow: generating ? 'none' : `0 8px 20px rgba(236,72,153,0.3)`, transition: 'all 0.2s'
            }}
          >
            {generating ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
            {generating ? 'Hazırlanıyor...' : 'PDF Rapor'}
          </button>
        </PageHeader>

        {/* METRICS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, animationDelay: '0.1s' }}>
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
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: 0 }}>Giderleştirilebilir Kalemler (Bu Ay)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: P.bg3, padding: '6px 12px', borderRadius: 999, border: `1px solid ${P.border}` }}>
               <Info size={14} color={P.text3} />
               <span style={{ fontSize: 11, fontWeight: 600, color: P.text2 }}>Sandbox vergi sınıflandırma motoru</span>
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
