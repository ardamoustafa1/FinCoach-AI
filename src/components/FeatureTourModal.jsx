import { Lock, Brain, Dices, Layers, ScanFace, FileText, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';

const P = {
  purple: '#7C3AED', green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)'
};

const TOUR_CONTENT = {
  '/escrow': {
    title: 'Voice-to-Smart Contract 🎙️',
    subtitle: 'Dünyanın En Kolay Web3 Entegrasyonu',
    desc: "Siz sadece 'Ali'ye 500 TL gönder ama projeyi yarın teslim ederse' diyorsunuz; FinCoach AI bunu algılayıp arka planda Ethereum ağında otonom bir akıllı sözleşme (Smart Contract) oluşturuyor. Şart gerçekleşene kadar paranız güvendedir.",
    icon: <Lock size={32} color={P.purple} />,
    color: P.purple
  },
  '/micro-invest': {
    title: 'Autonomous Yield Routing 🌾',
    subtitle: 'Yatan Para (Idle Money) Devri Bitti',
    desc: 'Harcamalarınızdan arta kalan küsüratlar pasif olarak beklemez. Saniyeler içinde Aave ve Compound gibi DeFi havuzlarına aktarılarak sizin için saniyelik getiri üretir.',
    icon: <Layers size={32} color={P.green} />,
    color: P.green
  },
  '/time-machine': {
    title: 'Paralel Evren Simülatörü 🦋',
    subtitle: 'Kelebek Etkisi Motoru',
    desc: 'Hedge fonlarının kullandığı Monte Carlo algoritmalarıyla bugün yapacağınız sıradan bir harcamanın, 10 yıl sonra hayatınızı nasıl ikiye böldüğünü (Harcama vs Otonom Fon) görün.',
    icon: <Dices size={32} color={P.blue} />,
    color: P.blue
  },
  '/stress-test': {
    title: 'Kıyamet Senaryosu & Dijital İkiz 🌪️',
    subtitle: 'Makroekonomik Stres Testi',
    desc: 'Finansal kriz, hiperenflasyon ve işsizlik durumlarında portföyünüzün ne kadar dayanacağını test edin. Yapay zeka, hayatta kalma sürenizi (Survival Runway) hesaplar.',
    icon: <Brain size={32} color={P.amber} />,
    color: P.amber
  },
  '/anomaly': {
    title: 'Dopamine Lock & Fraud AI 🛑',
    subtitle: 'Duygusal Biyometri Kalkanı',
    desc: "Sistem sizin stresli veya dürtüsel bir şekilde (gece 3'te alışveriş) para harcadığınızı tespit ederse işleminizi durdurur. 24 saatlik soğuma süresine kilitler.",
    icon: <ScanFace size={32} color={P.red} />,
    color: P.red
  },
  '/federated-learning': {
    title: 'Federated AI & Mahremiyet 🛡️',
    subtitle: 'Sıfır Veri Sızıntısı',
    desc: 'Banka verileriniz asla cihazınızdan çıkmaz. FinCoach AI, Apple tarzı Federated Learning ile verilerinizi cihazınızda eğitir. Merkezi sunuculara sadece anonim şifreli ağırlıklar gider.',
    icon: <FileText size={32} color="#8B5CF6" />,
    color: "#8B5CF6"
  }
};

export default function FeatureTourModal({ pathname }) {
  const seenTours = useStore(state => state.seenTours);
  const markTourSeen = useStore(state => state.markTourSeen);
  
  const content = TOUR_CONTENT[pathname];

  // If no content for this route or already seen, don't show
  if (!content || seenTours.includes(pathname)) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 24, animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpTour { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      
      <div style={{
        background: P.bg2, border: `1px solid ${content.color}40`, borderRadius: 32,
        width: '100%', maxWidth: 500, overflow: 'hidden',
        boxShadow: `0 24px 60px ${content.color}20`,
        animation: 'slideUpTour 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 250, height: 250, background: content.color, opacity: 0.1, filter: 'blur(80px)' }} />
        
        <div style={{ padding: '40px 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${content.color}15`, border: `1px solid ${content.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 30px ${content.color}30` }}>
            {content.icon}
          </div>
          
          <h4 style={{ fontSize: 13, fontWeight: 800, color: content.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            {content.subtitle}
          </h4>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', marginBottom: 16 }}>
            {content.title}
          </h2>
          <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, marginBottom: 40 }}>
            {content.desc}
          </p>
          
          <button 
            onClick={() => markTourSeen(pathname)}
            style={{
              width: '100%', padding: '16px', borderRadius: 16,
              background: `linear-gradient(135deg, ${content.color}, ${content.color}dd)`,
              color: '#fff', fontSize: 16, fontWeight: 800, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 10px 30px ${content.color}40`
            }}
          >
            Anladım, Keşfet <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
