/**
 * FinCoach AI - Mock Banka İşlem Verileri
 * Son 3 aya ait 120 adet Türkiye'ye özel gerçekçi banka işlemi
 */

// ─── Yardımcı: basit UUID üreteci ────────────────────────────
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Kategori → Mağaza & tutar aralığı tanımları ─────────────
const kategoriler = {
  Market: {
    magazalar: [
      { ad: 'Migros', min: 150, max: 1200 },
      { ad: 'BİM', min: 80, max: 450 },
      { ad: 'A101', min: 60, max: 400 },
      { ad: 'CarrefourSA', min: 200, max: 1500 },
      { ad: 'Şok', min: 50, max: 350 },
    ],
  },
  'Yemek Siparişi': {
    magazalar: [
      { ad: 'Getir', min: 80, max: 350 },
      { ad: 'Yemeksepeti', min: 120, max: 450 },
      { ad: 'Trendyol Yemek', min: 100, max: 380 },
    ],
  },
  Ulaşım: {
    magazalar: [
      { ad: 'İstanbulkart Yükleme', min: 100, max: 500 },
      { ad: 'İETT', min: 17, max: 70 },
      { ad: 'BiTaksi', min: 80, max: 350 },
      { ad: 'Uber', min: 90, max: 400 },
    ],
  },
  Abonelik: {
    magazalar: [
      { ad: 'Netflix', min: 139, max: 139 },
      { ad: 'Spotify', min: 59, max: 59 },
      { ad: 'YouTube Premium', min: 79, max: 79 },
      { ad: 'Exxen', min: 69, max: 69 },
    ],
  },
  Fatura: {
    magazalar: [
      { ad: 'İGDAŞ', min: 250, max: 850 },
      { ad: 'AYEDAŞ', min: 200, max: 700 },
      { ad: 'İSKİ', min: 80, max: 300 },
    ],
  },
  Alışveriş: {
    magazalar: [
      { ad: 'Trendyol', min: 100, max: 2500 },
      { ad: 'Hepsiburada', min: 150, max: 3000 },
      { ad: 'Zara', min: 400, max: 3500 },
      { ad: 'LC Waikiki', min: 200, max: 1500 },
    ],
  },
  Sağlık: {
    magazalar: [
      { ad: 'Gratis', min: 100, max: 800 },
      { ad: 'Watsons', min: 80, max: 600 },
      { ad: 'Eczane', min: 50, max: 500 },
    ],
  },
  Eğlence: {
    magazalar: [
      { ad: 'Cinemaximum', min: 120, max: 350 },
      { ad: 'Steam', min: 50, max: 800 },
      { ad: 'D&R', min: 60, max: 400 },
    ],
  },
};

// ─── Açıklama kalıpları ──────────────────────────────────────
const aciklamaKaliplari = {
  Market: (m) => `${m} market alışverişi`,
  'Yemek Siparişi': (m) => `${m} sipariş ödemesi`,
  Ulaşım: (m) => (m === 'İstanbulkart Yükleme' ? 'İstanbulkart bakiye yükleme' : `${m} yolculuk ücreti`),
  Abonelik: (m) => `${m} aylık abonelik`,
  Fatura: (m) => `${m} fatura ödemesi`,
  Alışveriş: (m) => `${m} online alışveriş`,
  Sağlık: (m) => (m === 'Eczane' ? 'Eczane ilaç ödemesi' : `${m} kişisel bakım`),
  Eğlence: (m) => {
    if (m === 'Cinemaximum') return 'Cinemaximum sinema bileti';
    if (m === 'Steam') return 'Steam oyun satın alma';
    return `${m} kitap/müzik alışverişi`;
  },
};

