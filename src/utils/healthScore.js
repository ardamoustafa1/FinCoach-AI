import useStore from '../store/useStore';
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

  // Gerçek geliri veya onboarding'deki geliri kullan
  let profilGelir = 0;
  try {
    const profil = useStore.getState().behavioralProfile;
    if (profil.income && Number(profil.income) > 0) profilGelir = Number(profil.income);
  } catch { /* ignore */ }
  const buAyGelir = ayGelir(gelirler, yil, ay) || profilGelir || 18000;
  const buAyGider = buAyTx.reduce((s, i) => s + i.tutar, 0);
  const oncekiGider = oncekiTx.reduce((s, i) => s + i.tutar, 0);

  // ─── Dinamik Ağırlık Sistemi (Kullanıcı Hedefine Göre) ──────
  const profil = useStore.getState().behavioralProfile || {};
  const goal = profil.goal || 'takip';

  // Hedef bazlı ağırlıklar (toplam = 100)
  const WEIGHTS = {
    birikim: { butce: 20, tasarruf: 40, duzenlilik: 20, trend: 20 },
    tasarruf: { butce: 20, tasarruf: 40, duzenlilik: 20, trend: 20 },
    takip:    { butce: 35, tasarruf: 20, duzenlilik: 25, trend: 20 },
  };
  const W = WEIGHTS[goal] || WEIGHTS.takip;

  // 1. Bütçe uyumu ─────────────────────────────────────────────
  const katHarcama = {};
  buAyTx.forEach((i) => {
    katHarcama[i.kategori] = (katHarcama[i.kategori] || 0) + i.tutar;
  });
  const katSayisi = Object.keys(limitler).length || 1;
  const uyumlu = Object.entries(limitler).filter(
    ([kat, limit]) => (katHarcama[kat] || 0) <= limit
  ).length;
  const butceUyumu = Math.round((uyumlu / katSayisi) * W.butce);

  // 2. Tasarruf oranı ──────────────────────────────────────────
  const tasarrufPct = buAyGelir > 0 ? ((buAyGelir - buAyGider) / buAyGelir) * 100 : 0;
  // 20%+ tasarruf = tam puan; 0% = yarı puan; negatif = 0
  const tasarrufPuan = Math.max(0, Math.min(W.tasarruf,
    Math.round(W.tasarruf * Math.min(1, Math.max(0, tasarrufPct) / 20))
  ));

  // 3. Düzenlilik ───────────────────────────────────────────────
  const haftaMap = {};
  buAyTx.forEach((i) => {
    const gun = parseInt(i.tarih.split('-')[2], 10);
    const hafta = Math.ceil(gun / 7);
    haftaMap[hafta] = (haftaMap[hafta] || 0) + i.tutar;
  });
  const haftaDegerleri = Object.values(haftaMap);
  const sapma = standartSapma(haftaDegerleri);
  const duzenlilik = Math.max(0, Math.min(W.duzenlilik, Math.round(W.duzenlilik - (sapma / 200))));

  // 4. İyileşme trendi — sürekli ölçek (0-W.trend) ─────────────
  let iyilesmeTrendi = 0;
  if (oncekiGider > 0) {
    const iyilesmePct = (oncekiGider - buAyGider) / oncekiGider; // pozitif = iyileşme
    // %0 iyileşme = 0p, %10+ iyileşme = tam puan
    iyilesmeTrendi = Math.max(0, Math.min(W.trend, Math.round(W.trend * Math.min(1, iyilesmePct / 0.10))));
  }

  const toplam = Math.min(100, butceUyumu + tasarrufPuan + duzenlilik + iyilesmeTrendi);

  return {
    toplam,
    metrikler: {
      butceUyumu:      { puan: butceUyumu,      max: W.butce,    etiket: 'Bütçe Uyumu' },
      tasarruf:        { puan: tasarrufPuan,     max: W.tasarruf, etiket: 'Tasarruf Oranı', yuzde: Math.round(tasarrufPct) },
      duzenlilik:      { puan: duzenlilik,       max: W.duzenlilik, etiket: 'Düzenlilik' },
      iyilesmeTrendi:  { puan: iyilesmeTrendi,   max: W.trend,    etiket: 'İyileşme Trendi' },
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
  const now = new Date();
  const simdi = { yil: now.getFullYear(), ay: now.getMonth() + 1 };

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
