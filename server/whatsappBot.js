const DEFAULT_CATEGORIES = [
  'Market',
  'Yemek Siparişi',
  'Ulaşım',
  'Abonelik',
  'Fatura',
  'Alışveriş',
  'Sağlık',
  'Eğlence',
  'Restoran',
  'Maaş',
  'Diğer',
];

const PROFILE_CACHE_MS = 60 * 1000;
const REPLY_TRACKER_TTL_MS = 20 * 1000;

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const asCleanString = (value, fallback = '', maxLength = 120) => {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  return clean.slice(0, maxLength);
};

export function normalizePhone(value) {
  let digits = String(value || '')
    .replace(/@(c|g)\.us$/i, '')
    .replace(/@s\.whatsapp\.net$/i, '')
    .replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('5')) return `90${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `90${digits.slice(1)}`;
  return digits;
}

export function phonesMatch(left, right) {
  const a = normalizePhone(left);
  const b = normalizePhone(right);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.slice(-10) === b.slice(-10);
}

export function extractJsonObject(rawText) {
  const cleaned = String(rawText || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  if (!cleaned) throw new Error('Boş AI yanıtı');

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error(`AI yanıtından JSON çıkarılamadı: ${cleaned.slice(0, 160)}`);
    }
    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

export function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.abs(value) : null;

  let text = String(value || '').trim();
  if (!text) return null;

  text = text.replace(/[^\d,.-]/g, '');
  if (!text || text === '-' || text === '.') return null;

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      text = text.replace(/\./g, '').replace(',', '.');
    } else {
      text = text.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    text = text.replace(',', '.');
  } else if ((text.match(/\./g) || []).length > 1) {
    text = text.replace(/\./g, '');
  } else if (/^\d+\.\d{3}$/.test(text)) {
    text = text.replace('.', '');
  }

  const amount = Number(text);
  return Number.isFinite(amount) && amount > 0 ? Math.abs(amount) : null;
}

export function normalizeDate(value, now = new Date()) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) return text;
  }
  return now.toISOString().slice(0, 10);
}

export function normalizeCategory(value) {
  const wanted = normalizeText(value);
  if (!wanted) return 'Diğer';

  const exact = DEFAULT_CATEGORIES.find((category) => normalizeText(category) === wanted);
  if (exact) return exact;

  const aliases = {
    yemek: 'Yemek Siparişi',
    restoran: 'Restoran',
    cafe: 'Restoran',
    kafe: 'Restoran',
    market: 'Market',
    ulasim: 'Ulaşım',
    taksi: 'Ulaşım',
    benzin: 'Ulaşım',
    maas: 'Maaş',
    gelir: 'Maaş',
    fatura: 'Fatura',
    abonelik: 'Abonelik',
    alisveris: 'Alışveriş',
    saglik: 'Sağlık',
    eglence: 'Eğlence',
  };

  return aliases[wanted] || 'Diğer';
}

export function normalizeTransaction(raw, { source = 'whatsapp_text', now = new Date() } = {}) {
  if (!raw || raw.islemMi === false || raw.transaction === false) return null;

  const amount = parseAmount(raw.tutar ?? raw.amount ?? raw.total);
  if (!amount) return null;

  const merchantFallback = source === 'whatsapp_receipt' ? 'Fiş' : 'WhatsApp';
  const merchant = asCleanString(raw.magaza ?? raw.merchant ?? raw.yer, merchantFallback, 90);
  const category = normalizeCategory(raw.kategori ?? raw.category);
  const type = normalizeText(raw.tur ?? raw.type).includes('gelir') ? 'gelir' : 'gider';
  const date = normalizeDate(raw.tarih ?? raw.date, now);
  const description = asCleanString(
    raw.aciklama ?? raw.description,
    source === 'whatsapp_receipt' ? `${merchant} fişi` : `${merchant} harcaması`,
    160
  );

  return {
    aciklama: description,
    tutar: amount,
    tarih: date,
    kategori: category,
    magaza: merchant,
    tur: type,
  };
}

export async function parseReceiptFromMedia({ model, media, now = new Date() }) {
  if (!media?.data || !media?.mimetype?.startsWith('image/')) return null;

  const prompt = `Bu görüntü bir fiş/fatura ise harcama bilgilerini çıkar.
