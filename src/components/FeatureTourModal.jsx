import { Lock, Brain, Dices, Layers, ScanFace, FileText, ChevronRight, Calculator, Network, Target, Building, Trophy, ShieldAlert } from 'lucide-react';
import useStore from '../store/useStore';

const P = {
  purple: '#7C3AED', green: '#10B981', red: '#EF4444', amber: '#F59E0B', blue: '#3B82F6',
  bg1: 'var(--bg-sidebar)', bg2: 'var(--bg-surface)', border: 'var(--border-color)',
  text1: 'var(--text-primary)', text2: 'var(--text-secondary)'
};

const TOUR_CONTENT = {
  '/escrow': {
    title: 'Sesli Akıllı Kilit 🎙️',
    subtitle: 'Konuş, Şartını Koy, Paran Güvende Kalsın',
    desc: "Birine para göndermek istiyorsun ama bir şartın mı var? Mesela: \"Ali'ye 1.000 TL gönder ama ancak projeyi teslim ederse parayı alsın.\" Bunu telefona söylemen yeterli. FinCoach senin sözünü anlıyor, parayı dijital bir kasaya kilitleriyor ve şart yerine gelene kadar kimse o paraya dokunamıyor. Tam bir güven sistemi.",
    icon: <Lock size={32} color={P.purple} />,
    color: P.purple
  },
  '/micro-invest': {
    title: 'Küsürat Kumbarası 🌾',
    subtitle: 'Bozuk Paralarınız Bile Sizin İçin Çalışsın',
    desc: "45 TL kahve aldın, 55 TL küsürat kaldı. Normalde o para cebinde unutulur. Ama FinCoach onu anında yatırım havuzlarına yönlendirir ve her saniye sana küçük küçük kazanç sağlar. Ekranda paranızın gerçek zamanlı büyüdüğünü izleyebilirsiniz. Hiçbir kuruşunuz boşta durmaz.",
    icon: <Layers size={32} color={P.green} />,
    color: P.green
  },
  '/time-machine': {
    title: 'Ya Alsam Ya Almasam? 🦋',
    subtitle: 'Bugünkü Kararın 10 Yıl Sonra Seni Nereye Götürür?',
    desc: "Diyelim ki 80.000 TL'ye yeni telefon almayı düşünüyorsun. Peki ya o parayı harcamasan ve yatırıma yönlendirsen? Bu ekran tam olarak bunu gösteriyor: Bir tarafta telefonu aldığın evren (10 yıl sonra elinde 0 TL), diğer tarafta yatırım yaptığın evren (10 yıl sonra milyonlar). İki farklı geleceğini yan yana koy ve kararını öyle ver.",
    icon: <Dices size={32} color={P.blue} />,
    color: P.blue
  },
  '/stress-test': {
    title: 'En Kötüsüne Hazır mısın? 🌪️',
    subtitle: 'Ekonomik Kriz Gelirse Kaç Gün Dayanırsın?',
    desc: "Düşün ki yarın işini kaybettin, enflasyon patladı, kiran arttı. Peki elindeki parayla kaç gün hayatta kalabilirsin? Bu ekran tam olarak bunu hesaplıyor. Binlerce farklı senaryo çalıştırarak sana gerçekçi bir \"dayanma süresi\" gösteriyor. Korkutucu ama bilmen gereken bir gerçek — ve önlem almak için en iyi zaman şimdi.",
    icon: <Brain size={32} color={P.amber} />,
    color: P.amber
  },
  '/anomaly': {
    title: 'Duygusal Harcama Freni 🛑',
    subtitle: 'Stresli Anlarında Paranı Korur',
    desc: "Gece 2'de, stresli bir günün sonunda, anlık bir kararla büyük bir alışveriş mi yapmak üzeresin? FinCoach bunu fark eder ve sana \"Dur bir dakika, yarın da istiyorsan alırsın\" der. Paranı 24 saat kilitler ki sabah kafan soğuyunca karar veresin. Pişman olacağın harcamaların önüne geçen akıllı bir koruma kalkanı.",
    icon: <ScanFace size={32} color={P.red} />,
    color: P.red
  },
  '/federated': {
    title: 'Gizlilik ve Güvenlik 🛡️',
    subtitle: 'Verileriniz Sadece Sizde Kalır',
    desc: "Finansal verileriniz en hassas bilgilerinizdir. FinCoach, Apple'ın kullandığı güvenlik yaklaşımıyla çalışır: Verileriniz hiçbir zaman dışarı çıkmaz, her şey sizin cihazınızda işlenir. Yapay zeka sizi tanır ama kimse sizin verilerinize erişemez. Bankacılık düzeyinde mahremiyet, sıfır veri sızıntısı.",
    icon: <FileText size={32} color="#8B5CF6" />,
    color: "#8B5CF6"
  },
  '/tax': {
    title: 'Vergi Asistanınız 🧾',
    subtitle: 'Devletten Geri Alacağınız Parayı Bulun',
    desc: "Maaşınızdan her ay ne kadar vergi kesiliyor biliyor musunuz? Belki de hak ettiğiniz indirimlerden faydalanmıyorsunuzdur. Bu ekran gelirlerinizi ve giderlerinizi tarar, size yasal olarak geri alabileceğiniz tutarı gösterir. Freelance çalışanlar için özellikle çok faydalı — vergiden kaçmak değil, vergiyi akıllıca yönetmek.",
    icon: <Calculator size={32} color="#EC4899" />,
    color: "#EC4899"
  },
  '/graph-analysis': {
    title: 'Harcama Haritanız 🕸️',
    subtitle: 'Paranız Nereye Gidiyor, Neden Gidiyor?',
    desc: "Hiç fark ettiniz mi? Her kahve aldığınızda peşinden tatlı da alıyorsunuz. Ya da market alışverişinden sonra hep online sipariş veriyorsunuz. Bu ekran harcamalarınız arasındaki gizli bağlantıları ortaya çıkarıyor. Hangi alışkanlıkların birbirini tetiklediğini görünce, gereksiz harcamaların kökünü kesebilirsiniz.",
    icon: <Network size={32} color="#06B6D4" />,
    color: "#06B6D4"
  },
  '/debt-snowball': {
    title: 'Borçtan Kurtulma Planı ❄️',
    subtitle: 'En Az Faiz Ödeyerek En Hızlı Çıkış Yolu',
    desc: "Kredi kartı, ihtiyaç kredisi, taksitler... Hangisini önce ödemeliyim? Bu ekran tüm borçlarınızı analiz eder ve size en az faiz ödeyeceğiniz sıralamayı gösterir. Ayda ne kadar ayırırsanız ne zaman tamamen borçsuz olacağınızı hesaplar. Borç artık kontrol altında.",
    icon: <Target size={32} color={P.red} />,
    color: P.red
  },
  '/real-estate': {
    title: 'Ev Alma Rehberiniz 🏠',
    subtitle: 'Ev Almaya Ne Kadar Yakınsınız?',
    desc: "Ev almak herkesin hayali ama rakamlar korkutucu olabiliyor. Bu ekran size net cevaplar veriyor: Peşinat için ne kadar biriktirmeniz lazım, kredi çekseniz toplamda ne kadar geri ödersiniz, aylık taksitiniz ne olur? Hayalinizdeki eve giden yolu adım adım planlayın.",
    icon: <Building size={32} color="#14B8A6" />,
    color: "#14B8A6"
  },
  '/league': {
    title: 'Tasarruf Yarışması 🏆',
    subtitle: 'Diğer Kullanıcılarla Yarışın, Motivasyonunuzu Artırın',
    desc: "Para biriktirmek bazen sıkıcı olabiliyor. Ama ya bir yarışma olsa? Bu ekranda diğer FinCoach kullanıcılarıyla tasarruf oranlarınız üzerinden yarışıyorsunuz. Ne kadar çok biriktirirseniz ligde o kadar yükselirsiniz. Finansı bir oyuna çevirin — hem eğlenin hem biriktirin.",
    icon: <Trophy size={32} color={P.amber} />,
    color: P.amber
  },
  '/freelancer-smoother': {
    title: 'Gelir Dengeleyici 🌊',
    subtitle: 'Düzensiz Kazancınızı Düzenli Maaşa Çevirin',
    desc: "Serbest çalışıyorsanız bilirsiniz: Bir ay çok kazanırsınız, bir ay hiç para gelmez. Bu ekran yüksek kazançlı aylarınızdan otomatik olarak kenara koyar ve düşük aylarda size düzenli bir gelir akışı sağlar. Sanki her ay aynı maaşı alıyormuşsunuz gibi hissedersiniz. Strese son.",
    icon: <ShieldAlert size={32} color="#8B5CF6" />,
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
          
          <h4 style={{ fontSize: 13, fontWeight: 800, color: content.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>
            {content.subtitle}
          </h4>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: P.text1, letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
            {content.title}
          </h2>
          <p style={{ fontSize: 15, color: P.text2, lineHeight: 1.6, margin: '0 0 40px 0' }}>
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
