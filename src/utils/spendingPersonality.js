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

// ─── Tip Tespit Fonksiyonu ────────────────────────────────────
export function kisilikTipiBelirle(islemler) {
  if (!islemler || islemler.length === 0) return TIPLER.dengeli;

  const toplam = islemler.reduce((s, i) => s + (i.tutar || 0), 0);
  if (toplam === 0) return TIPLER.dengeli;

  // Hafta sonu (Cmt=6, Paz=0) harcamaları
  const haftaSonu = islemler.filter((i) => {
    if (!i.tarih) return false;
    const gun = new Date(i.tarih).getDay();
    return gun === 0 || gun === 6;
  }).reduce((s, i) => s + i.tutar, 0);

  // Tasarruf oranı (gelir bilinmiyorsa tahmini 18000/ay kullan)
  let aylikGelir = 18000;
  try {
    const profil = JSON.parse(localStorage.getItem('fincoach_profile') || '{}');
    if (profil.income && Number(profil.income) > 0) aylikGelir = Number(profil.income);
  } catch { /* ignore */ }
  const gelir = aylikGelir * 3; // 3 aylık
  const tasarrufOrani = Math.max(0, (gelir - toplam) / gelir);

  // Tekrarlayan harcamalar (aynı magaza, > 1 kez)
  const magazaSayac = {};
  islemler.forEach((i) => {
    if (i.magaza) magazaSayac[i.magaza] = (magazaSayac[i.magaza] || 0) + 1;
  });
  const tekrarayanToplam = islemler
    .filter((i) => i.magaza && magazaSayac[i.magaza] > 1)
    .reduce((s, i) => s + i.tutar, 0);

  // Anlık büyük harcamalar (üst %20 dilim)
  const sirali = [...islemler].sort((a, b) => b.tutar - a.tutar);
  const esik = sirali[Math.floor(sirali.length * 0.2)]?.tutar || 0;
  const anlikBuyuk = islemler.filter((i) => i.tutar >= esik * 1.5).length;

  // Kurallara göre tip belirle (öncelik sırası)
  if (haftaSonu / toplam > 0.45) return TIPLER.anlık_zevk;
  if (tasarrufOrani > 0.25) return TIPLER.tasarruf_ustasi;
  if (tekrarayanToplam / toplam > 0.6) return TIPLER.planlayici;
  if (anlikBuyuk > 5) return TIPLER.durtüsel;
  return TIPLER.dengeli;
}
