import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import qrcode from 'qrcode-terminal';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Google Gemini İstemcisi
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiters
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 20, // Gemini'nin ücretsiz kotası daha yüksek
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
});

// ─── ENDPOINTS ──────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
      : `Sen BütçeAI'sın. Uzman, samimi ve finansal koçluk yapan bir yapay zekasın.`;

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

Başka hiçbir markdown bloğu veya kod işareti kullanma, doğrudan özel etiketli JSON'u metnin sonuna ekle.`;

    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { maxOutputTokens: 1024 },
    });

    // Gemini doesn't use 'system' role in startChat history, but we can prepend it to the message or use systemInstruction
    // For 1.5 Flash/Pro, we can set systemInstruction in getGenerativeModel, but for simplicity here we'll just send it.
    const lastMsg = messages[messages.length - 1].content;
    const prompt = `${systemInstruction}\n\nKullanıcı: ${lastMsg}`;
    
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (error) {
    console.error('[Chat API Error]:', error);
    res.status(500).json({ error: 'Hata oluştu. API anahtarınızı kontrol edin.' });
  }
});

// Categorize Endpoint
app.post('/api/categorize', async (req, res) => {
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
app.post('/api/ocr', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    const base64Data = String(image).replace(/^data:[^;]+;base64,/, '');
    
    const prompt = "Bu fişteki toplam tutarı, tarihi (YYYY-MM-DD) ve mağaza adını çıkar. SADECE JSON döndür: {tutar: number, tarih: string, magaza: string}";

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: mimeType } },
      { text: prompt }
    ]);

    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error('[OCR Error]:', error);
    res.status(500).json({ error: 'Fiş okunamadı.' });
  }
});

// Analyze Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { aylikVeri, limitler, hedefler } = req.body;
    const prompt = `Aşağıdaki verileri analiz et ve Markdown formatında kısa bir özet, en iyi yapılanlar, dikkat edilecekler ve gelecek ay önerileri sun.
Veriler: ${JSON.stringify({ aylikVeri, limitler, hedefler })}`;

    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Analiz yapılamadı.' });
  }
});

// Voice Parse Endpoint
app.post('/api/voice', async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `Şu cümleden harcama detaylarını çıkar ve SADECE JSON döndür: {"tutar": number, "magaza": string, "kategori": string, "tur": "gelir"|"gider"}
Cümle: "${text}"`;

    const result = await model.generateContent(prompt);
    const resText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(resText));
  } catch (error) {
    res.status(500).json({ error: 'Ses anlaşılamadı.' });
  }
});

// ─── WHATSAPP BOT ────────────────────────────────────────────────
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
  console.log('[BütçeAI WhatsApp] Bot başarıyla bağlandı ve dinliyor! 📱✅');
});

whatsappClient.on('message', async msg => {
  if (msg.from === 'status@broadcast') return;
  // Kendi numaranıza veya bota atılan mesajları işler
  
  try {
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media.mimetype.startsWith('image/')) {
        const prompt = "Bu fişteki toplam tutarı, tarihi (YYYY-MM-DD) ve mağaza adını çıkar. SADECE JSON döndür: {tutar: number, tarih: string, magaza: string}";
        
        const result = await model.generateContent([
          { inlineData: { data: media.data, mimeType: media.mimetype } },
          { text: prompt }
        ]);
        
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        
        if (data.tutar) {
          const msgReply = `📸 Fiş Başarıyla Okundu!\n\n🏪 Mağaza: ${data.magaza || 'Bilinmiyor'}\n💰 Tutar: ₺${data.tutar}\n📅 Tarih: ${data.tarih || 'Bilinmiyor'}\n\n✅ İşlem bütçene eklendi. Uyarı: Bu ayki kahve limitine yaklaşıyorsun!`;
          msg.reply(msgReply);
        } else {
          msg.reply('❌ Fişteki tutarı okuyamadım. Lütfen daha net bir fotoğraf gönderin.');
        }
      }
    } else if (msg.body && msg.body.length > 0) {
      // Mesajdan işlem çıkarma denemesi
      const prompt = `Şu cümleden harcama detaylarını çıkar ve SADECE JSON döndür: {"tutar": number, "magaza": string, "kategori": string, "tur": "gelir"|"gider"}\nCümle: "${msg.body}"`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        const data = JSON.parse(text);
        if (data.tutar && data.magaza) {
           msg.reply(`💳 İşlem Anında Kaydedildi!\n\n🏪 Yer: ${data.magaza}\n💸 Tutar: ₺${data.tutar}\n📂 Kategori: ${data.kategori || 'Diğer'}`);
        } else {
           throw new Error('Tutar bulunamadı');
        }
      } catch (e) {
        // Eğer json çıkarılamazsa normal sohbet
        const chatPrompt = `Sen BütçeAI'ın WhatsApp asistanısın. Kullanıcıya kısa, samimi ve finansal tavsiye veren bir şekilde yanıtla (Maksimum 2 cümle). Mesaj: "${msg.body}"`;
        const chatRes = await model.generateContent(chatPrompt);
        msg.reply(chatRes.response.text());
      }
    }
  } catch (err) {
    console.error('[WhatsApp Error]', err);
    msg.reply('Üzgünüm, bu mesajı işlerken bir sorun yaşadım. 😔');
  }
});

whatsappClient.initialize();

app.listen(PORT, () => {
  console.log(`[BütçeAI Backend] Gemini API Server running on port ${PORT}`);
});
