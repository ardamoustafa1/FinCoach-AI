/**
 * FinCoach AI - Harcama Kişilik Tipi Tespit Motoru
 */

// ─── Tip Tanımları ────────────────────────────────────────────
export const TIPLER = {
  anlık_zevk: {
    id: 'anlık_zevk',
    ad: 'Anlık Zevk Takipçisi',
    emoji: '🎉',
    renk: '#f97316',
    bg: 'from-orange-500/20 to-rose-500/10',
    border: 'border-orange-500/30',
    glow: '#f97316',
    aciklama: 'Yaşamın tadını çıkarmayı seven, anı yaşayan bir harcama profiline sahipsin.',
    guclu: 'Hayatın tadını çıkarıyor, sosyal ilişkilere yatırım yapıyorsun.',
    dikkat: 'Hafta sonu harcamaların yüksek, ay sonunda nakit sıkışıklığı riski var.',
    tavsiyeler: [
      '💡 Hafta sonu için önceden haftalık bütçe belirle',
      '📅 Ay sonu için küçük bir acil rezerv oluştur',
      '🔔 Cumartesi alışverişlerinde harcama limiti kur',
    ],
  },
  planlayici: {
    id: 'planlayici',
    ad: 'Planlayıcı',
    emoji: '📋',
    renk: '#6366f1',
    bg: 'from-indigo-500/20 to-purple-500/10',
    border: 'border-indigo-500/30',
    glow: '#6366f1',
    aciklama: 'Sistematik ve öngörülü bir yaklaşımla finansını yönetiyorsun.',
    guclu: 'Bütçeye sadık, sürpriz harcamalara hazırlıklısın.',
    dikkat: 'Aşırı planlama zaman zaman iyi fırsatları kaçırmana neden olabilir.',
    tavsiyeler: [
      '🎯 "Fırsat fonu" oluşturarak anlık iyi tekliflere hazırlıklı ol',
      '📊 Planını 3 ayda bir gözden geçir, gereksiz otomatik ödemeleri kes',
      '✨ Küçük ödüller için kendin için de bütçe ayır',
    ],
  },
  tasarruf_ustasi: {
    id: 'tasarruf_ustasi',
    ad: 'Tasarruf Ustası',
    emoji: '🏆',
    renk: '#10b981',
    bg: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/30',
    glow: '#10b981',
    aciklama: 'Agresif biriktirme alışkanlığıyla finansal hedeflerine hızla ulaşıyorsun.',
    guclu: 'Yüksek tasarruf oranı, hızlı birikim ve net hedefler.',
    dikkat: 'Aşırı kısıtlama uzun vadede motivasyon kaybına yol açabilir.',
    tavsiyeler: [
      '🎁 Kendin için aylık küçük bir "ödül bütçesi" koy (%3–5)',
      '📈 Birikimini enflasyona karşı yatırım araçlarına yönlendir',
      '⚖️ Sosyal harcamalara biraz daha pay ayır, ilişkiler de yatırım',
    ],
  },
  durtüsel: {
    id: 'durtüsel',
    ad: 'Dürtüsel Alışverişçi',
    emoji: '⚡',
    renk: '#ef4444',
    bg: 'from-red-500/20 to-pink-500/10',
    border: 'border-red-500/30',
    glow: '#ef4444',
    aciklama: 'Anlık fırsatlara hızlı tepki veriyor, kampanyaları kaçırmıyorsun.',
    guclu: 'Kampanya ve fırsatları iyi değerlendiriyor, dinamik bir alışveriş stili var.',
    dikkat: 'Anlık kararlar ay sonunda bütçeni zorluyor.',
    tavsiyeler: [
      '⏳ Alışveriş öncesi 24 saat kuralı: büyük harcamaları 1 gün beklet',
      '🛒 Alışverişe liste ile çık, listede olmayan ürünleri sepete koyma',
      '💳 Kredi kartı limitini düşür, nakit/debit kart kullan',
    ],
  },
  dengeli: {
    id: 'dengeli',
    ad: 'Dengeli Harcayan',
    emoji: '⚖️',
    renk: '#3b82f6',
    bg: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/30',
    glow: '#3b82f6',
    aciklama: 'Tutarlı ve öngörülebilir bir finansal profile sahipsin.',
    guclu: 'Düzenli ve istikrarlı harcama alışkanlıkları, stres düşük.',
    dikkat: 'Daha agresif tasarruf veya yatırım fırsatlarını zaman zaman kaçırıyorsun.',
    tavsiyeler: [
      '📈 Tasarruf oranını %5 artırmayı hedefle — çok şey hissetmezsin',
      '🎯 Bir finansal hedef belirle, birikimini ona göre yönlendir',
      '💡 Yatırım araçlarını araştır, paranı çalıştır',
    ],
  },
};

