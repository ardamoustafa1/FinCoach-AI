/**
 * FinCoach AI - Finansal Sağlık Skoru Hesaplayıcı
 * Toplam 100 puan, 4 alt metrik
 */
import { getBudgetLimits } from './storage';

// ─── Yardımcılar ─────────────────────────────────────────────
function ayIslemler(islemler, yil, ay) {
  const prefix = `${yil}-${String(ay).padStart(2, '0')}`;
  return islemler.filter((i) => i.tarih && i.tarih.startsWith(prefix));
}

function ayGelir(gelirler, yil, ay) {
  const prefix = `${yil}-${String(ay).padStart(2, '0')}`;
  return gelirler
    .filter((g) => g.tarih && g.tarih.startsWith(prefix))
    .reduce((s, g) => s + g.tutar, 0);
}

function standartSapma(degerler) {
  if (degerler.length < 2) return 0;
  const ort = degerler.reduce((s, v) => s + v, 0) / degerler.length;
  const varyans = degerler.reduce((s, v) => s + (v - ort) ** 2, 0) / degerler.length;
  return Math.sqrt(varyans);
}

// ─── Tek Ay Skoru ─────────────────────────────────────────────
export function aySkoru(islemler, gelirler, yil, ay, limitler) {
  const buAyTx = ayIslemler(islemler, yil, ay);
  const oncekiAy = ay === 1 ? { yil: yil - 1, ay: 12 } : { yil, ay: ay - 1 };
  const oncekiTx = ayIslemler(islemler, oncekiAy.yil, oncekiAy.ay);

  const buAyGelir = ayGelir(gelirler, yil, ay) || 18000;
  const buAyGider = buAyTx.reduce((s, i) => s + i.tutar, 0);
  const oncekiGider = oncekiTx.reduce((s, i) => s + i.tutar, 0);

  // 1. Bütçe uyumu (25p) ───────────────────────────────────────
  const katHarcama = {};
  buAyTx.forEach((i) => {
    katHarcama[i.kategori] = (katHarcama[i.kategori] || 0) + i.tutar;
  });
  const katSayisi = Object.keys(limitler).length || 1;
  const uyumlu = Object.entries(limitler).filter(
    ([kat, limit]) => (katHarcama[kat] || 0) <= limit
  ).length;
  const butceUyumu = Math.round((uyumlu / katSayisi) * 25);

  // 2. Tasarruf oranı (25p) ────────────────────────────────────
  const tasarrufPct = buAyGelir > 0 ? ((buAyGelir - buAyGider) / buAyGelir) * 100 : 0;
  const tasarrufPuan = Math.max(0, Math.min(25, Math.round(25 - Math.max(0, 20 - tasarrufPct) * 1.25)));

  // 3. Düzenlilik (25p) ─────────────────────────────────────────
  // Haftalık harcama toplamları
  const haftaMap = {};
  buAyTx.forEach((i) => {
    const gun = parseInt(i.tarih.split('-')[2], 10);
    const hafta = Math.ceil(gun / 7);
    haftaMap[hafta] = (haftaMap[hafta] || 0) + i.tutar;
  });
  const haftaDegerleri = Object.values(haftaMap);
  const sapma = standartSapma(haftaDegerleri);
  // Sapma 0-5000 arasında normalize; 0 sapma = 25p, ≥5000 = 0p
  const duzenlilik = Math.max(0, Math.round(25 - (sapma / 200)));

  // 4. İyileşme trendi (25p) ───────────────────────────────────
  const iyilesmeTrendi = oncekiGider > 0 && buAyGider < oncekiGider ? 25 : 0;

  const toplam = Math.min(100, butceUyumu + tasarrufPuan + duzenlilik + iyilesmeTrendi);

  return {
    toplam,
    metrikler: {
      butceUyumu: { puan: butceUyumu, max: 25, etiket: 'Bütçe Uyumu' },
      tasarruf: { puan: tasarrufPuan, max: 25, etiket: 'Tasarruf Oranı', yuzde: Math.round(tasarrufPct) },
      duzenlilik: { puan: duzenlilik, max: 25, etiket: 'Düzenlilik' },
      iyilesmeTrendi: { puan: iyilesmeTrendi, max: 25, etiket: 'İyileşme Trendi' },
    },
  };
}

// ─── 6 Aylık Skor Geçmişi ────────────────────────────────────
const YORUMLAR = {
  mock: [
    'Harika bir başlangıç! Market harcamaları kontrol altında.',
    'Yemek siparişleri biraz fazla, dikkat!',
    'Tasarruf oranın bu ay iyileşti. Tebrikler!',
    'Ulaşım harcamaları normale döndü.',
    'En iyi ayın! Tüm kategoriler limitte.',
    'Alışveriş harcamaları limit yakınında, dikkatli ol.',
  ],
};

const AY_ISIMLERI = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export function skorGecmisi(islemler, gelirler) {
  const limitler = getBudgetLimits();
  const simdi = { yil: 2025, ay: 5 }; // Mayıs 2025

  return Array.from({ length: 6 }, (_, i) => {
    let { yil, ay } = simdi;
    ay = ay - (5 - i);
    if (ay <= 0) { ay += 12; yil -= 1; }

    const { toplam } = aySkoru(islemler, gelirler, yil, ay, limitler);
    return {
      name: `${AY_ISIMLERI[ay]} '${String(yil).slice(-2)}`,
      skor: toplam,
      yorum: YORUMLAR.mock[i] || '',
      ay,
      yil,
    };
  });
}
