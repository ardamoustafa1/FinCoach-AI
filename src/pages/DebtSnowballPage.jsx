import { useState, useEffect } from 'react';
import { CreditCard, Snowflake, Calculator, AlertTriangle } from 'lucide-react';
import { fmt } from '../utils/categories';
import PageHeader, { PageLoader } from '../components/PageHeader';

const P = {
  purple: '#7C3AED', blue: '#3B82F6', green: '#10B981', red: '#EF4444', amber: '#F59E0B',
  bg0: 'var(--bg-main)', bg2: 'var(--bg-surface)', bg3: 'var(--bg-surface-soft)',
  border: 'var(--border-color)', text1: 'var(--text-primary)', text2: 'var(--text-secondary)', text3: 'var(--text-muted)'
};

const MOCK_DEBTS = [
  { id: 1, name: 'A Bankası Kredi Kartı', type: 'cc', balance: 45000, interestRate: 4.25, minPayment: 9000, color: P.red },
  { id: 2, name: 'B Bankası Kredi Kartı', type: 'cc', balance: 12000, interestRate: 3.50, minPayment: 2400, color: P.amber },
  { id: 3, name: 'İhtiyaç Kredisi', type: 'loan', balance: 85000, interestRate: 2.80, minPayment: 7500, color: P.blue }
];

export default function DebtSnowballPage() {
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState('snowball'); // 'snowball' (lowest balance first) or 'avalanche' (highest interest first)
  const [plan, setPlan] = useState(null);

  const totalMonthlyBudget = 25000; // Kullanıcının borçlara ayırabildiği toplam para

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (!isMounted) return;
      // Sort debts based on strategy
      let sortedDebts = [...MOCK_DEBTS];
      if (strategy === 'snowball') {
        sortedDebts.sort((a, b) => a.balance - b.balance);
      } else {
        sortedDebts.sort((a, b) => b.interestRate - a.interestRate);
      }

      const totalBalance = MOCK_DEBTS.reduce((a, b) => a + b.balance, 0);
      const totalMinPayment = MOCK_DEBTS.reduce((a, b) => a + b.minPayment, 0);
      const extraPayment = totalMonthlyBudget - totalMinPayment; // Kartopu etkisi için kullanılacak fazlalık

      // Simple AI Advice
      let aiAdvice;
      if (extraPayment < 0) {
         aiAdvice = `ALARM: Asgari ödemeleriniz (₺${totalMinPayment}), bütçenizi (₺${totalMonthlyBudget}) aşıyor. Acilen harcamaları kısmalı veya borç yapılandırması (konsolidasyon) yapmalısınız.`;
      } else {
         const target = sortedDebts[0];
         if (strategy === 'snowball') {
           aiAdvice = `Karar: Kartopu Stratejisi. Psikolojik zafer için önce en küçük borç olan '${target.name}' kapatılacak. Asgarileri ödedikten sonra kalan ₺${extraPayment} tutarındaki fazlalığı tamamen bu karta yatırın.`;
         } else {
           aiAdvice = `Karar: Çığ Stratejisi. Matematiksel olarak en az faizi ödemek için önce %${target.interestRate} faizli '${target.name}' kapatılacak. Fazla paranızın (₺${extraPayment}) tamamını buraya aktarın.`;
         }
      }


      setPlan({
        totalBalance,
        totalMinPayment,
        extraPayment,
        sortedDebts,
        aiAdvice
      });
      setLoading(false);
    }, 600);
    return () => { isMounted = false; };
  }, [strategy]);

  if (loading || !plan) return <PageLoader message="Borç optimizasyon algoritması çalıştırılıyor..." />;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <PageHeader
          icon={<Snowflake size={24} />}
          color={P.blue}
          title="Borç Yapılandırma"
          subtitle="Snowball veya Avalanche yöntemiyle borçlarınızı en hızlı şekilde kapatın."
          badge="AI Optimizer"
        >
          <div style={{ display: 'flex', background: P.bg3, borderRadius: 12, padding: 4, border: `1px solid ${P.border}` }}>
            <button 
              onClick={() => { setLoading(true); setStrategy('snowball'); }}
              style={{ background: strategy === 'snowball' ? P.blue : 'transparent', color: strategy === 'snowball' ? '#fff' : P.text2, border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Kartopu
            </button>
            <button 
              onClick={() => { setLoading(true); setStrategy('avalanche'); }}
              style={{ background: strategy === 'avalanche' ? P.red : 'transparent', color: strategy === 'avalanche' ? '#fff' : P.text2, border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Çığ (Düşük Faiz)
            </button>
          </div>
        </PageHeader>

        {/* METRICS */}
        <div className="animate-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, animationDelay: '0.1s', opacity: 0 }}>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Toplam Borç Yükü</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(plan.totalBalance)}</p>
          </div>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Aylık Borç Bütçesi</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(totalMonthlyBudget)}</p>
          </div>
          <div style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 20, padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: P.text3, textTransform: 'uppercase', marginBottom: 8 }}>Kartopu Gücü (Fazlalık)</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: plan.extraPayment > 0 ? P.green : P.red, margin: 0 }}>{fmt(plan.extraPayment)}</p>
          </div>
        </div>

        {/* AI ADVICE BANNER */}
        <div className="animate-enter" style={{
          background: plan.extraPayment < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
          border: `1px solid ${plan.extraPayment < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'}`,
          borderRadius: 20, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', animationDelay: '0.2s', opacity: 0
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: plan.extraPayment < 0 ? P.red : P.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {plan.extraPayment < 0 ? <AlertTriangle size={24} color="#fff" /> : <Calculator size={24} color="#fff" />}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: '0 0 8px' }}>Yapay Zeka Aksiyon Planı</h3>
            <p style={{ fontSize: 14, color: P.text2, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{plan.aiAdvice}</p>
          </div>
        </div>

        {/* EXECUTION ROADMAP */}
        <div className="animate-enter" style={{ background: P.bg2, border: `1px solid ${P.border}`, borderRadius: 24, padding: 32, animationDelay: '0.3s', opacity: 0 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: P.text1, margin: '0 0 32px' }}>Aylık Ödeme Dağılımı (Sıralı Hedef)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {plan.sortedDebts.map((debt, index) => {
              const isTarget = index === 0 && plan.extraPayment > 0;
              const paymentAmount = isTarget ? debt.minPayment + plan.extraPayment : debt.minPayment;
              
              return (
                <div key={debt.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 24, 
                  padding: isTarget ? '24px' : '16px', 
                  background: isTarget ? `${debt.color}10` : P.bg3, 
                  border: `1px solid ${isTarget ? debt.color : P.border}`, 
                  borderRadius: 20, position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s'
                }}>
                  {isTarget && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: debt.color }} />}
                  
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${debt.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={24} color={debt.color} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: P.text1, margin: 0 }}>{debt.name}</h4>
                      {isTarget && <span style={{ background: debt.color, color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 999, textTransform: 'uppercase' }}>Birincil Hedef</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: P.text3 }}>
                      <span>Kalan: <strong style={{ color: P.text2 }}>{fmt(debt.balance)}</strong></span>
                      <span>Faiz: <strong style={{ color: debt.color }}>%{debt.interestRate}</strong></span>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right', minWidth: 140 }}>
                    <p style={{ fontSize: 12, color: P.text3, margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 800 }}>Bu Ay Ödenecek</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color: P.text1, margin: 0 }}>{fmt(paymentAmount)}</p>
                    {isTarget && <p style={{ fontSize: 12, color: debt.color, margin: '4px 0 0 0', fontWeight: 700 }}>+{fmt(plan.extraPayment)} Kartopu Ekstrası</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}
