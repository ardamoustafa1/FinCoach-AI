import { supabase } from './supabase';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
export const API_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-FinCoach-Fallback': 'local-demo',
    },
  });
}

async function requestJson(options) {
  try {
    return options.body ? JSON.parse(options.body) : {};
  } catch {
    return {};
  }
}

function categorizeText(text = '') {
  const lower = text.toLocaleLowerCase('tr-TR');
  if (/(maaş|salary|gelir|freelance|ödeme aldım)/.test(lower)) return 'Maaş';
  if (/(market|migros|bim|a101|carrefour|şok)/.test(lower)) return 'Market';
  if (/(yemek|restoran|getir|yemeksepeti|kahve|starbucks)/.test(lower)) return 'Yemek Siparişi';
  if (/(uber|taksi|otobüs|metro|ulaşım|benzin|istanbulkart)/.test(lower)) return 'Ulaşım';
  if (/(netflix|spotify|youtube|abonelik|exxen)/.test(lower)) return 'Abonelik';
  if (/(fatura|elektrik|su|doğalgaz|internet|igdaş|iski)/.test(lower)) return 'Fatura';
  if (/(eczane|sağlık|hastane|gratis|watsons)/.test(lower)) return 'Sağlık';
  if (/(sinema|steam|oyun|eğlence)/.test(lower)) return 'Eğlence';
  if (/(trendyol|amazon|hepsiburada|zara|alışveriş)/.test(lower)) return 'Alışveriş';
  return 'Diğer';
}

function parseAmount(text = '') {
  const match = String(text).match(/(\d+(?:[.,]\d+)?)\s*(?:tl|₺|lira)?/i);
  if (!match) return null;
  const amount = Number(match[1].replace(',', '.'));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function parseMerchant(text = '') {
  const cleaned = String(text).replace(/\d+(?:[.,]\d+)?\s*(?:tl|₺|lira)?/gi, '').trim();
  const atMatch = cleaned.match(/(?:'?[dt]e|'?[dt]a|den|dan)\s+([A-Za-zÇĞİÖŞÜçğıöşü0-9 ]{2,40})/);
  const words = (atMatch?.[1] || cleaned).split(/\s+/).filter(Boolean);
  return words.slice(0, 3).join(' ') || 'Manuel giriş';
}

async function localApiFallback(path, options = {}) {
  const body = await requestJson(options);

  if (path === '/api/voice') {
    const text = body.text || '';
    const kategori = categorizeText(text);
    return jsonResponse({
      tutar: parseAmount(text),
      magaza: parseMerchant(text),
      kategori,
      tur: kategori === 'Maaş' ? 'gelir' : 'gider',
    });
  }

  if (path === '/api/categorize') {
    const transactions = Array.isArray(body.transactions) ? body.transactions : [];
    return jsonResponse(transactions.map(tx => ({
      id: tx.id,
      kategori: categorizeText(`${tx.magaza || ''} ${tx.aciklama || ''}`),
    })));
  }

  if (path === '/api/analyze') {
    const aylikVeri = body.aylikVeri || {};
    const hedefSayisi = Array.isArray(body.hedefler) ? body.hedefler.length : 0;
    return jsonResponse({
      summary: [
        '### Yerel Demo Analizi',
        `Gelir/gider verinizden ${Object.keys(aylikVeri).length || 'birden fazla'} özet kalemi ve ${hedefSayisi} hedef okundu.`,
        '',
        '- En güçlü alan: düzenli takip ve kategori bazlı bütçe görünürlüğü.',
        '- Dikkat: AI backend kapalı olduğu için bu rapor deterministik local fallback ile üretildi.',
        '- Öneri: Market, abonelik ve alışveriş limitlerini aylık gerçekleşmeye göre güncelleyin.',
      ].join('\n'),
    });
  }

  if (path === '/api/ocr') {
    return jsonResponse({
      tutar: 249.9,
      tarih: new Date().toISOString().slice(0, 10),
      magaza: 'Fiş Okuma Sandbox',
      kaynak: 'local-demo',
    });
  }

  if (path === '/api/whatsapp/status') {
    return jsonResponse({
      enabled: false,
      ready: false,
      authenticated: false,
      state: 'local-demo',
      lastError: 'Backend bağlı değil; WhatsApp bot local demo modunda kapalı.',
      hasSupabaseStore: false,
      defaultUserMode: false,
    });
  }

  if (path === '/api/events') {
    return jsonResponse({ ok: true, stored: 'local-demo' });
  }

  if (path === '/api/chat') {
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const last = messages.at(-1)?.content || '';
    const lower = last.toLocaleLowerCase('tr-TR');
    let response = 'Backend bağlı değilken yerel demo koç modundayım. Harcamalarını kategorilere göre özetleyip güvenli, genel öneriler sunabilirim.';

    if (/(grafik|chart)/.test(lower)) {
      response += '\nCHART_DATA:{"type":"bar","title":"Yerel Demo Harcama Özeti","data":[{"label":"Market","value":3000},{"label":"Ulaşım","value":1200},{"label":"Abonelik","value":500}]}';
    } else if (/(iptal|abonelik)/.test(lower)) {
      response += '\nBu gerçek sağlayıcı işlemi değil; güvenli demo iptal akışı göstereceğim.\nAGENT_ACTION:{"action":"cancel_subscription","provider":"Netflix"}';
    } else if (/(sarmal|özet kart|roast|instagram)/.test(lower)) {
      response += '\nWRAPPED_CARD:{"title":"Bütçe Dedektifi","total_spent":"Demo veri","worst_habit":"Abonelikler","roast_text":"Küçük görünen tekrarlar ay sonunda sessizce büyüyor.","score":72}';
    } else if (/(gelecek|10 yıl|5 yıl|zaman)/.test(lower)) {
      response += '\nSIMULATION:{"status":"rich","story":"Limitlerini koruduğun senaryoda acil durum fonun güçleniyor ve büyük hedefler daha az stresli hale geliyor."}';
    }

    return jsonResponse({ response });
  }

  return jsonResponse({ error: 'Backend bağlı değil ve bu endpoint için local fallback yok.' }, 503);
}

export async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);

  const isLocalDemoSession = String(session?.access_token || '').startsWith('local-demo-token-');
  if (isLocalDemoSession && !configuredApiUrl && path.startsWith('/api/')) {
    return localApiFallback(path, options);
  }

  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers,
    });

    // Sunucu "yapılandırılmamış" dediğinde (Supabase admin ya da AI anahtarı yok)
    // kullanıcıya hata göstermek yerine yerel demo yanıtına düş.
    if (response.status === 503 && path.startsWith('/api/')) {
      const cloned = response.clone();
      const payload = await cloned.json().catch(() => ({}));
      const notConfigured =
        payload.code === 'AI_NOT_CONFIGURED' ||
        String(payload.error || '').includes('Supabase admin yapılandırması') ||
        String(payload.error || '').includes('yapılandırılmamış');
      if (notConfigured) {
        return localApiFallback(path, options);
      }
    }

    return response;
  } catch (error) {
    if (path.startsWith('/api/')) return localApiFallback(path, options);
    throw error;
  }
}
