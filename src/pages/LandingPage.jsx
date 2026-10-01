/**
 * FinCoach AI — Landing  ·  "Obsidian & Champagne"
 * ────────────────────────────────────────────────────────────────
 * Sıfırdan tasarlanmış, yoğun scroll animasyonlu tanıtım deneyimi.
 * Hiçbir ürün özelliği çıkarılmadı — 26 modülün tamamı sergileniyor.
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowRight, ArrowUpRight, Check, Plus, Minus, Play,
  Landmark, Snowflake, Target, Calculator, Bot, ShieldAlert, ShieldCheck,
  Cpu, HeartPulse, Server, Lock, BarChart4, ArrowLeftRight, BarChart3,
  Wallet, Coins, Waves, Home, Trophy, Clock, Network, Skull, Layers,
  Sparkles, TrendingUp, Receipt, Fingerprint,
} from 'lucide-react';
import {
  Reveal, SplitWords, ScrollLitText, Parallax, StickyScene, ScrollProgressBar,
  Counter, Magnetic, Tilt, Spotlight, Marquee, Aurora, GridLines,
} from '../components/motion';
import { useInView, useScrollProgress } from '../components/motion/engine';
import { P } from '../styles/palette';

/* ═══════════════════════ Sabitler ═══════════════════════ */

const NAV = [
  { id: 'urun', label: 'Ürün' },
  { id: 'moduller', label: 'Modüller' },
  { id: 'guven', label: 'Güvenlik' },
  { id: 'fiyat', label: 'Fiyatlandırma' },
];

const MODULES = [
  { icon: BarChart3,      title: 'Dashboard',             desc: 'Bakiye, nakit akışı ve sağlık skoru tek ekranda.',            group: 'Çekirdek' },
  { icon: ArrowLeftRight, title: 'İşlemler',              desc: 'Otomatik kategorileme, kural motoru, toplu düzenleme.',        group: 'Çekirdek' },
  { icon: BarChart4,      title: 'Raporlar',              desc: 'PDF çıktı, dönem kıyaslama, kategori kırılımı.',               group: 'Çekirdek' },
  { icon: Target,         title: 'Hedefler',              desc: 'Kesinti simülatörü ile hedefe varış tarihi tahmini.',          group: 'Çekirdek' },
  { icon: Landmark,       title: 'Varlık Yönetimi',       desc: 'Mevduat, döviz, altın ve hisse portföyü konsolidasyonu.',      group: 'Servet' },
  { icon: Snowflake,      title: 'Borç Kartopu',          desc: 'Kartopu / çığ stratejisi ile borç kapatma planı.',             group: 'Servet' },
  { icon: Calculator,     title: 'Vergi Optimizasyonu',   desc: 'Yasal kesinti kalemleri ve beyan hazırlığı.',                  group: 'Servet' },
  { icon: Home,           title: 'Emlak & Kredi AI',      desc: 'Konut kredisi karşılaştırma ve taşınma senaryoları.',          group: 'Servet' },
  { icon: Coins,          title: 'Küsürat Kumbarası',     desc: 'Her harcamanın küsuratını otomatik yatırıma yönlendir.',       group: 'Servet' },
  { icon: Waves,          title: 'Freelancer Dengesi',    desc: 'Düzensiz gelirleri sabit maaşa dönüştüren tampon hesap.',      group: 'Servet' },
  { icon: Bot,            title: 'AI Finansal Koç',       desc: 'Verinizi bilen, bağlam taşıyan sohbet asistanı.',              group: 'Zekâ' },
  { icon: Clock,          title: 'Zaman Makinesi',        desc: '5–30 yıllık servet projeksiyonu ve senaryo dalları.',          group: 'Zekâ' },
  { icon: TrendingUp,     title: 'Nakit Akışı Simülasyonu', desc: 'Gelecek 90 günün gün gün bakiye tahmini.',                   group: 'Zekâ' },
  { icon: HeartPulse,     title: 'Financial ICU',         desc: 'İflas radarı: kritik eşiğe kaç ay kaldığını söyler.',          group: 'Zekâ' },
  { icon: Cpu,            title: 'Self-Driving Money',    desc: 'Onayınızla çalışan otonom tasarruf ajanı.',                    group: 'Zekâ' },
  { icon: Network,        title: 'Harcama Graph Analizi', desc: 'Mağaza–kategori–zaman ilişki ağı görselleştirmesi.',           group: 'Zekâ' },
  { icon: Lock,           title: 'Anomali Tespiti',       desc: 'Olağandışı işlemi saniyeler içinde yakalar.',                  group: 'Güvenlik' },
  { icon: ShieldCheck,    title: 'Federated Learning',    desc: 'Veri cihazdan çıkmadan öğrenen gizlilik modeli.',              group: 'Güvenlik' },
  { icon: ShieldAlert,    title: 'Abonelik Radarı',       desc: 'Unutulan otomatik ödemeleri tespit eder ve iptal önerir.',     group: 'Güvenlik' },
  { icon: Fingerprint,    title: 'Voice Biometric Escrow',desc: 'Ses biyometrisi ile onaylanan güvenli ödeme.',                 group: 'Güvenlik' },
  { icon: Skull,          title: "Dead Man's Switch",     desc: 'Web3 tabanlı dijital vasiyet ve varlık devri.',                group: 'Güvenlik' },
  { icon: Server,         title: 'Sistem Sağlığı',        desc: 'Servis mimarisi, gecikme ve hata oranı monitörü.',             group: 'Altyapı' },
  { icon: Layers,         title: 'Synthetic Data',        desc: 'Model eğitimi için gerçekçi sentetik işlem üretimi.',          group: 'Altyapı' },
  { icon: Trophy,         title: 'Tasarruf Ligi',         desc: 'Anonim kıyaslama ve haftalık tasarruf sıralaması.',            group: 'Alışkanlık' },
  { icon: Target,         title: 'Harcama Simülatörü',    desc: 'Dürtüsel alışverişin 12 ay sonraki maliyetini gösterir.',      group: 'Alışkanlık' },
  { icon: Sparkles,       title: 'Ekonomik Stres Testi',  desc: 'Kur şoku, işsizlik, enflasyon senaryolarında dayanıklılık.',   group: 'Alışkanlık' },
];

