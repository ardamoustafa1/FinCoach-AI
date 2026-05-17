/**
 * SkeletonLoader — Yükleme durumu için bileşen silüeti (shimmer animasyonu).
 *
 * Üç hazır varyant:
 *   - <SkeletonLoader.Chart />     → Recharts grafik alanı silüeti
 *   - <SkeletonLoader.Card />      → KPI / stat kart silüeti
 *   - <SkeletonLoader.Row />       → İşlem listesi satır silüeti
 *   - <SkeletonLoader.Text />      → Tek satır metin silüeti
 *   - <SkeletonLoader />           → Özel boyut (width/height prop)
 *
 * Kullanım:
 *   import SkeletonLoader from '../components/SkeletonLoader';
 *   {loading ? <SkeletonLoader.Chart /> : <MyChart />}
 */

/** Temel shimmer kutusu */
function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div
      aria-hidden="true"
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Recharts grafik alanı silüeti */
function ChartSkeleton({ height = 240 }) {
  return (
    <div aria-label="Grafik yükleniyor..." style={{ width: '100%' }}>
      {/* Başlık satırı */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <SkeletonBox width={160} height={20} borderRadius={6} style={{ marginBottom: 8 }} />
          <SkeletonBox width={100} height={13} borderRadius={4} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width={40} height={30} borderRadius={8} />
          ))}
        </div>
      </div>
      {/* Grafik alanı */}
      <SkeletonBox height={height} borderRadius={12} />
      {/* X ekseni etiketleri */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBox key={i} width={36} height={11} borderRadius={4} />
        ))}
      </div>
    </div>
  );
}

/** KPI stat kart silüeti (4'lü grid için) */
function CardSkeleton() {
  return (
    <div
      aria-label="Kart yükleniyor..."
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 20,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <SkeletonBox width={80} height={11} borderRadius={4} style={{ marginBottom: 12 }} />
          <SkeletonBox width={120} height={28} borderRadius={6} style={{ marginBottom: 10 }} />
          <SkeletonBox width={70} height={12} borderRadius={4} />
        </div>
        <SkeletonBox width={46} height={46} borderRadius={14} />
      </div>
    </div>
  );
}

/** 4 adet KPI kart grid'i */
function CardGridSkeleton({ count = 4 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 16,
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** İşlem listesi satır silüeti */
function RowSkeleton({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="İşlemler yükleniyor...">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 14,
            background: 'var(--bg-surface-soft)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Kategori ikonu */}
          <SkeletonBox width={40} height={40} borderRadius={12} />
          {/* Açıklama */}
          <div style={{ flex: 1 }}>
            <SkeletonBox width={`${55 + (i % 3) * 15}%`} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBox width={`${30 + (i % 2) * 10}%`} height={11} borderRadius={4} />
          </div>
          {/* Tutar */}
          <SkeletonBox width={70} height={16} borderRadius={4} />
        </div>
      ))}
    </div>
  );
}

/** Tek satır metin silüeti */
function TextSkeleton({ width = '100%', height = 14 }) {
  return <SkeletonBox width={width} height={height} borderRadius={4} />;
}

/** Pie chart silüeti */
function PieSkeleton({ size = 160 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <SkeletonBox width={size} height={size} borderRadius={size / 2} />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SkeletonBox width={10} height={10} borderRadius={10} />
              <SkeletonBox width={60 + i * 10} height={12} borderRadius={4} />
            </div>
            <SkeletonBox width={50} height={12} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Ana bileşen + statik varyantlar
function SkeletonLoader({ width = '100%', height = 16, borderRadius = 8 }) {
  return <SkeletonBox width={width} height={height} borderRadius={borderRadius} />;
}

SkeletonLoader.Chart = ChartSkeleton;
SkeletonLoader.Card = CardSkeleton;
SkeletonLoader.CardGrid = CardGridSkeleton;
SkeletonLoader.Row = RowSkeleton;
SkeletonLoader.Text = TextSkeleton;
SkeletonLoader.Pie = PieSkeleton;

export default SkeletonLoader;