SADECE geçerli JSON döndür:
{"islemMi": true, "tutar": number|null, "tarih": "YYYY-MM-DD"|null, "magaza": string|null, "kategori": "Market|Yemek Siparişi|Ulaşım|Abonelik|Fatura|Alışveriş|Sağlık|Eğlence|Restoran|Maaş|Diğer"|null, "tur": "gider", "aciklama": string|null}
Görüntü fiş değilse veya toplam tutar okunmuyorsa {"islemMi": false, "tutar": null} döndür.`;

  const result = await model.generateContent([
    { inlineData: { data: media.data, mimeType: media.mimetype } },
    { text: prompt },
  ]);

  const raw = extractJsonObject(result.response.text());
  return normalizeTransaction(raw, { source: 'whatsapp_receipt', now });
}

export async function parseTransactionFromText({ model, text, now = new Date() }) {
  const prompt = `Aşağıdaki WhatsApp mesajı bir harcama veya gelir kaydı ise bilgileri çıkar.
Mesaj sadece sohbet, soru veya selamlaşma ise islemMi false döndür.
SADECE geçerli JSON döndür:
{"islemMi": boolean, "tutar": number|null, "tarih": "YYYY-MM-DD"|null, "magaza": string|null, "kategori": "Market|Yemek Siparişi|Ulaşım|Abonelik|Fatura|Alışveriş|Sağlık|Eğlence|Restoran|Maaş|Diğer"|null, "tur": "gelir"|"gider"|null, "aciklama": string|null}
Mesaj: "${String(text || '').slice(0, 700)}"`;

  const result = await model.generateContent(prompt);
  const raw = extractJsonObject(result.response.text());
  return normalizeTransaction(raw, { source: 'whatsapp_text', now });
}

export async function generateChatReply({ model, text }) {
  const prompt = `Sen FinCoach AI'ın WhatsApp asistanısın. Kullanıcıyla Türkçe, kısa, samimi ve net konuş. Finansal kayıt yapman gerekmiyorsa sadece yanıt ver. Maksimum 2 cümle.
