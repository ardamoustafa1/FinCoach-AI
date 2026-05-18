/**
 * FinCoach AI - Mock Banka İşlem Verileri
 * Son 6 aya ait dinamik olarak oluşturulan gerçekçi banka işlemleri
 */

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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
      { ad: 'Netflix', min: 149, max: 149 },
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

// ─── DİNAMİK ZAMAN YÖNETİMİ ───
// Son 6 ayın yıl ve ay bilgisini üretir (Şu anki ay dahil)
function getRecentMonths(count = 6) {
  const result = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ yil: d.getFullYear(), ay: d.getMonth() + 1 });
  }
  return result;
}

const MONTHS_DATA = getRecentMonths(6);

function rastgeleTarih(yil, ay) {
  const gunSayisi = new Date(yil, ay, 0).getDate();
  const gun = Math.floor(Math.random() * gunSayisi) + 1;
  return `${yil}-${String(ay).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
}

function rastgeleTutar(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function islemUret(yil, ay) {
  const katKeys = Object.keys(kategoriler);
  const kat = katKeys[Math.floor(Math.random() * katKeys.length)];
  const magazaList = kategoriler[kat].magazalar;
  const magaza = magazaList[Math.floor(Math.random() * magazaList.length)];
  const tutar = rastgeleTutar(magaza.min, magaza.max);
  const tarih = rastgeleTarih(yil, ay);
  const aciklama = aciklamaKaliplari[kat](magaza.ad);

  return {
    id: uuid(),
    tarih,
    tutar,
    aciklama,
    magaza: magaza.ad,
    kategori: kat,
    tur: 'gider'
  };
}

// ─── Abonelik işlemlerini her ay düzenli ekle (4 adet × 6 ay = 24)
function abonelikIslemleriUret() {
  const sonuc = [];
  const abonelikler = kategoriler.Abonelik.magazalar;
  MONTHS_DATA.forEach(({ yil, ay }) => {
    abonelikler.forEach((ab) => {
      sonuc.push({
        id: uuid(),
        tarih: `${yil}-${String(ay).padStart(2, '0')}-01`,
        tutar: ab.min,
        aciklama: `${ab.ad} aylık abonelik`,
        magaza: ab.ad,
        kategori: 'Abonelik',
        tur: 'gider'
      });
    });
  });
  return sonuc;
}

// ─── Gelir Verilerini Dinamik Üret (Son 6 ay için her ay başı maaş)
function gelirUret() {
  const aylarIsimleri = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return MONTHS_DATA.map(({ yil, ay }) => ({
    id: uuid(),
    tarih: `${yil}-${String(ay).padStart(2, '0')}-01`,
    tutar: 32500, // Biraz daha gerçekçi/güncel bir maaş
    aciklama: `Maaş ödemesi - ${aylarIsimleri[ay - 1]} ${yil}`,
    magaza: 'İşveren',
    kategori: 'Maaş',
    tur: 'gelir'
  }));
}

// ─── 200 İşlem Üret (6 Ay İçin)
function tumIslemleriUret() {
  const abonelikler = abonelikIslemleriUret(); // 24 adet
  const kalanAdet = 200 - abonelikler.length;  // 176 adet rastgele

  const rastgeleler = [];
  for (let i = 0; i < kalanAdet; i++) {
    const { yil, ay } = MONTHS_DATA[i % MONTHS_DATA.length];
    let islem;
    do {
      islem = islemUret(yil, ay);
    } while (islem.kategori === 'Abonelik'); 
    rastgeleler.push(islem);
  }

  return [...abonelikler, ...rastgeleler].sort(
    (a, b) => new Date(b.tarih) - new Date(a.tarih)
  );
}

// Dışarı aktarılan dinamik değişkenler
export const mockGelir = gelirUret();
export const mockTransactions = tumIslemleriUret();

export function initMockData() {
  console.info('[FinCoach AI] Dinamik demo veri hazırlandı: %d işlem, %d gelir kaydı', mockTransactions.length, mockGelir.length);
  return {
    transactions: mockTransactions,
    gelir: mockGelir,
  };
}