// ─── Tip Tespit Fonksiyonu (K-Means / Oklid Uzaklığı) ───────────
export function kisilikTipiBelirle(islemler) {
  if (!islemler || islemler.length === 0) return TIPLER.dengeli;

  const toplam = islemler.reduce((s, i) => s + (i.tutar || 0), 0);
  if (toplam === 0) return TIPLER.dengeli;

  // 1. Hafta Sonu Oranı (0.0 - 1.0)
  const haftaSonu = islemler.filter((i) => {
    if (!i.tarih) return false;
    const gun = new Date(i.tarih).getDay();
    return gun === 0 || gun === 6;
  }).reduce((s, i) => s + i.tutar, 0);
  const haftaSonuOrani = Math.min(1, haftaSonu / toplam);

  // 2. Tasarruf Oranı (0.0 - 1.0)
  let aylikGelir = 18000;
  try {
    const profil = JSON.parse(localStorage.getItem('fincoach_profile') || '{}');
    if (profil.income && Number(profil.income) > 0) aylikGelir = Number(profil.income);
  } catch { /* ignore */ }
  // Tahmini 3 aylık pencere gibi düşünelim (veya ortalama aya vurursak 1 aylık)
  const tasarrufOrani = Math.max(0, Math.min(1, (aylikGelir - (toplam / (islemler.length > 20 ? 3 : 1))) / aylikGelir));

  // 3. Tekrarlayan Harcama Oranı (0.0 - 1.0)
  const magazaSayac = {};
  islemler.forEach((i) => {
    if (i.magaza) magazaSayac[i.magaza] = (magazaSayac[i.magaza] || 0) + 1;
  });
  const tekrarayanToplam = islemler
    .filter((i) => i.magaza && magazaSayac[i.magaza] > 1)
    .reduce((s, i) => s + i.tutar, 0);
  const tekrarlayanOran = Math.min(1, tekrarayanToplam / toplam);

  // 4. Dürtüsel Skor (0.0 - 1.0)
  const sirali = [...islemler].sort((a, b) => b.tutar - a.tutar);
  const esik = sirali[Math.floor(sirali.length * 0.2)]?.tutar || 0;
  const anlikBuyukAdet = islemler.filter((i) => i.tutar >= esik * 1.5).length;
  const durtuselSkor = Math.min(1, anlikBuyukAdet / 10); // 10+ büyük harcama = 1.0 max

  // Kullanıcı Vektörü: [haftaSonu, tasarruf, tekrarlayan, durtusel]
  const userVector = [haftaSonuOrani, tasarrufOrani, tekrarlayanOran, durtuselSkor];

  // Algoritma: K-Means Centroid'leri (Önceden Eğitilmiş Merkezler)
  const centroids = {
    anlık_zevk:      [0.60, 0.05, 0.20, 0.50],
    tasarruf_ustasi: [0.10, 0.40, 0.60, 0.10],
    planlayici:      [0.20, 0.20, 0.85, 0.15],
    durtüsel:        [0.40, 0.05, 0.30, 0.85],
    dengeli:         [0.25, 0.15, 0.50, 0.25],
  };

  // Euclidean Distance (Öklid Mesafesi) Hesaplama
  let enYakinId = 'dengeli';
  let minMesafe = Infinity;

  for (const [id, merkez] of Object.entries(centroids)) {
    let mesafeKareToplami = 0;
    for (let i = 0; i < 4; i++) {
      mesafeKareToplami += Math.pow(userVector[i] - merkez[i], 2);
    }
    const mesafe = Math.sqrt(mesafeKareToplami);
    
    if (mesafe < minMesafe) {
      minMesafe = mesafe;
      enYakinId = id;
    }
  }

  return TIPLER[enYakinId] || TIPLER.dengeli;
}
