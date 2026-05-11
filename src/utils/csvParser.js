/**
 * BütçeAI - CSV / Banka Ekstresi Parser
 * Desteklenen formatlar: Garanti, İş Bankası, Yapı Kredi, Genel CSV
 */
import Papa from 'papaparse';
import { suggestCategory } from './storage';

// ─── Banka formatı tanımları ─────────────────────────────────
const BANKA_FORMATLARI = [
  {
    ad: 'Garanti Bankası',
    gerekliSutunlar: ['tarih', 'açıklama', 'tutar', 'bakiye'],
    parse: (row) => ({
      tarih: normalTarih(row['Tarih'] || row['tarih']),
      aciklama: (row['Açıklama'] || row['açıklama'] || '').trim(),
      magaza: magazaCikar(row['Açıklama'] || row['açıklama'] || ''),
      tutar: Math.abs(temizTutar(row['Tutar'] || row['tutar'])),
      tur: temizTutar(row['Tutar'] || row['tutar']) < 0 ? 'gider' : 'gelir',
    }),
  },
  {
    ad: 'İş Bankası',
    gerekliSutunlar: ['işlem tarihi', 'açıklama', 'borç', 'alacak'],
    alternativSutunlar: ['islem tarihi', 'açıklama', 'borç', 'alacak'],
    parse: (row) => {
      const borc = temizTutar(row['Borç'] || row['borç'] || '0');
      const alacak = temizTutar(row['Alacak'] || row['alacak'] || '0');
      const tutar = borc > 0 ? borc : alacak;
      return {
        tarih: normalTarih(row['İşlem Tarihi'] || row['işlem tarihi'] || row['Islem Tarihi'] || row['islem tarihi']),
        aciklama: (row['Açıklama'] || row['açıklama'] || '').trim(),
        magaza: magazaCikar(row['Açıklama'] || row['açıklama'] || ''),
        tutar: Math.abs(tutar),
        tur: borc > 0 ? 'gider' : 'gelir',
      };
    },
  },
  {
    ad: 'Yapı Kredi',
    gerekliSutunlar: ['tarih', 'işlem açıklaması', 'tutar'],
    alternativSutunlar: ['tarih', 'islem açıklaması', 'tutar'],
    parse: (row) => ({
      tarih: normalTarih(row['Tarih'] || row['tarih']),
      aciklama: (row['İşlem Açıklaması'] || row['işlem açıklaması'] || row['Islem Açıklaması'] || '').trim(),
      magaza: magazaCikar(row['İşlem Açıklaması'] || row['işlem açıklaması'] || row['Islem Açıklaması'] || ''),
      tutar: Math.abs(temizTutar(row['Tutar'] || row['tutar'])),
      tur: temizTutar(row['Tutar'] || row['tutar']) < 0 ? 'gider' : 'gelir',
    }),
  },
  {
    ad: 'Genel CSV',
    gerekliSutunlar: [],
    // Daha esnek eşleşme
    detect: (headers) => {
      const h = headers.map(s => s.toLowerCase().trim());
      const hasTarih = h.some(c => ['date', 'tarih', 'datum'].includes(c));
      const hasAciklama = h.some(c => ['description', 'açıklama', 'aciklama', 'desc'].includes(c));
      const hasTutar = h.some(c => ['amount', 'tutar', 'miktar', 'total'].includes(c));
      return hasTarih && hasAciklama && hasTutar;
    },
    parse: (row) => {
      const headers = Object.keys(row);
      const h = headers.map(s => s.toLowerCase().trim());

      const tarihKey = headers[h.findIndex(c => ['date', 'tarih', 'datum'].includes(c))];
      const aciklamaKey = headers[h.findIndex(c => ['description', 'açıklama', 'aciklama', 'desc'].includes(c))];
      const tutarKey = headers[h.findIndex(c => ['amount', 'tutar', 'miktar', 'total'].includes(c))];

      const tutar = temizTutar(row[tutarKey] || '0');
      return {
        tarih: normalTarih(row[tarihKey] || ''),
        aciklama: (row[aciklamaKey] || '').trim(),
        magaza: magazaCikar(row[aciklamaKey] || ''),
        tutar: Math.abs(tutar),
        tur: tutar < 0 ? 'gider' : 'gelir',
      };
    },
  },
];

// ─── Yardımcı fonksiyonlar ───────────────────────────────────

/** Türk tarih formatlarını YYYY-MM-DD'ye çevirir */
function normalTarih(str) {
  if (!str) return new Date().toISOString().slice(0, 10);
  const s = str.trim();

  // DD.MM.YYYY veya DD/MM/YYYY
  const dmyMatch = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // YYYY-MM-DD (zaten doğru)
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  // Fallback: Date.parse dene
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

/** Tutar string'ini sayıya çevirir: "1.234,56" → 1234.56 */
function temizTutar(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  let s = String(str).trim();
  // Türk formatı: nokta binlik ayracı, virgül ondalık
  // Eğer hem nokta hem virgül varsa ve virgül sondan 3. karakterden önceyse → Türk formatı
  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // Türk formatı: 1.234,56
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // İngiliz formatı: 1,234.56
      s = s.replace(/,/g, '');
    }
  } else if (s.includes(',')) {
    // Sadece virgül: ya binlik ya ondalık
    const afterComma = s.split(',')[1];
    if (afterComma && afterComma.length <= 2) {
      s = s.replace(',', '.'); // Ondalık
    } else {
      s = s.replace(/,/g, ''); // Binlik
    }
  }
  // TL, ₺ vs temizle
  s = s.replace(/[^\d.+-]/g, '');
  return parseFloat(s) || 0;
}