Mesaj: "${String(text || '').slice(0, 700)}"`;
  const result = await model.generateContent(prompt);
  return asCleanString(result.response.text(), 'Merhaba, buradayım. Fiş fotoğrafı veya harcama mesajı gönderebilirsin.', 700);
}

export function createBotReplyTracker({ ttlMs = REPLY_TRACKER_TTL_MS } = {}) {
  const replies = new Map();
  const keyFor = (text) => normalizeText(text).slice(0, 500);

  const prune = () => {
    const now = Date.now();
    for (const [key, expiresAt] of replies.entries()) {
      if (expiresAt <= now) replies.delete(key);
    }
  };

  return {
    mark(text) {
      prune();
      replies.set(keyFor(text), Date.now() + ttlMs);
    },
    has(text) {
      prune();
      return replies.has(keyFor(text));
    },
  };
}

export function getMessageContactId(msg) {
  if (msg?.from?.endsWith('@g.us') && msg.author) return msg.author;
  return msg?.fromMe ? msg.to : msg.from;
}

export function createSupabaseTransactionStore({
  supabaseAdmin,
  defaultUserId,
  logger = console,
  profileCacheMs = PROFILE_CACHE_MS,
} = {}) {
  let profileCache = { fetchedAt: 0, data: [] };

  const getProfiles = async () => {
    const now = Date.now();
    if (profileCache.data.length && now - profileCache.fetchedAt < profileCacheMs) {
      return profileCache.data;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone_text, email');

    if (error) throw new Error(`Profil listesi okunamadı: ${error.message}`);

    profileCache = { fetchedAt: now, data: data || [] };
    return profileCache.data;
  };

  const resolveUser = async (contactId) => {
    if (defaultUserId) return { id: defaultUserId, match: 'default' };

    const contactPhone = normalizePhone(contactId);
    if (!contactPhone) return null;

    const profiles = await getProfiles();
    const profile = profiles.find((item) => phonesMatch(item.phone_text, contactPhone));
    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.full_name || profile.email || '',
      match: 'phone',
    };
  };

  return {
    async saveTransaction({ contactId, transaction, messageId }) {
      if (!supabaseAdmin) return { ok: false, reason: 'not_configured' };

      const user = await resolveUser(contactId);
      if (!user) return { ok: false, reason: 'unmatched_user' };

      const payload = {
        user_id: user.id,
        aciklama: transaction.aciklama,
        tutar: transaction.tutar,
        tarih: transaction.tarih,
        kategori: transaction.kategori,
        magaza: transaction.magaza,
        tur: transaction.tur,
      };

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert([payload])
        .select('id')
        .single();

      if (error) {
        logger.error?.('[WhatsApp Supabase Insert Error]', { messageId, error });
        throw new Error(`İşlem kaydedilemedi: ${error.message}`);
      }

      return {
        ok: true,
        user,
        transaction: { ...transaction, id: data?.id },
      };
    },
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export function formatSavedReply(transaction, { receipt = false } = {}) {
  const title = receipt ? 'Fiş okundu ve sisteme kaydedildi.' : 'İşlem sisteme kaydedildi.';
  return [
    `✅ ${title}`,
    '',
    `🏪 Yer: ${transaction.magaza || 'Bilinmiyor'}`,
    `💰 Tutar: ${formatCurrency(transaction.tutar)}`,
    `📂 Kategori: ${transaction.kategori || 'Diğer'}`,
    `📅 Tarih: ${transaction.tarih}`,
  ].join('\n');
}

export function formatUnmatchedUserReply(transaction) {
  return [
    'Fişi/harcamayı okudum ama sisteme kaydedemedim.',
    '',
    `Bulduğum işlem: ${transaction.magaza} - ${formatCurrency(transaction.tutar)}`,
    'Bu WhatsApp numarası uygulamadaki profil telefonuyla eşleşmiyor. Ayarlar > Kişisel Bilgiler bölümündeki telefon numaranı WhatsApp numaranla aynı formatta kaydet.',
  ].join('\n');
}

export function formatStoreErrorReply(error) {
  const detail = error?.message ? `\nDetay: ${error.message}` : '';
  return `Fişi/harcamayı okudum ama veritabanına kaydederken sorun yaşadım.${detail}`;
}

export function createWhatsAppMessageHandler({
  model,
  transactionStore,
  logger = console,
  allowGroups = false,
  processOwnMessages = false,
  replyTracker = createBotReplyTracker(),
  now = () => new Date(),
} = {}) {
  const sendReply = async (msg, text) => {
    replyTracker.mark(text);
    return msg.reply(text);
  };

  const persistAndReply = async ({ msg, contactId, transaction, receipt }) => {
    try {
      const result = await transactionStore?.saveTransaction?.({
        contactId,
        transaction,
        messageId: msg?.id?._serialized || msg?.id?.id,
      });

      if (result?.ok) {
        await sendReply(msg, formatSavedReply(result.transaction, { receipt }));
        return { status: 'saved', transaction: result.transaction };
      }

      if (result?.reason === 'unmatched_user') {
        await sendReply(msg, formatUnmatchedUserReply(transaction));
        return { status: 'unmatched_user', transaction };
      }

      await sendReply(
        msg,
        'Fişi/harcamayı okudum ama sisteme kaydedemedim. Sunucuda SUPABASE_SERVICE_ROLE_KEY ve SUPABASE_URL ayarlı olmalı.'
      );
      return { status: 'store_not_configured', transaction };
    } catch (error) {
      logger.error?.('[WhatsApp Store Error]', error);
      await sendReply(msg, formatStoreErrorReply(error));
      return { status: 'store_error', error };
    }
  };

  return async function handleWhatsAppMessage(msg) {
    if (!msg || msg.from === 'status@broadcast') return { status: 'skipped', reason: 'status' };
    if (!allowGroups && (msg.from?.endsWith('@g.us') || msg.to?.endsWith('@g.us'))) {
      return { status: 'skipped', reason: 'group' };
    }
    if (msg.fromMe && !processOwnMessages) return { status: 'skipped', reason: 'own_message_disabled' };
    if (msg.fromMe && replyTracker.has(msg.body || msg.caption || '')) {
      return { status: 'skipped', reason: 'bot_reply' };
    }

    const contactId = getMessageContactId(msg);

    try {
      if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const transaction = await parseReceiptFromMedia({ model, media, now: now() });
        if (!transaction) {
          await sendReply(msg, 'Fişte toplam tutarı net okuyamadım. Daha aydınlık ve düz çekilmiş bir fotoğraf gönderebilir misin?');
          return { status: 'receipt_unreadable' };
        }
        return persistAndReply({ msg, contactId, transaction, receipt: true });
      }

      const body = asCleanString(msg.body, '', 1000);
      if (!body) return { status: 'skipped', reason: 'empty' };

      const transaction = await parseTransactionFromText({ model, text: body, now: now() });
      if (transaction) {
        return persistAndReply({ msg, contactId, transaction, receipt: false });
      }

      const reply = await generateChatReply({ model, text: body });
      await sendReply(msg, reply);
      return { status: 'chat_replied' };
    } catch (error) {
      logger.error?.('[WhatsApp Error]', error);
      await sendReply(msg, 'Üzgünüm, bu mesajı işlerken bir sorun yaşadım. Bir daha dener misin?');
      return { status: 'error', error };
    }
  };
}
