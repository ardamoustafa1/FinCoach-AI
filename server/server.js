import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Anthropic İstemcisi
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiters
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10,
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
});

const categorizeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5,
  message: { error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.' },
});

// ─── ENDPOINTS ──────────────────────────────────────────────────

// Sağlık Kontrolü
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

    const systemPrompt = `Sen BütçeAI'sın. Uzman, samimi ve finansal koçluk yapan bir yapay zekasın. 
Kullanıcının güncel finansal durumu:
- Aylık Özet: ${JSON.stringify(userContext?.aylikOzet || {})}
- Bütçe Limitleri: ${JSON.stringify(userContext?.limitler || {})}
- Hedefler: ${JSON.stringify(userContext?.hedefler || {})}
- Sağlık Skoru: ${userContext?.skor || 'Bilinmiyor'}

Kullanıcıya yardımcı olurken bu bilgileri göz önünde bulundur. Kısa ve öz cevaplar ver.

GRAFİK GÖSTERİMİ:
Kullanıcı bir grafik veya görsel veri isterse (ör: "dağılımı göster", "karşılaştır", "harcamalarımı çiz"), yanıtının EN SONUNA aşağıdaki formatta JSON ekle:
CHART_DATA:{"type":"bar|line|pie","title":"Grafik Başlığı","data":[{"label":"Kategori A","value":100},{"label":"Kategori B","value":200}]}
Başka hiçbir markdown veya kod bloğu işareti kullanma, doğrudan \`CHART_DATA:{"type"...}\` formatında ekle.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('[Chat API Error]:', error);
    res.status(500).json({ error: 'Mesajınız işlenirken bir hata oluştu.' });
  }
});

// Categorize Endpoint
app.post('/api/categorize', categorizeLimiter, async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Kategorize edilecek işlem bulunamadı.' });
    }

    const systemPrompt = `Sen Türk bankacılık sistemine ve markalarına hakim bir finans uzmanısın.
Gönderilen banka işlemlerini analiz et ve aşağıdaki kategorilerden EN UYGUN olanını seç.

KATEGORİLER: Market, Yemek Siparişi, Ulaşım, Abonelik, Fatura, Alışveriş, Sağlık, Eğlence, Restoran, Maaş, Diğer

KURALLAR:
1. Yanıtın KESİNLİKLE sadece JSON formatında olmalı.
2. JSON array içinde her bir obje { "id": "işlemin_idsi", "kategori": "seçilen_kategori" } formatında olmalıdır.
3. Başka hiçbir açıklama, yorum veya metin ekleme.`;

    const userMessage = `Aşağıdaki işlemleri kategorize et:\n\n${JSON.stringify(transactions.map(t => ({ id: t.id, aciklama: t.aciklama, magaza: t.magaza })), null, 2)}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      temperature: 0.1, // Daha tutarlı sonuçlar için
    });

    let categoryJson;
    try {
      // Claude'un dönebileceği markdown kod bloklarını temizle
      const text = response.content[0].text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      categoryJson = JSON.parse(text);
    } catch (parseError) {
      console.error('[Categorize Parse Error]:', response.content[0].text);
      return res.status(500).json({ error: 'Yapay zeka yanıtı parse edilemedi.' });
    }

    res.json(categoryJson);
  } catch (error) {
    console.error('[Categorize API Error]:', error);
    res.status(500).json({ error: 'Kategorizasyon işlemi sırasında bir hata oluştu.' });
  }
});

// Analyze Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { aylikVeri, limitler, hedefler } = req.body;

    const systemPrompt = `Sen profesyonel bir finansal danışmansın.
Kullanıcının aylık finansal durumunu analiz et ve 3-4 cümlelik öz, motive edici ve eyleme geçirilebilir bir özet çıkar.
Dili Türkçe, samimi ama profesyonel olmalı.`;

    const userMessage = `Aylık Veri: ${JSON.stringify(aylikVeri)}
Bütçe Limitleri: ${JSON.stringify(limitler)}
Hedefler: ${JSON.stringify(hedefler)}

Lütfen analiz et.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    res.json({ summary: response.content[0].text });
  } catch (error) {
    console.error('[Analyze API Error]:', error);
    res.status(500).json({ error: 'Analiz işlemi sırasında bir hata oluştu.' });
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`[BütçeAI Backend] API Server is running on port ${port}`);
});