/** Açıklamadan mağaza adı çıkarır (ilk anlamlı kısmı alır) */
function magazaCikar(aciklama) {
  if (!aciklama) return '';
  // Genelde bankalar öncesinde tarih/referans koyar, sonrasında mağaza
  const temiz = aciklama
    .replace(/\d{2,4}[./-]\d{2}[./-]\d{2,4}/g, '') // Tarihleri sil
    .replace(/\b\d{6,}\b/g, '') // Uzun sayıları sil (referans no)
    .replace(/\s+/g, ' ')
    .trim();
  // İlk 30 karakter yeterli
  return temiz.slice(0, 30).trim() || aciklama.slice(0, 30).trim();
}

// ─── Format Algılama ─────────────────────────────────────────
function formatAlgila(headers) {
  const normalHeaders = headers.map(h => h.toLowerCase().trim());

  for (const format of BANKA_FORMATLARI) {
    // Özel detect fonksiyonu varsa onu kullan
    if (format.detect) {
      if (format.detect(headers)) return format;
      continue;
    }

    // Sütun adlarıyla eşleştir
    const tumMevcut = format.gerekliSutunlar.every(s =>
      normalHeaders.includes(s) ||
      normalHeaders.includes(s.replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ş/g, 's').replace(/Ş/g, 'S'))
    );
    if (tumMevcut) return format;

    // Alternatif sütun adlarıyla dene
    if (format.alternativSutunlar) {
      const altMevcut = format.alternativSutunlar.every(s => normalHeaders.includes(s));
      if (altMevcut) return format;
    }
  }

  return null;
}

// ─── Encoding Denemesi ───────────────────────────────────────
function tryDecodeWindows1254(buffer) {
  try {
    const decoder = new TextDecoder('windows-1254');
    return decoder.decode(buffer);
  } catch {
    return null;
  }
}

// ─── Ana Parse Fonksiyonu ────────────────────────────────────
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject({ type: 'empty', message: 'Dosya boş görünüyor.' });
      return;
    }

    // Dosya uzantısını kontrol et
    const ext = file.name?.split('.').pop()?.toLowerCase();
    if (ext && !['csv', 'txt', 'tsv'].includes(ext)) {
      reject({ type: 'format', message: 'Bu format desteklenmiyor. Lütfen CSV olarak dışa aktarın.' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target.result;

      // Önce UTF-8 dene
      let text = new TextDecoder('utf-8').decode(buffer);

      // Eğer garip karakterler varsa Windows-1254 dene
      if (text.includes('�') || text.includes('\ufffd')) {
        const win1254 = tryDecodeWindows1254(buffer);
        if (win1254) text = win1254;
      }

      if (!text.trim()) {
        reject({ type: 'empty', message: 'Dosya boş görünüyor.' });
        return;
      }

      // PapaParse ile parse et
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            reject({ type: 'parse', message: 'Dosya okunamadı, farklı bir dosya deneyin.' });
            return;
          }

          if (results.data.length === 0) {
            reject({ type: 'empty', message: 'Dosya boş görünüyor.' });
            return;
          }

          const headers = results.meta.fields || [];
          const format = formatAlgila(headers);

          if (!format) {
            reject({
              type: 'format',
              message: 'Bu format desteklenmiyor. Lütfen CSV olarak dışa aktarın.',
              headers,
            });
            return;
          }

          // Satırları normalize et
          const islemler = results.data
            .map((row) => {
              try {
                const parsed = format.parse(row);
                if (!parsed.aciklama && !parsed.tutar) return null; // Boş satır
                return {
                  id: crypto.randomUUID(),
                  ...parsed,
                  kategori: suggestCategory(parsed.magaza) || 'Diğer',
                  createdAt: new Date().toISOString(),
                  kaynak: 'csv-import',
                };
              } catch {
                return null;
              }
            })
            .filter(Boolean);

          if (islemler.length === 0) {
            reject({ type: 'empty', message: 'Dosya boş görünüyor.' });
            return;
          }

          resolve({
            format: format.ad,
            toplamSatir: results.data.length,
            basarili: islemler.length,
            islemler,
            onizleme: results.data.slice(0, 5), // İlk 5 satır ham önizleme
            headers,
          });
        },
        error: () => {
          reject({ type: 'parse', message: 'Dosya okunamadı, farklı bir dosya deneyin.' });
        },
      });
    };

    reader.onerror = () => {
      reject({ type: 'parse', message: 'Dosya okunamadı, farklı bir dosya deneyin.' });
    };

    // ArrayBuffer olarak oku (encoding denemesi için)
    reader.readAsArrayBuffer(file);
  });
}