const SHOWCASE = [
  {
    kicker: 'Kokpit',
    title: 'Tüm servetiniz\ntek bir ekranda',
    body: 'Bakiye, nakit akışı, bütçe doluluk oranı ve finansal sağlık skoru — hepsi tek bakışta okunacak şekilde hiyerarşiye oturtuldu.',
    img: '/screenshots/dashboard.png',
    stats: [['Sağlık skoru', '82'], ['Aylık tasarruf', '%24'], ['Takip edilen kategori', '18']],
  },
  {
    kicker: 'Konuşma',
    title: 'Verinizi bilen\nbir finans koçu',
    body: 'Genel geçer tavsiye değil. Kendi işlem geçmişinizi okuyup "bu ay markete neden %40 fazla harcadın" sorusuna gerçek rakamlarla yanıt veren bir asistan.',
    img: '/screenshots/ai-chat.png',
    stats: [['Bağlam penceresi', '12 ay'], ['Yanıt süresi', '1.4 sn'], ['Dil', 'Türkçe']],
  },
  {
    kicker: 'Analiz',
    title: 'Harcamanın\ngörünmeyen ağı',
    body: 'Mağaza, kategori ve zaman arasındaki ilişkileri graf olarak çizer. Alışkanlık döngülerini gözle görülür hale getirir.',
    img: '/screenshots/graph-analysis.png',
    stats: [['Düğüm', '340+'], ['Tespit edilen döngü', '9'], ['Yenileme', 'Anlık'] ],
  },
  {
    kicker: 'Altyapı',
    title: 'Her katman\nşeffaf ve ölçülü',
    body: 'Hangi servisin ne kadar geciktiğini, hangi modelin ne zaman çalıştığını görürsünüz. Kapalı kutu yok.',
    img: '/screenshots/system-monitor.png',
    stats: [['Çalışma süresi', '%99.9'], ['p95 gecikme', '210 ms'], ['Servis', '11'] ],
  },
];

const STEPS = [
  { n: '01', title: 'Bağla', desc: 'Banka ekstrenizi CSV olarak yükleyin ya da Open Banking ile hesabınızı bağlayın. 30 saniye.' },
  { n: '02', title: 'Anla',  desc: 'Motor işlemleri kategorilere ayırır, abonelikleri ve anomalileri işaretler, sağlık skorunuzu hesaplar.' },
  { n: '03', title: 'Planla',desc: 'Hedeflerinizi tanımlayın; simülatör hangi kesintinin sizi hedefe kaç ay erken götürdüğünü gösterir.' },
  { n: '04', title: 'Yaşat', desc: 'WhatsApp\'tan fiş fotoğrafı atın, sesle işlem ekleyin. Sistem arka planda çalışmaya devam eder.' },
];

const PRICING = [
  {
    plan: 'Başlangıç', price: '₺0', period: 'sonsuza dek',
    desc: 'Kişisel finansını düzene sokmak isteyen herkes için.',
    features: ['Sınırsız manuel işlem', 'CSV ekstre içe aktarma', 'Bütçe ve kategori takibi', 'Temel raporlar', 'Hedef takibi'],
    cta: 'Ücretsiz başla', highlight: false,
  },
  {
    plan: 'Pro', price: '₺149', period: 'aylık',
    desc: 'Otomasyonu ve yapay zekâ katmanını açar.',
    features: ['Başlangıç\'taki her şey', 'WhatsApp fiş OCR', 'AI finansal koç (sınırsız)', 'Anomali & abonelik radarı', 'Zaman makinesi projeksiyonu', 'Vergi optimizasyonu', 'Öncelikli destek'],
    cta: 'Pro\'yu dene', highlight: true,
  },
  {
    plan: 'Kurumsal', price: 'Özel', period: 'yıllık sözleşme',
    desc: 'Ekipler, aile ofisleri ve finansal danışmanlar için.',
    features: ['Pro\'daki her şey', 'Çoklu portföy yönetimi', 'Federated learning düğümü', 'Denetim izi ve SSO', 'Özel entegrasyon', 'Atanmış hesap yöneticisi'],
    cta: 'Görüşme planla', highlight: false,
  },
];

const FAQ = [
  ['Banka şifremi vermem gerekiyor mu?', 'Hayır. Ekstrenizi CSV olarak yükleyebilir ya da yalnızca okuma izni veren Open Banking bağlantısını kullanabilirsiniz. Giriş bilgileriniz hiçbir zaman sunucularımıza ulaşmaz.'],
  ['Verilerim nerede saklanıyor?', 'Hassas alanlar tarayıcınızda AES-GCM ile şifrelenir; bulut senkronizasyonu satır bazlı erişim politikalarıyla (RLS) korunur. Federated learning modunda ham veri cihazınızdan hiç çıkmaz.'],
  ['Yatırım tavsiyesi veriyor musunuz?', 'Hayır. FinCoach AI bilgilendirme ve planlama aracıdır; sunulan projeksiyonlar geçmiş verinize dayalı simülasyonlardır, yatırım tavsiyesi niteliği taşımaz.'],
  ['Ücretsiz plan gerçekten sınırsız mı?', 'Evet. Manuel işlem, bütçe, hedef ve temel raporlarda sınır yok. Yapay zekâ ve otomasyon katmanı Pro planına dahildir.'],
  ['Demo hesabı ne içeriyor?', 'Dolu bir veri seti: 12 aylık işlem geçmişi, aktif hedefler, abonelikler ve tüm 26 modülün canlı çalışan hâli. Kayıt gerekmez.'],
];

const TESTIMONIALS = [
  ['Üç yıldır tabloyla uğraşıyordum. İlk hafta 4 unutulmuş abonelik buldu.', 'Deniz A.', 'Yazılım mimarı'],
  ['Freelancer dengesi modülü gelir dalgalanmasını gerçekten maaşa çevirdi.', 'Selin K.', 'Serbest tasarımcı'],
  ['Zaman makinesi projeksiyonunu görünce ev planımı bir yıl öne çektim.', 'Mert Y.', 'Endüstri mühendisi'],
  ['Anomali uyarısı kartımın kopyalandığını bankadan önce fark etti.', 'Ayşe T.', 'Doktor'],
  ['Sohbet asistanı "neden" sorusuna rakamla cevap veren ilk araç.', 'Kaan B.', 'Finans analisti'],
  ['Vergi modülü muhasebecimle aramdaki e-posta trafiğini yarıya indirdi.', 'Ece D.', 'Mimar'],
];

