/**
 * FinCoach AI - Abonelik / Tekrarlayan Ödeme Tespit Algoritması
 *
 * localStorage'daki tüm işlemleri tarar:
 * - Aynı mağazadan gelen işlemlere bakar
 * - Her ay (±7 gün tolerans) ve benzer tutar (±%10 tolerans) ile tekrarlıyorsa abonelik sayar
 * - En az 2 ay tekrar etmişse listeler
 */

// ─── Yardımcı: iki tarih arasındaki gün farkı ────────────────
function gunFarki(t1, t2) {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return Math.abs(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));
}

// ─── Yardımcı: iki tutar benzer mi (±%10) ────────────────────
function tutarBenzer(a, b) {
  if (a === 0 && b === 0) return true;
  if (a === 0 || b === 0) return false;
  const fark = Math.abs(a - b);
  const ort = (Math.abs(a) + Math.abs(b)) / 2;
  return (fark / ort) <= 0.10;
}

// ─── Yardımcı: mağaza adını normalize et (fuzzy eşleştirme) ──
function normalizeName(raw) {
  return (raw || '')
    .toLowerCase()
    .trim()
    // Yaygın ekleri kaldır: " tr", " web", " app", " ltd", " inc", numaralar ve özel karakterler
    .replace(/\b(tr|web|app|ltd|inc|com|net|mobile|online|türkiye|turkey)\b/g, '')
    .replace(/[^a-zçğıöşü0-9]/g, '') // alfanümerik olmayan karakterleri sil
    .replace(/\d+/g, '')               // rakamları sil
    .trim();
}

// ─── Tekrarlayan ödeme gruplarını bul ─────────────────────────
function islemleriGrupla(islemler) {
  const gruplar = {};

  const safeIslemler = islemler || [];
  safeIslemler.forEach(tx => {
    // Sadece gider işlemleri (veya tur belirtilmemişse tutar'ı pozitif olanları gider say)
    const isGider = tx.tur === 'gider' || (!tx.tur && tx.tutar > 0);
    if (!isGider) return;

    const rawKey = (tx.magaza || tx.aciklama || '').trim();
    const key = normalizeName(rawKey);
    if (!key) return;

    if (!gruplar[key]) {
      gruplar[key] = {
        magaza: rawKey, // Orijinal adı sakla, normalize edilmişini key olarak kullan
        kategori: tx.kategori,
        islemler: [],
      };
    }
    // Orijinal adı en sık görülene güncelle (frequency-based labeling)
    gruplar[key].islemler.push({
      tarih: tx.tarih,
      tutar: Number(tx.tutar),
      id: tx.id,
    });
  });

  return gruplar;
}

// ─── Aylık tekrar tespiti ────────────────────────────────────
function aylikTekrarMi(islemler) {
  if (islemler.length < 2) return false;

  // Tarihe göre sırala (eski → yeni)
  const sirali = [...islemler].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));

  // Ardışık çiftler arası farkları kontrol et
  let uygunCift = 0;
  for (let i = 1; i < sirali.length; i++) {
    const gun = gunFarki(sirali[i].tarih, sirali[i - 1].tarih);
    const benzerTutar = tutarBenzer(sirali[i].tutar, sirali[i - 1].tutar);

    // ~30 gün (±7 gün tolerans) = 23-37 gün arası
    if (gun >= 23 && gun <= 37 && benzerTutar) {
      uygunCift++;
    }
  }

  // En az 1 uygun çift = en az 2 ay tekrar
  return uygunCift >= 1;
}

// ─── Ana tespit fonksiyonu ───────────────────────────────────
export function abonelikleriTespit(islemler, dismisList = []) {
  const gruplar = islemleriGrupla(islemler);
  const sonuc = [];

  Object.entries(gruplar).forEach(([key, grup]) => {
    // Dismiss edilmiş mi?
    if (dismisList.includes(key)) return;

    // En az 2 işlem olmalı
    if (grup.islemler.length < 2) return;

    // Aylık tekrar kontrolü
    if (!aylikTekrarMi(grup.islemler)) return;

    // Tarihe göre sırala (yeni → eski)
    const sirali = [...grup.islemler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    const sonOdeme = sirali[0];
    const tutarlar = sirali.map(i => i.tutar);
    const ortTutar = Math.round(tutarlar.reduce((a, b) => a + b, 0) / tutarlar.length);

    // Sonraki ödeme tahmini: son ödeme + 30 gün
    const sonTarih = new Date(sonOdeme.tarih);
    const sonrakiTarih = new Date(sonTarih);
    sonrakiTarih.setDate(sonrakiTarih.getDate() + 30);

    sonuc.push({
      key,
      magaza: grup.magaza,
      kategori: grup.kategori || 'Abonelik',
      aylikTutar: ortTutar,
      sonOdeme: sonOdeme.tarih,
      sonrakiOdeme: sonrakiTarih.toISOString().slice(0, 10),
      tekrarSayisi: sirali.length,
      islemler: sirali,
    });
  });

  // Tutarına göre sırala (büyük → küçük)
  return sonuc.sort((a, b) => b.aylikTutar - a.aylikTutar);
}

// ─── Yaklaşan yenilemeler (7 gün içinde) ─────────────────────
export function yaklasanYenilemeler(abonelikler) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);

  const yediGunSonra = new Date(bugun);
  yediGunSonra.setDate(yediGunSonra.getDate() + 7);

  return abonelikler.filter(ab => {
    const sonraki = new Date(ab.sonrakiOdeme);
    return sonraki >= bugun && sonraki <= yediGunSonra;
  }).map(ab => {
    const sonraki = new Date(ab.sonrakiOdeme);
    const gunKaldi = Math.ceil((sonraki - bugun) / (1000 * 60 * 60 * 24));

    // Gün adını bul
    const gunAdi = gunKaldi === 0 ? 'bugün'
      : gunKaldi === 1 ? 'yarın'
      : gunKaldi <= 3 ? `${gunKaldi} gün sonra`
      : formatGunAdi(sonraki);

    return { ...ab, gunKaldi, gunAdi };
  });
}

// ─── Gün adı formatı ─────────────────────────────────────────
function formatGunAdi(tarih) {
  const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `bu ${gunler[tarih.getDay()]}`;
}
