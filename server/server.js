import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';
import qrcode from 'qrcode-terminal';
import { createClient } from '@supabase/supabase-js';
import pkg from 'whatsapp-web.js';
import {
  createBotReplyTracker,
  createSupabaseTransactionStore,
  createWhatsAppMessageHandler,
  extractJsonObject,
} from './whatsappBot.js';
const { Client, LocalAuth } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runtimeEnv = { ...process.env };

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });
Object.assign(process.env, runtimeEnv);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
const analyticsEvents = [];
const whatsappStatus = {
  enabled: process.env.WHATSAPP_ENABLED !== 'false',
  ready: false,
  authenticated: false,
  lastEventAt: null,
  lastMessageAt: null,
  lastSavedAt: null,
  lastError: null,
  state: process.env.WHATSAPP_ENABLED === 'false' ? 'disabled' : 'starting',
};

// Google Gemini İstemcisi
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Güvenlik Headers ──────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── CORS (Origin Whitelist) ─────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (Postman, WhatsApp bot internal calls) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} izinli değil.`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiters ────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen 1 dakika sonra tekrar deneyin.' },
});

// Daha katı limiter: OCR, voice, categorize (Gemini API maliyetli)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI işlem limiti aşıldı. Lütfen bekleyin.' },
});

// ─── ENDPOINTS ──────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Supabase admin yapılandırması eksik.' });
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Oturum doğrulaması gerekli.' });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: 'Oturum geçersiz veya süresi dolmuş.' });

  req.user = data.user;
  next();
}

app.use('/api', requireAuth);

app.post('/api/events', (req, res) => {
  const rawEvents = Array.isArray(req.body?.events) ? req.body.events : [];
  const cleanEvents = rawEvents.slice(-20).map((event) => ({
    id: String(event.id || ''),
    name: String(event.name || 'unknown').slice(0, 80),
    properties: event.properties && typeof event.properties === 'object' ? event.properties : {},
    path: String(event.path || '').slice(0, 160),
    sessionId: String(event.sessionId || '').slice(0, 80),
    userId: req.user.id,
    at: event.at || new Date().toISOString(),
    receivedAt: new Date().toISOString(),
  }));

  analyticsEvents.push(...cleanEvents);
  if (analyticsEvents.length > 500) analyticsEvents.splice(0, analyticsEvents.length - 500);
  if (cleanEvents.length) {
    supabaseAdmin
      .from('app_events')
      .insert(cleanEvents.map((event) => ({
        user_id: event.userId,
        name: event.name,
        properties: event.properties,
        path: event.path,
        session_id: event.sessionId,
        occurred_at: event.at,
      })))
      .then(({ error }) => {
        if (error && !String(error.message || '').includes('app_events')) {
          console.warn('[Analytics] Event insert skipped:', error.message);
        }
      });
  }
  res.json({ ok: true });
});

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    ...whatsappStatus,
    hasSupabaseStore: Boolean(supabaseAdmin),
    defaultUserMode: Boolean(process.env.WHATSAPP_DEFAULT_USER_ID),
  });
});

// Chat Endpoint
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı.' });
    }

    const isRoastMode = userContext?.roastMode === true;
    const basePersona = isRoastMode 
      ? `Sen 'Acımasız Koç'sun. Kullanıcının kötü harcama alışkanlıklarını mizahi, alaycı ve çok sert bir dille eleştiren bir finansal zekasın. Kesinlikle kibar olma, acımasız gerçekleri yüzüne vur. Örnek: "Maaşının %20'sini kahveye yatırmışsın, tebrikler yakında kafein bağımlılığından emekli olursun."`
      : `Sen FinCoach AI'sın. Uzman, samimi ve finansal koçluk yapan bir yapay zekasın.`;

    const systemInstruction = `${basePersona} 
Kullanıcının güncel finansal durumu:
- Aylık Özet: ${JSON.stringify(userContext?.aylikOzet || {})}
- Bütçe Limitleri: ${JSON.stringify(userContext?.limitler || {})}
- Hedefler: ${JSON.stringify(userContext?.hedefler || {})}
- Sağlık Skoru: ${userContext?.skor || 'Bilinmiyor'}

GRAFİK GÖSTERİMİ:
Kullanıcı bir grafik isterse, yanıtının EN SONUNA şu formatta JSON ekle:
CHART_DATA:{"type":"bar|line|pie","title":"Başlık","data":[{"label":"A","value":100}]}

ZAMAN MAKİNESİ (SİMÜLASYON):
Kullanıcı 5 yıl, 10 yıl sonrası gibi gelecekle ilgili bir projeksiyon/simülasyon/zaman makinesi isterse, harcamalarına bakıp zengin mi yoksa fakir mi olacağını tahmin et. Yanıtının EN SONUNA şu formatta JSON ekle:
SIMULATION:{"status":"rich","story":"(Eğlenceli, kısa bir gelecek hikayesi)"}
Not: status sadece "rich" (zengin) veya "poor" (fakir) olabilir.

FİNANSAL İKİZ (TOPLULUK KIYASLAMASI):
Kullanıcı "Finansal İkizim kim", "Başkalarına göre nasılım", "Kıyasla" gibi bir soru sorarsa, anonim mock bir yaş/gelir demografisi uydur. "Senin yaşında ve gelir seviyende bir kişi gelirinin %18'ini X'e harcar, sen ise %31 harcıyorsun" şeklinde çarpıcı psikolojik yüzleşmeler yaşat. Eğer "Acımasız Koç" modu açıksa bu durumu fena halde eleştir.

ABONELİK İPTAL KOÇU VE AJANI (SUBSCRIPTION SNIPER & CANCEL AGENT):
Eğer kullanıcı aboneliklerini sorarsa dijital aboneliklere (Netflix, Spotify vb.) odaklan. Mantıksız olanı bul ve iptal etmesini söyle.
Eğer kullanıcı doğrudan "İptal et", "Netflix'i iptal et", "Spotify'ı kapat" gibi OTONOM BİR İŞLEM yapmanı emrederse, bunu yapabileceğini simüle etmek için yanıtının EN SONUNA şu formatta JSON ekle:
AGENT_ACTION:{"action":"cancel_subscription","provider":"(Abonelik Adı, Örn: Netflix)"}
Ayrıca kullanıcıya "Harika, [Provider] için iptal işlemlerini arka planda başlatıyorum. FinCoach AI otonom ajanı devrede!" gibi havalı bir metin döndür.

PAYLAŞILABİLİR SARMAL KARTI (WRAPPED / ROAST KARTI):
Kullanıcı "Sarmal", "Özet Kartı", "Beni Özetle", "Roast Kartı", "Instagram" gibi bir talepte bulunursa, Instagram Story formatında paylaşabileceği vurucu bir özet üret. Yanıtının EN SONUNA şu formatta JSON ekle:
WRAPPED_CARD:{"title":"(Örn: Anlık Zevk Takipçisi 🎯)", "total_spent":"(Örn: 3.240₺)", "worst_habit":"(Örn: Starbucks/Getir)", "roast_text":"(Kısa, acımasız ve komik bir yorum, örn: 'Bu paranın adını Barista Burs Fonu koyalım.')", "score":73}

Başka hiçbir markdown bloğu veya kod işareti kullanma (Özel JSON'lar hariç).`;

    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { maxOutputTokens: 1024 },
    });

    const lastMsg = messages[messages.length - 1].content;
    let extraContext = '';
    
    // Satın Almadan Önce Sor (E-Ticaret Scraper)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = lastMsg.match(urlRegex);
    
    if (urls && urls.length > 0) {
      try {
        const url = urls[0];
        const fetchRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }});
        const html = await fetchRes.text();
        const $ = cheerio.load(html);
        
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Ürün';
        let price = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content');
        
        if (!price) {
          price = $('.prc-dsc').first().text() || $('#offering-price').first().text() || $('.a-price-whole').first().text() || 'Bilinmiyor';
        }
        
        extraContext = `\n[SİSTEM BİLGİSİ: Kullanıcı bir ürün linki paylaştı. Ürün Adı: "${title.trim()}", Fiyatı: "${price}". Lütfen kullanıcının boşta kalan bütçesine ve aylık durumuna bakarak bu ürünü almasının finansal açıdan mantıklı olup olmadığını "Satın Almadan Önce Sor" vizyonuyla analiz et. Gerekirse bu ürünü almak için hangi aboneliklerden vazgeçebileceğini söyle.]`;
      } catch {
        extraContext = `\n[SİSTEM BİLGİSİ: Kullanıcı bir ürün linki paylaştı ancak site güvenliği nedeniyle otomatik fiyat okunamadı. Yinede linkteki ürünü analiz edip harcama yapıp yapmaması gerektiğini yorumla.]`;
      }
    }

    const prompt = `${systemInstruction}${extraContext}\n\nKullanıcı: ${lastMsg}`;
    
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error('[Chat API Error] Message:', error?.message);
    let userMessage = 'Hata oluştu. API anahtarınızı kontrol edin.';
    if (error?.message?.includes('429') || error?.message?.includes('Quota')) {
      userMessage = '⚠️ Günlük/Dakikalık limit aşıldı. Lütfen 1 dakika sonra tekrar dene veya farklı bir API key kullan.';
    }
    res.status(500).json({ error: userMessage });
  }
});