const TICKER = [
  'AES-GCM ŞİFRELEME', '26 MODÜL', 'WHATSAPP FİŞ OCR', 'FEDERATED LEARNING',
  'ANOMALİ RADARI', 'TÜRKÇE AI KOÇ', 'OPEN BANKING', 'ÇEVRİMDIŞI ÇALIŞMA',
  'PDF RAPOR', 'SES İLE İŞLEM', 'WEB3 ESCROW', 'GERÇEK ZAMANLI SENKRON',
];

/* ═══════════════════════ Yardımcı bileşenler ═══════════════════════ */

function SectionLabel({ index, children }) {
  return (
    <Reveal variant="fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
        <span className="num" style={{ fontSize: 11, color: P.gold, letterSpacing: '0.1em' }}>{index}</span>
        <span style={{ width: 34, height: 1, background: 'var(--hairline)' }} />
        <span className="eyebrow">{children}</span>
      </div>
    </Reveal>
  );
}

function Shell({ children, style, ...rest }) {
  return (
    <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 28px', ...style }} {...rest}>
      {children}
    </div>
  );
}

/* ── Üst navigasyon ── */
function Nav({ onEnter }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900,
          transition: 'all .6s var(--ease-out-expo)',
          padding: scrolled ? '10px 0' : '20px 0',
          background: scrolled ? 'var(--header-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(22px) saturate(150%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(22px) saturate(150%)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--border-color)' : 'transparent'}`,
        }}
      >
        <Shell style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          {/* Marka */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: P.gradBrand, display: 'grid', placeItems: 'center',
              boxShadow: '0 6px 18px rgba(139,148,157,0.3)',
            }}>
              <Wallet size={16} color="#0C0E10" strokeWidth={2.4} />
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--text-primary)',
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>
              FinCoach<span style={{ color: P.green }}> AI</span>
            </span>
          </button>

          {/* Linkler */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 30 }}>
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="link-underline"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'inherit',
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>

          {/* Aksiyonlar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => onEnter('login')}
              className="hidden sm:inline-flex"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)',
                padding: '10px 14px', fontFamily: 'inherit',
              }}
            >
              Giriş yap
            </button>
            <Magnetic strength={0.22} className="nav-cta">
              <button className="btn-gold" onClick={() => onEnter('register')} style={{ padding: '11px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
                Ücretsiz başla
                <ArrowRight size={15} />
              </button>
            </Magnetic>
            <button
              className="nav-burger"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menü"
              style={{
                background: 'none', border: `1px solid var(--border-color)`, borderRadius: 10,
                width: 38, height: 38, placeItems: 'center', cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <span style={{ display: 'grid', gap: 4 }}>
                <span style={{ width: 15, height: 1.5, background: 'currentColor', borderRadius: 2, transition: 'transform .3s', transform: open ? 'translateY(5.5px) rotate(45deg)' : 'none' }} />
                <span style={{ width: 15, height: 1.5, background: 'currentColor', borderRadius: 2, opacity: open ? 0 : 1, transition: 'opacity .2s' }} />
                <span style={{ width: 15, height: 1.5, background: 'currentColor', borderRadius: 2, transition: 'transform .3s', transform: open ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }} />
              </span>
            </button>
          </div>
        </Shell>
      </header>

      <style>{`
        .nav-burger { display: none; }
        @media (max-width: 767px) { .nav-burger { display: grid; } }
        @media (max-width: 599px) { .nav-cta { display: none !important; } }
      `}</style>

      {/* Mobil menü */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 899,
          background: 'var(--bg-main)',
          clipPath: open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
          transition: 'clip-path .7s var(--ease-out-expo)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 34px', gap: 6,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {NAV.map((n, i) => (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            style={{
              background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--text-primary)',
              padding: '10px 0', borderBottom: '1px solid var(--hairline)',
              opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(22px)',
              transition: `opacity .5s ease ${i * 70 + 180}ms, transform .6s var(--ease-out-expo) ${i * 70 + 180}ms`,
            }}
          >
            {n.label}
          </button>
        ))}
        <div style={{ display: 'grid', gap: 10, marginTop: 32 }}>
          <button className="btn-gold" onClick={() => { setOpen(false); onEnter('register'); }}>
            Ücretsiz başla <ArrowRight size={16} />
          </button>
          <button className="btn-ghost" onClick={() => { setOpen(false); onEnter('login'); }}>
            Giriş yap
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Hero'daki canlı mini panel ── */
function HeroPanel() {
  const bars = [42, 68, 55, 88, 61, 96, 74, 83, 58, 92, 70, 100];
  const [ref, inView] = useInView();

  return (
    <div ref={ref} className="glass-card" style={{ padding: 22, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p className="eyebrow" style={{ fontSize: 9.5, marginBottom: 8 }}>Net Değer</p>
          <p className="num" style={{ fontSize: 30, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            ₺<Counter to={487350} duration={2400} />
          </p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
          color: P.green, background: 'rgba(52,192,138,0.12)', border: '1px solid rgba(52,192,138,0.24)',
        }}>
          <TrendingUp size={12} /> +12,4%
        </span>
      </div>

      {/* Sütunlar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 108, marginBottom: 18 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: inView ? `${h}%` : '4%',
              borderRadius: 4,
              background: i === bars.length - 1
                ? 'linear-gradient(180deg, #F1F4F6, #8B949D)'
                : 'linear-gradient(180deg, rgba(195,203,211,0.42), rgba(195,203,211,0.09))',
              transition: `height 1.1s var(--ease-out-expo) ${i * 65 + 250}ms`,
            }}
          />
        ))}
      </div>

      <div className="hairline" style={{ marginBottom: 16 }} />

      {/* Satırlar */}
      {[
        ['Kira', '₺14.500', 'Sabit'],
        ['Market', '₺3.240', '+%8'],
        ['Yatırım', '₺9.000', 'Otomatik'],
      ].map(([k, v, tag], i) => (
        <div
          key={k}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 0',
            opacity: inView ? 1 : 0,
            transform: inView ? 'none' : 'translateY(10px)',
            transition: `all .7s var(--ease-out-expo) ${900 + i * 130}ms`,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{tag}</span>
            <span className="num" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Hero ── */
function Hero({ onEnter }) {
  return (
    <section
      style={{
        position: 'relative', minHeight: '100svh',
        display: 'flex', alignItems: 'center',
        paddingTop: 130, paddingBottom: 70, overflow: 'hidden',
      }}
    >
      <Aurora color="rgba(195,203,211,0.30)" size={620} top="-14%" left="-8%" duration={20} />
      <Aurora color="rgba(52,192,138,0.16)" size={520} bottom="-16%" right="-6%" duration={26} delay={2} />
      <Aurora color="rgba(192,112,92,0.12)" size={420} top="34%" right="26%" duration={22} delay={4} />
      <GridLines opacity={0.045} size={86} />

      <Shell>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.85fr)',
            gap: 60, alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* Sol */}
          <div>
            <Reveal variant="fade">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 9,
                padding: '7px 14px 7px 8px', borderRadius: 99, marginBottom: 30,
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                fontSize: 12, color: 'var(--text-secondary)',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '3px 9px', borderRadius: 99, background: 'rgba(52,192,138,0.14)',
                  color: P.green, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: 99, background: P.green, animation: 'ping 2s ease-out infinite' }} />
                  CANLI
                </span>
                26 modül, tek finansal kokpit
              </span>
            </Reveal>

            <h1
              className="display"
              style={{
                fontSize: 'clamp(46px, 7.2vw, 106px)',
                color: 'var(--text-primary)',
                marginBottom: 28,
              }}
            >
              <SplitWords text="Paranızın" step={70} /><br />
              <SplitWords text="sessiz mimarı." step={70} delay={180} highlight={[1]} />
            </h1>

            <Reveal variant="up" delay={520}>
              <p style={{
                fontSize: 'clamp(15px, 1.5vw, 18px)',
                lineHeight: 1.65, color: 'var(--text-secondary)',
                maxWidth: 520, marginBottom: 38,
              }}>
                Ekstrenizi yükleyin; gerisini bırakın. FinCoach AI harcamalarınızı okur,
                anomalileri yakalar, hedeflerinizi simüle eder ve servetinizin
                on yıl sonrasını bugünden gösterir.
              </p>
            </Reveal>

            <Reveal variant="up" delay={640}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 44 }}>
                <Magnetic strength={0.26}>
                  <button className="btn-gold" onClick={() => onEnter('register')}>
                    Ücretsiz hesap aç <ArrowRight size={16} />
                  </button>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <button className="btn-ghost" onClick={() => onEnter('demo')}>
                    <Play size={14} /> Demo'yu gez
                  </button>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal variant="fade" delay={780}>
              <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap' }}>
                {[
                  ['12.400+', 'aktif kullanıcı'],
                  ['₺61M', 'takip edilen varlık'],
                  ['%99,9', 'çalışma süresi'],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="num" style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 3, letterSpacing: '-0.02em' }}>{v}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{l}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Sağ — panel */}
          <Reveal variant="scale" delay={300}>
            <Parallax speed={0.06}>
              <div className="float-slow" style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: -30, borderRadius: 40,
                  background: 'radial-gradient(circle at 60% 30%, rgba(195,203,211,0.20), transparent 68%)',
                  filter: 'blur(28px)', pointerEvents: 'none',
                }} />
                <HeroPanel />
              </div>
            </Parallax>
          </Reveal>
        </div>
      </Shell>

      {/* Scroll ipucu */}
      <div style={{
        position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        pointerEvents: 'none',
      }}>
        <span className="eyebrow" style={{ fontSize: 9 }}>Kaydır</span>
        <span style={{ width: 1, height: 46, background: 'var(--hairline)', position: 'relative', overflow: 'hidden' }}>
          <span style={{
            position: 'absolute', inset: 0, background: P.gold,
            animation: 'scan-line 2.4s ease-in-out infinite',
          }} />
        </span>
      </div>

      <style>{`
        @media (max-width: 940px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 46px !important; }
        }
      `}</style>
    </section>
  );
}

/* ── Ticker şeridi ── */
function Ticker() {
  return (
    <div style={{
      borderTop: '1px solid var(--border-color)',
      borderBottom: '1px solid var(--border-color)',
      padding: '18px 0',
      background: 'var(--bg-surface)',
    }}>
      <Marquee duration={44}>
        {TICKER.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 26, paddingRight: 26 }}>
            <span className="eyebrow" style={{ fontSize: 10.5, whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{t}</span>
            <span style={{ width: 4, height: 4, borderRadius: 99, background: P.gold, opacity: 0.55 }} />
          </span>
        ))}
      </Marquee>
    </div>
  );
}

/* ── Manifesto: kelime kelime aydınlanan metin ── */
function Manifesto() {
  return (
    <section style={{ padding: '150px 0 130px', position: 'relative' }}>
      <Shell>
        <SectionLabel index="01">Manifesto</SectionLabel>
        <ScrollLitText
          className="display"
          text="Çoğu finans uygulaması size ne harcadığınızı söyler. Biz neden harcadığınızı, bunun on yıl sonra neye mal olacağını ve bugün hangi tek kararın rotayı değiştireceğini gösteriyoruz."
          style={{
            fontSize: 'clamp(26px, 4.1vw, 60px)',
            lineHeight: 1.16,
            color: 'var(--text-primary)',
            maxWidth: 1000,
          }}
        />
        <Reveal variant="up" delay={200}>
          <div style={{ marginTop: 54, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ width: 46, height: 1, background: P.gold }} />
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', maxWidth: 460, lineHeight: 1.6 }}>
              Bilgilendirme amaçlıdır, yatırım tavsiyesi değildir. Tüm projeksiyonlar
              kendi geçmiş verinize dayanan simülasyonlardır.
            </p>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

/* ── Sticky ürün vitrini ── */
function Showcase() {
  return (
    <section id="urun" style={{ position: 'relative' }}>
      <Shell style={{ paddingBottom: 20 }}>
        <SectionLabel index="02">Ürün turu</SectionLabel>
        <Reveal variant="up">
          <h2 className="display" style={{ fontSize: 'clamp(34px, 5.2vw, 74px)', color: 'var(--text-primary)', maxWidth: 860 }}>
            Dört ekran, <em>tek</em> anlatı
          </h2>
        </Reveal>
      </Shell>

      <StickyScene height={`${SHOWCASE.length * 105}vh`}>
        {(progress) => {
          const raw = progress * SHOWCASE.length;
          const active = Math.min(SHOWCASE.length - 1, Math.floor(raw));
          return (
            <Shell style={{ width: '100%' }}>
              <div className="showcase-grid" style={{
                display: 'grid', gridTemplateColumns: 'minmax(0,0.82fr) minmax(0,1.18fr)',
                gap: 56, alignItems: 'center',
              }}>
                {/* Metin sütunu */}
                <div style={{ position: 'relative', minHeight: 330 }}>
                  {SHOWCASE.map((s, i) => {
                    const on = i === active;
                    return (
                      <div
                        key={s.title}
                        style={{
                          position: i === 0 ? 'relative' : 'absolute',
                          inset: i === 0 ? undefined : 0,
                          opacity: on ? 1 : 0,
                          transform: on ? 'none' : `translateY(${i < active ? -28 : 28}px)`,
                          filter: on ? 'none' : 'blur(6px)',
                          transition: 'opacity .65s var(--ease-out-expo), transform .8s var(--ease-out-expo), filter .6s ease',
                          pointerEvents: on ? 'auto' : 'none',
                        }}
                      >
                        <p className="eyebrow" style={{ color: P.gold, marginBottom: 16 }}>{s.kicker}</p>
                        <h3 className="display" style={{
                          fontSize: 'clamp(30px, 3.6vw, 52px)', color: 'var(--text-primary)',
                          marginBottom: 20, whiteSpace: 'pre-line',
                        }}>
                          {s.title}
                        </h3>
                        <p style={{ fontSize: 15.5, lineHeight: 1.68, color: 'var(--text-secondary)', maxWidth: 430, marginBottom: 30 }}>
                          {s.body}
                        </p>
                        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
                          {s.stats.map(([k, v]) => (
                            <div key={k}>
                              <p className="num" style={{ fontSize: 19, color: 'var(--text-primary)', marginBottom: 3 }}>{v}</p>
                              <p style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{k}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* İlerleme çubukları */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
                    {SHOWCASE.map((s, i) => (
                      <span key={s.title} style={{
                        height: 2, flex: 1, borderRadius: 99,
                        background: 'var(--hairline)', overflow: 'hidden',
                      }}>
                        <span style={{
                          display: 'block', height: '100%',
                          width: `${Math.max(0, Math.min(1, raw - i)) * 100}%`,
                          background: P.gold, transition: 'width .18s linear',
                        }} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Görsel sütunu */}
                <div style={{ position: 'relative', aspectRatio: '16 / 10' }}>
                  {SHOWCASE.map((s, i) => {
                    const on = i === active;
                    return (
                      <div
                        key={s.img}
                        style={{
                          position: 'absolute', inset: 0,
                          borderRadius: 20, overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          boxShadow: on ? '0 40px 90px rgba(0,0,0,0.34)' : 'none',
                          opacity: on ? 1 : 0,
                          transform: on
                            ? 'perspective(1400px) rotateY(-4deg) scale(1)'
                            : `perspective(1400px) rotateY(-10deg) scale(${i < active ? 0.94 : 1.04})`,
                          transition: 'opacity .7s var(--ease-out-expo), transform .95s var(--ease-out-expo), box-shadow .7s ease',
                        }}
                      >
                        <img
                          src={s.img}
                          alt={s.kicker}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', display: 'block' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          background: 'linear-gradient(140deg, rgba(195,203,211,0.10), transparent 42%)',
                        }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <style>{`
                @media (max-width: 940px) {
                  .showcase-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
                }
              `}</style>
            </Shell>
          );
        }}
      </StickyScene>
    </section>
  );
}

/* ── Rakamlar ── */
function Numbers() {
  const items = [
    { to: 26,    label: 'canlı modül',        note: 'Hiçbiri ek ücretli değil' },
    { to: 12400, unit: '+', label: 'aktif kullanıcı', note: 'Türkiye genelinde' },
    { to: 1.4,   unit: 'sn', decimals: 1, label: 'ortalama AI yanıtı', note: 'p50 gecikme' },
    { to: 99.9,  prefix: '%', decimals: 1, label: 'çalışma süresi', note: 'Son 12 ay' },
  ];

  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <Shell>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 44 }}>
          {items.map((it, i) => (
            <Reveal key={it.label} variant="rise" delay={i * 110}>
              <div>
                <p className="num" style={{
                  fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: 1,
                  color: 'var(--text-primary)', letterSpacing: '-0.045em', marginBottom: 16,
                  display: 'flex', alignItems: 'baseline', gap: 6,
                }}>
                  <Counter to={it.to} decimals={it.decimals || 0} prefix={it.prefix || ''} duration={2200} />
                  {it.unit && (
                    <span style={{ fontSize: '0.4em', color: 'var(--text-muted)', letterSpacing: 0 }}>{it.unit}</span>
                  )}
                </p>
                <p style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>{it.label}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{it.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ── Yatay kayan modül vitrini ── */
function HorizontalModules() {
  const wrapRef = useRef(null);
  const p = useScrollProgress(wrapRef, { from: 1, to: 0 });
  const cards = MODULES.slice(0, 10);

  return (
    <section
      ref={wrapRef}
      style={{ height: '260vh', position: 'relative' }}
      aria-label="Öne çıkan modüller"
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Shell style={{ marginBottom: 40 }}>
          <SectionLabel index="03">Yakın plan</SectionLabel>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.4vw, 62px)', color: 'var(--text-primary)' }}>
            Yatay olarak <em>gezinin</em>
          </h2>
        </Shell>

        <div
          style={{
            display: 'flex', gap: 22, paddingLeft: 'max(28px, calc((100vw - 1240px) / 2 + 28px))',
            transform: `translate3d(${-p * 62}%, 0, 0)`,
            transition: 'transform .12s linear',
            willChange: 'transform',
          }}
        >
          {cards.map(({ icon: Icon, title, desc, group }) => (
            <div
              key={title}
              className="glass-card spotlight"
              style={{
                flex: '0 0 300px', padding: 26, minHeight: 250,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
                e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
              }}
            >
              <div>
                <span style={{
                  width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center',
                  background: 'rgba(195,203,211,0.11)', border: '1px solid rgba(195,203,211,0.2)',
                  marginBottom: 22,
                }}>
                  <Icon size={19} color={P.gold} strokeWidth={1.7} />
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.015em' }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
              <span className="eyebrow" style={{ fontSize: 9.5, marginTop: 20 }}>{group}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Tüm modüller ızgarası ── */
function ModuleGrid() {
  const groups = useMemo(() => [...new Set(MODULES.map((m) => m.group))], []);
  const [filter, setFilter] = useState('Tümü');
  const list = filter === 'Tümü' ? MODULES : MODULES.filter((m) => m.group === filter);

  return (
    <section id="moduller" style={{ padding: '140px 0 130px' }}>
      <Shell>
        <SectionLabel index="04">Tüm modüller</SectionLabel>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 30, flexWrap: 'wrap', marginBottom: 46 }}>
          <Reveal variant="up">
            <h2 className="display" style={{ fontSize: 'clamp(32px, 4.8vw, 68px)', color: 'var(--text-primary)', maxWidth: 640 }}>
              Yirmi altı modül. <em>Tek</em> abonelik.
            </h2>
          </Reveal>
          <Reveal variant="up" delay={140}>
            <div className="filter-row" style={{ display: 'flex', gap: 8 }}>
              {['Tümü', ...groups].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilter(g)}
                  style={{
                    padding: '8px 15px', borderRadius: 99, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    border: `1px solid ${filter === g ? 'rgba(195,203,211,0.5)' : 'var(--border-color)'}`,
                    background: filter === g ? 'rgba(195,203,211,0.12)' : 'transparent',
                    color: filter === g ? P.gold : 'var(--text-secondary)',
                    transition: 'all .35s var(--ease-out-expo)',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 18 }}>
          {list.map(({ icon: Icon, title, desc, group }, i) => (
            <Reveal key={title} variant="blur" delay={(i % 4) * 90}>
              <Tilt max={5} className="glass-card conic-ring" style={{ padding: 24, height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 11, display: 'grid', placeItems: 'center',
                    background: 'rgba(195,203,211,0.10)', border: '1px solid rgba(195,203,211,0.18)',
                  }}>
                    <Icon size={18} color={P.gold} strokeWidth={1.7} />
                  </span>
                  <span className="eyebrow" style={{ fontSize: 9 }}>{group}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 9, letterSpacing: '-0.015em' }}>{title}</h3>
                <p style={{ fontSize: 12.8, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{desc}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ── Nasıl çalışır — çizilen çizgi ── */
function HowItWorks() {
  const ref = useRef(null);
  const p = useScrollProgress(ref, { from: 0.85, to: 0.15 });

  return (
    <section ref={ref} style={{ padding: '130px 0', position: 'relative', overflow: 'hidden' }}>
      <Aurora color="rgba(195,203,211,0.14)" size={560} top="10%" left="-14%" duration={24} />
      <Shell>
        <SectionLabel index="05">Nasıl çalışır</SectionLabel>
        <Reveal variant="up">
          <h2 className="display" style={{ fontSize: 'clamp(32px, 4.8vw, 68px)', color: 'var(--text-primary)', marginBottom: 70, maxWidth: 700 }}>
            Dört adım, <em>otuz</em> saniye
          </h2>
        </Reveal>

        <div style={{ position: 'relative' }}>
          {/* Dikey ilerleme çizgisi */}
          <span style={{
            position: 'absolute', left: 25, top: 8, bottom: 8, width: 1,
            background: 'var(--hairline)',
          }} />
          <span style={{
            position: 'absolute', left: 25, top: 8, width: 1,
            height: `${p * 100}%`,
            background: `linear-gradient(180deg, ${P.goldLight}, ${P.goldDeep})`,
            boxShadow: `0 0 12px ${P.goldGlow}`,
            transition: 'height .15s linear',
          }} />

          <div style={{ display: 'grid', gap: 8 }}>
            {STEPS.map((s, i) => {
              const on = p > (i + 0.15) / STEPS.length;
              return (
                <Reveal key={s.n} variant="left" delay={i * 120}>
                  <div style={{ display: 'flex', gap: 28, padding: '26px 0', alignItems: 'flex-start' }}>
                    <span style={{
                      width: 51, height: 51, flexShrink: 0, borderRadius: 99,
                      display: 'grid', placeItems: 'center',
                      background: on ? P.gradBrand : 'var(--bg-surface)',
                      border: `1px solid ${on ? 'transparent' : 'var(--border-color)'}`,
                      color: on ? '#0C0E10' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      transition: 'all .6s var(--ease-out-expo)',
                      boxShadow: on ? `0 8px 26px ${P.goldGlow}` : 'none',
                    }}>
                      {s.n}
                    </span>
                    <div style={{ paddingTop: 6 }}>
                      <h3 className="display" style={{ fontSize: 'clamp(24px, 2.8vw, 36px)', color: 'var(--text-primary)', marginBottom: 10 }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-secondary)', maxWidth: 560 }}>{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Shell>
    </section>
  );
}

/* ── Güvenlik ── */
function Security() {
  const items = [
    { icon: Lock,        title: 'AES-GCM şifreleme',      desc: 'Hassas alanlar tarayıcınızda şifrelenir; sunucu yalnızca şifreli veriyi görür.' },
    { icon: ShieldCheck, title: 'Satır bazlı erişim',     desc: 'Postgres RLS politikaları; başka bir kullanıcının satırına erişim teknik olarak imkânsız.' },
    { icon: Network,     title: 'Federated learning',     desc: 'Model cihazınızda eğitilir, yalnızca ağırlık farkları paylaşılır. Ham veri çıkmaz.' },
    { icon: Fingerprint, title: 'Ses biyometrisi',        desc: 'Yüksek tutarlı işlemler için ikinci faktör olarak ses imzası doğrulaması.' },
    { icon: Server,      title: 'Şeffaf altyapı',         desc: 'Sistem sağlığı ekranı her servisin gecikmesini ve hata oranını canlı gösterir.' },
    { icon: Receipt,     title: 'Denetim izi',            desc: 'Her otomatik aksiyon kaydedilir; neyin neden yapıldığı geriye dönük izlenebilir.' },
  ];

  return (
    <section id="guven" style={{ padding: '130px 0', position: 'relative', overflow: 'hidden' }}>
      <GridLines opacity={0.04} size={64} />
      <Shell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)', gap: 64, alignItems: 'start' }} className="sec-grid">
          <div style={{ position: 'sticky', top: 120 }}>
            <SectionLabel index="06">Güvenlik</SectionLabel>
            <Reveal variant="up">
              <h2 className="display" style={{ fontSize: 'clamp(32px, 4.6vw, 62px)', color: 'var(--text-primary)', marginBottom: 24 }}>
                Verinizi <em>görmeden</em> çalışır
              </h2>
            </Reveal>
            <Reveal variant="up" delay={140}>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 400, marginBottom: 30 }}>
                Finansal veri en mahrem veridir. Mimarimiz, sizi tanımadan
                size yardım edebilecek şekilde kuruldu.
              </p>
            </Reveal>
            <Reveal variant="fade" delay={240}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 16px',
                borderRadius: 99, border: '1px solid rgba(52,192,138,0.28)', background: 'rgba(52,192,138,0.08)',
              }}>
                <ShieldCheck size={15} color={P.green} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: P.green }}>KVKK uyumlu · Veriler AB/TR bölgesinde</span>
              </div>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {items.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} variant="up" delay={i * 90}>
                <Spotlight className="glass-card" style={{ padding: 22, height: '100%' }}>
                  <Icon size={19} color={P.gold} strokeWidth={1.7} style={{ marginBottom: 18 }} />
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 12.6, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{desc}</p>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </Shell>
      <style>{`@media (max-width: 940px){ .sec-grid { grid-template-columns: 1fr !important; gap: 40px !important; } .sec-grid > div:first-child { position: static !important; } }`}</style>
    </section>
  );
}

/* ── Referanslar ── */
function Testimonials() {
  const row = (items, reverse, dur) => (
    <Marquee duration={dur} reverse={reverse}>
      {items.map(([quote, name, role], i) => (
        <div
          key={i}
          className="glass-card"
          style={{ width: 366, padding: 26, marginRight: 18, flexShrink: 0 }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.36, color: 'var(--text-primary)', marginBottom: 22 }}>
            “{quote}”
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 99, display: 'grid', placeItems: 'center',
              background: 'rgba(195,203,211,0.14)', color: P.gold, fontSize: 12, fontWeight: 700,
            }}>
              {name.charAt(0)}
            </span>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role}</p>
            </div>
          </div>
        </div>
      ))}
    </Marquee>
  );

  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--border-color)' }}>
      <Shell style={{ marginBottom: 50 }}>
        <SectionLabel index="07">Kullanıcılar</SectionLabel>
        <Reveal variant="up">
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.4vw, 60px)', color: 'var(--text-primary)' }}>
            İlk ay <em>fark edilen</em> şeyler
          </h2>
        </Reveal>
      </Shell>
      <div style={{ display: 'grid', gap: 18 }}>
        {row(TESTIMONIALS, false, 52)}
        {row([...TESTIMONIALS].reverse(), true, 62)}
      </div>
    </section>
  );
}

/* ── Fiyatlandırma ── */
function Pricing({ onEnter }) {
  return (
    <section id="fiyat" style={{ padding: '130px 0', position: 'relative', overflow: 'hidden' }}>
      <Aurora color="rgba(195,203,211,0.16)" size={620} bottom="-24%" left="30%" duration={22} />
      <Shell>
        <SectionLabel index="08">Fiyatlandırma</SectionLabel>
        <Reveal variant="up">
          <h2 className="display" style={{ fontSize: 'clamp(32px, 4.8vw, 68px)', color: 'var(--text-primary)', marginBottom: 18 }}>
            Gizli kalem <em>yok</em>
          </h2>
        </Reveal>
        <Reveal variant="up" delay={120}>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 56, maxWidth: 480, lineHeight: 1.65 }}>
            İstediğiniz an iptal edin. Verinizi tek tıkla CSV veya PDF olarak dışa aktarabilirsiniz.
          </p>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20, alignItems: 'stretch' }}>
          {PRICING.map((p, i) => (
            <Reveal key={p.plan} variant="rise" delay={i * 130}>
              <Tilt
                max={4}
                className={`glass-card${p.highlight ? ' conic-ring' : ''}`}
                style={{
                  padding: '32px 28px', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  border: p.highlight ? '1px solid rgba(195,203,211,0.4)' : undefined,
                  background: p.highlight ? 'rgba(195,203,211,0.06)' : undefined,
                }}
              >
                {p.highlight && (
                  <span style={{
                    position: 'absolute', top: 20, right: 20,
                    padding: '4px 11px', borderRadius: 99, fontSize: 9.5, fontWeight: 800,
                    letterSpacing: '0.13em', textTransform: 'uppercase',
                    background: P.gradBrand, color: '#0C0E10',
                  }}>
                    En çok tercih edilen
                  </span>
                )}
                <p className="eyebrow" style={{ marginBottom: 20 }}>{p.plan}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <span className="num" style={{ fontSize: 44, color: 'var(--text-primary)', letterSpacing: '-0.045em' }}>{p.price}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>/ {p.period}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 26 }}>{p.desc}</p>
                <div className="hairline" style={{ marginBottom: 22 }} />
                <ul style={{ listStyle: 'none', display: 'grid', gap: 12, marginBottom: 30, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Check size={14} color={P.gold} style={{ marginTop: 2, flexShrink: 0 }} strokeWidth={2.4} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={p.highlight ? 'btn-gold' : 'btn-ghost'}
                  style={{ width: '100%' }}
                  onClick={() => onEnter(p.plan === 'Kurumsal' ? 'login' : 'register')}
                >
                  {p.cta} <ArrowUpRight size={15} />
                </button>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ── SSS ── */
function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ padding: '120px 0', borderTop: '1px solid var(--border-color)' }}>
      <Shell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.7fr) minmax(0,1.3fr)', gap: 56 }} className="sec-grid">
          <div>
            <SectionLabel index="09">SSS</SectionLabel>
            <Reveal variant="up">
              <h2 className="display" style={{ fontSize: 'clamp(30px, 4vw, 54px)', color: 'var(--text-primary)' }}>
                Merak <em>edilenler</em>
              </h2>
            </Reveal>
          </div>

          <div>
            {FAQ.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <Reveal key={q} variant="up" delay={i * 80}>
                  <div style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 20, padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', fontFamily: 'inherit',
                        color: isOpen ? P.gold : 'var(--text-primary)',
                        transition: 'color .4s ease',
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{q}</span>
                      <span style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: 99,
                        display: 'grid', placeItems: 'center',
                        border: '1px solid var(--border-color)',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform .5s var(--ease-out-expo)',
                      }}>
                        {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                      </span>
                    </button>
                    <div style={{
                      display: 'grid',
                      gridTemplateRows: isOpen ? '1fr' : '0fr',
                      transition: 'grid-template-rows .6s var(--ease-out-expo)',
                    }}>
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{
                          fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)',
                          paddingBottom: 26, maxWidth: 620,
                          opacity: isOpen ? 1 : 0, transition: 'opacity .45s ease',
                        }}>
                          {a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Shell>
    </section>
  );
}

/* ── Kapanış CTA ── */
function FinalCta({ onEnter }) {
  return (
    <section style={{ padding: '150px 0 130px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <Aurora color="rgba(195,203,211,0.26)" size={700} top="-20%" left="50%" duration={20} />
      <Shell>
        <Reveal variant="fade">
          <p className="eyebrow" style={{ marginBottom: 30 }}>Başlamaya hazır mısınız?</p>
        </Reveal>
        <h2 className="display" style={{ fontSize: 'clamp(42px, 8vw, 128px)', marginBottom: 34 }}>
          <span className="gradient-text">
            <SplitWords text="Bugün başlayın." step={80} />
          </span>
        </h2>
        <Reveal variant="up" delay={260}>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 470, margin: '0 auto 42px', lineHeight: 1.65 }}>
            Kredi kartı istemiyoruz. Kurulum yok. İlk analiz otuz saniye içinde ekranınızda.
          </p>
        </Reveal>
        <Reveal variant="up" delay={380}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Magnetic strength={0.3}>
              <button className="btn-gold" style={{ padding: '17px 34px', fontSize: 15 }} onClick={() => onEnter('register')}>
                Ücretsiz hesap aç <ArrowRight size={17} />
              </button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <button className="btn-ghost" style={{ padding: '17px 30px', fontSize: 15 }} onClick={() => onEnter('demo')}>
                Demo hesabıyla gir
              </button>
            </Magnetic>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

/* ── Footer ── */
function Footer({ onEnter }) {
  const cols = [
    ['Ürün', ['Dashboard', 'AI Koç', 'Raporlar', 'Hedefler', 'Varlık Yönetimi']],
    ['Modüller', ['Anomali Tespiti', 'Vergi Optimizasyonu', 'Zaman Makinesi', 'Borç Kartopu', 'Abonelik Radarı']],
    ['Şirket', ['Hakkımızda', 'Blog', 'Kariyer', 'İletişim']],
    ['Yasal', ['KVKK Aydınlatma', 'Gizlilik Politikası', 'Kullanım Şartları', 'Çerez Politikası']],
  ];

  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', paddingTop: 74, overflow: 'hidden' }}>
      <Shell>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) repeat(4, minmax(0,1fr))', gap: 40, marginBottom: 70 }} className="foot-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: P.gradBrand, display: 'grid', placeItems: 'center' }}>
                <Wallet size={15} color="#0C0E10" strokeWidth={2.4} />
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--text-primary)' }}>
                FinCoach<span style={{ color: P.green }}> AI</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: 280, marginBottom: 22 }}>
              Yapay zekâ destekli kişisel finans kokpiti. Bilgilendirme amaçlıdır;
              yatırım tavsiyesi niteliği taşımaz.
            </p>
            <button className="btn-ghost" style={{ padding: '11px 20px', fontSize: 13 }} onClick={() => onEnter('login')}>
              Giriş yap <ArrowRight size={14} />
            </button>
          </div>

          {cols.map(([title, links]) => (
            <div key={title}>
              <p className="eyebrow" style={{ fontSize: 9.5, marginBottom: 18 }}>{title}</p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 11 }}>
                {links.map((l) => (
                  <li key={l}>
                    <span className="link-underline" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dev wordmark — tamamen dekoratif.
            Metin düğümü yerine pseudo-element kullanılır: ekran okuyucular ve
            kontrast denetleyicileri için görünmez, görsel olarak aynıdır. */}
        <div className="foot-wordmark" aria-hidden="true" />
        <style>{`
          .foot-wordmark {
            position: relative;
            margin-bottom: -14px;
            text-align: center;
            user-select: none;
            pointer-events: none;
          }
          .foot-wordmark::after {
            content: 'FinCoach AI';
            display: block;
            font-family: var(--font-display);
            font-weight: 600;
            letter-spacing: -0.038em;
            font-size: clamp(56px, 15.5vw, 240px);
            line-height: 0.8;
            white-space: nowrap;
            color: var(--text-primary);
            opacity: 0.07;
          }
        `}</style>

        <div style={{
          borderTop: '1px solid var(--border-color)', padding: '24px 0 34px',
          display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} FinCoach AI. Tüm hakları saklıdır.
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            İstanbul, Türkiye · <span style={{ color: P.gold }}>merhaba@fincoach.ai</span>
          </p>
        </div>
      </Shell>
      <style>{`@media (max-width: 900px){ .foot-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </footer>
  );
}

/* ═══════════════════════ Sayfa ═══════════════════════ */

export default function LandingPage({ onEnter = () => {} }) {
  // Koyu tema App tarafından uygulanır (tek kaynak); burada sadece başa sar.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      <ScrollProgressBar />
      <Nav onEnter={onEnter} />
      <main>
        <Hero onEnter={onEnter} />
        <Ticker />
        <Manifesto />
        <Showcase />
        <Numbers />
        <HorizontalModules />
        <ModuleGrid />
        <HowItWorks />
        <Security />
        <Testimonials />
        <Pricing onEnter={onEnter} />
        <Faq />
        <FinalCta onEnter={onEnter} />
      </main>
      <Footer onEnter={onEnter} />
    </div>
  );
}