// ─── Rastgele tarih üreteci (3 ay: Mart-Nisan-Mayıs 2025) ───
function rastgeleTarih(ay) {
  const yil = 2025;
  const gunSayisi = new Date(yil, ay, 0).getDate();
  const gun = Math.floor(Math.random() * gunSayisi) + 1;
  return `${yil}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
}

function rastgeleTutar(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ─── İşlem üreteci ───────────────────────────────────────────
function islemUret(ay) {
  const katKeys = Object.keys(kategoriler);
  const kat = katKeys[Math.floor(Math.random() * katKeys.length)];
  const magazaList = kategoriler[kat].magazalar;
  const magaza = magazaList[Math.floor(Math.random() * magazaList.length)];
  const tutar = rastgeleTutar(magaza.min, magaza.max);
  const tarih = rastgeleTarih(ay);
  const aciklama = aciklamaKaliplari[kat](magaza.ad);

  return {
    id: uuid(),
    tarih,
    tutar,
    aciklama,
    magaza: magaza.ad,
    kategori: kat,
  };
}

// ─── Abonelik işlemlerini her ay düzenli ekle (4 adet × 3 ay = 12) ─
function abonelikIslemleriUret() {
  const sonuc = [];
  const abonelikler = kategoriler.Abonelik.magazalar;
  [3, 4, 5].forEach((ay) => {
    abonelikler.forEach((ab) => {
      sonuc.push({
        id: uuid(),
        tarih: `2025-${String(ay).padStart(2, '0')}-01`,
        tutar: ab.min,
        aciklama: `${ab.ad} aylık abonelik`,
        magaza: ab.ad,
        kategori: 'Abonelik',
      });
    });
  });
  return sonuc;
}

// ─── 120 İşlem Üret ──────────────────────────────────────────
function tumIslemleriUret() {
  const abonelikler = abonelikIslemleriUret(); // 12 adet
  const kalanAdet = 120 - abonelikler.length;  // 108 adet rastgele
  const aylar = [3, 4, 5]; // Mart, Nisan, Mayıs

  const rastgeleler = [];
  for (let i = 0; i < kalanAdet; i++) {
    const ay = aylar[i % aylar.length];
    let islem;
    do {
      islem = islemUret(ay);
    } while (islem.kategori === 'Abonelik'); // Abonelikler zaten eklendi
    rastgeleler.push(islem);
  }

  return [...abonelikler, ...rastgeleler].sort(
    (a, b) => new Date(b.tarih) - new Date(a.tarih)
  );
}

// ─── Gelir Verileri (3 aylık maaş) ───────────────────────────
export const mockGelir = [
  {
    id: uuid(),
    tarih: '2025-03-01',
    tutar: 18000,
    aciklama: 'Maaş ödemesi - Mart 2025',
    magaza: 'İşveren',
    kategori: 'Maaş',
  },
  {
    id: uuid(),
    tarih: '2025-04-01',
    tutar: 18000,
    aciklama: 'Maaş ödemesi - Nisan 2025',
    magaza: 'İşveren',
    kategori: 'Maaş',
  },
  {
    id: uuid(),
    tarih: '2025-05-01',
    tutar: 18000,
    aciklama: 'Maaş ödemesi - Mayıs 2025',
    magaza: 'İşveren',
    kategori: 'Maaş',
  },
];

// ─── Üretilmiş işlemler ──────────────────────────────────────
export const mockTransactions = tumIslemleriUret();

// ─── localStorage'a yükle ────────────────────────────────────
export function initMockData() {
  const KEY_TX = 'fincoach_transactions';
  const KEY_GELIR = 'fincoach_gelir';
  const KEY_INIT = 'fincoach_mock_initialized';

  // Sadece ilk açılışta yükle
  if (localStorage.getItem(KEY_INIT)) return;

  localStorage.setItem(KEY_TX, JSON.stringify(mockTransactions));
  localStorage.setItem(KEY_GELIR, JSON.stringify(mockGelir));
  localStorage.setItem(KEY_INIT, 'true');

  console.log('[FinCoach AI] Mock veriler yüklendi: %d işlem, %d gelir kaydı', mockTransactions.length, mockGelir.length);
}