// Categorize Endpoint
app.post('/api/categorize', aiLimiter, async (req, res) => {
  try {
    const { transactions } = req.body;
    const prompt = `Aşağıdaki işlemleri kategorize et ve SADECE JSON array döndür. 
Kategoriler: Market, Yemek Siparişi, Ulaşım, Abonelik, Fatura, Alışveriş, Sağlık, Eğlence, Restoran, Maaş, Diğer
Format: [{"id": "...", "kategori": "..."}]

İşlemler: ${JSON.stringify(transactions.map(t => ({ id: t.id, aciklama: t.aciklama, magaza: t.magaza })))}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('[Categorize Error]:', error);
    res.status(500).json({ error: 'Kategorize edilemedi.' });
  }
});

// OCR Endpoint
app.post('/api/ocr', aiLimiter, async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    const base64Data = String(image).replace(/^data:[^;]+;base64,/, '');
    
    const prompt = "Bu fişteki toplam tutarı, tarihi (YYYY-MM-DD) ve mağaza adını çıkar. SADECE JSON döndür: {tutar: number, tarih: string, magaza: string}";

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: mimeType } },
      { text: prompt }
    ]);

    res.json(extractJsonObject(result.response.text()));
  } catch (error) {
    console.error('[OCR Error]:', error);
    res.status(500).json({ error: 'Fiş okunamadı.' });
  }
});

// Analyze Endpoint
app.post('/api/analyze', aiLimiter, async (req, res) => {
  try {
    const { aylikVeri, limitler, hedefler } = req.body;
    const prompt = `Aşağıdaki verileri analiz et ve Markdown formatında kısa bir özet, en iyi yapılanlar, dikkat edilecekler ve gelecek ay önerileri sun.
Veriler: ${JSON.stringify({ aylikVeri, limitler, hedefler })}`;

    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch {
    res.status(500).json({ error: 'Analiz yapılamadı.' });
  }
});

// Voice Parse Endpoint
app.post('/api/voice', aiLimiter, async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `Şu cümleden harcama detaylarını çıkar ve SADECE JSON döndür: {"tutar": number, "magaza": string, "kategori": string, "tur": "gelir"|"gider"}
Cümle: "${text}"
ÖNEMLİ: Sadece ve sadece JSON formatında yanıt ver, markdown kullanma, ekstra metin ekleme.`;

    const result = await model.generateContent(prompt);
    res.json(extractJsonObject(result.response.text()));
  } catch (error) {
    console.error("Voice API Error:", error.message);
    if (error.status === 429 || String(error.message).includes('429') || String(error.message).includes('exceeded')) {
        return res.status(429).json({ error: 'Google Gemini API kotanız doldu (429 Too Many Requests).' });
    }
    res.status(500).json({ error: 'Ses anlaşılamadı: ' + error.message });
  }
});

// ─── WHATSAPP BOT ────────────────────────────────────────────────
if (process.env.WHATSAPP_ENABLED === 'false') {
  console.log('[FinCoach AI WhatsApp] WHATSAPP_ENABLED=false, bot başlatılmadı.');
} else {
  if (!supabaseAdmin) {
    console.warn('[FinCoach AI WhatsApp] Supabase admin anahtarı yok. Fişler okunur ama transactions tablosuna kaydedilemez.');
    whatsappStatus.lastError = 'Supabase admin anahtarı yok.';
  }

  const whatsappReplyTracker = createBotReplyTracker();
  const whatsappTransactionStore = createSupabaseTransactionStore({
    supabaseAdmin,
    defaultUserId: process.env.WHATSAPP_DEFAULT_USER_ID,
    logger: console,
  });
  const handleWhatsAppMessage = createWhatsAppMessageHandler({
    model,
    transactionStore: whatsappTransactionStore,
    logger: console,
    allowGroups: process.env.WHATSAPP_ALLOW_GROUPS === 'true',
    processOwnMessages: process.env.WHATSAPP_PROCESS_OWN_MESSAGES !== 'false',
    replyTracker: whatsappReplyTracker,
    allowedPhones: process.env.WHATSAPP_ALLOWED_PHONES ? process.env.WHATSAPP_ALLOWED_PHONES.split(',') : [],
  });

  const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 WhatsApp Bot: Lütfen aşağıdaki QR kodu okutun:');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    whatsappStatus.ready = true;
    whatsappStatus.state = 'ready';
    whatsappStatus.lastEventAt = new Date().toISOString();
    whatsappStatus.lastError = null;
    console.log('[FinCoach AI WhatsApp] Bot başarıyla bağlandı ve dinliyor! 📱✅');
  });

  whatsappClient.on('authenticated', () => {
    whatsappStatus.authenticated = true;
    whatsappStatus.state = 'authenticated';
    whatsappStatus.lastEventAt = new Date().toISOString();
    console.log('[FinCoach AI WhatsApp] Oturum doğrulandı.');
  });

  whatsappClient.on('auth_failure', (message) => {
    whatsappStatus.authenticated = false;
    whatsappStatus.ready = false;
    whatsappStatus.state = 'auth_failure';
    whatsappStatus.lastEventAt = new Date().toISOString();
    whatsappStatus.lastError = String(message || 'Oturum doğrulanamadı.');
    console.error('[FinCoach AI WhatsApp] Oturum doğrulanamadı:', message);
  });

  whatsappClient.on('disconnected', (reason) => {
    whatsappStatus.ready = false;
    whatsappStatus.state = 'disconnected';
    whatsappStatus.lastEventAt = new Date().toISOString();
    whatsappStatus.lastError = String(reason || 'Bağlantı koptu.');
    console.warn('[FinCoach AI WhatsApp] Bağlantı koptu:', reason);
  });

  const trackWhatsAppMessage = async (msg) => {
    whatsappStatus.lastMessageAt = new Date().toISOString();
    const result = await handleWhatsAppMessage(msg);
    if (result?.status === 'saved') {
      whatsappStatus.lastSavedAt = new Date().toISOString();
      whatsappStatus.lastError = null;
    }
    if (result?.status === 'store_error' || result?.status === 'error') {
      whatsappStatus.lastError = result.error?.message || 'Mesaj işlenemedi.';
    }
    return result;
  };

  whatsappClient.on('message', trackWhatsAppMessage);
  whatsappClient.on('message_create', async (msg) => {
    if (msg.fromMe) await trackWhatsAppMessage(msg);
  });

  whatsappClient.initialize();
}

app.listen(PORT, HOST || undefined, () => {
  console.log(`[FinCoach AI Backend] Gemini API Server running on ${HOST || '0.0.0.0'}:${PORT}`);
});
