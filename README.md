# FinCoach AI (BütçeAI) 🚀

BütçeAI, kişisel finans yönetiminizi yapay zeka gücüyle kolaylaştıran, modern ve akıllı bir finansal koçluk uygulamasıdır.

## 🌟 Özellikler
*   **🤖 AI Finansal Koç:** Google Gemini 1.5 Flash destekli interaktif sohbet arayüzü ile harcamalarınızı analiz edin ve tavsiye alın.
*   **📸 Fiş Tarama (OCR):** Fişlerinizin fotoğrafını yükleyerek harcama tutarı, tarihi ve mağaza adını otomatik çıkarın.
*   **🎙️ Sesli Harcama Ekleme:** "Starbucks'ta 150 lira kahve içtim" diyerek saniyeler içinde gider kaydedin.
*   **📊 Dinamik Raporlar:** Harcamalarınızı kategorik olarak analiz edin ve tek tıkla PDF olarak indirin.
*   **🌍 ESG & Karbon Ayak İzi:** Harcamalarınızın çevresel etkisini hesaplayıp "Sürdürülebilir Bütçe" önerileri alın.
*   **✨ Premium Glassmorphism UI:** Modern, karanlık tema tabanlı, akıcı animasyonlara sahip muazzam bir kullanıcı deneyimi.

## 🛠️ Teknolojiler
*   **Frontend:** React (v19), Vite, React Router v7, Tailwind CSS (v4), Recharts
*   **Backend:** Node.js, Express.js
*   **Yapay Zeka:** Google Generative AI (Gemini 1.5 Flash)

## 🚀 Kurulum & Çalıştırma

Projeyi lokalinizde çalıştırmak için iki terminal kullanmanız gerekmektedir (Biri arayüz, diğeri API sunucusu için).

### 1. Backend (API Sunucusu)
Öncelikle sunucu klasörüne gidin ve bağımlılıkları kurun:
\`\`\`bash
cd server
npm install
\`\`\`
`.env` dosyanızı oluşturun veya güncelleyin. Google AI Studio'dan aldığınız anahtarı ekleyin:
\`\`\`env
PORT=3001
GEMINI_API_KEY=sizin_gemini_api_anahtariniz_buraya
SUPABASE_URL=https://proje-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sadece_serverda_kullanilacak_service_role_key
\`\`\`
WhatsApp fiş/metin kayıtlarının veritabanına yazılabilmesi için `SUPABASE_SERVICE_ROLE_KEY` gereklidir. Numara eşleştirme varsayılan olarak `profiles.phone_text` alanına göre yapılır; tek kullanıcı/demo kurulumunda tüm WhatsApp kayıtlarını belirli bir kullanıcıya yazmak için `WHATSAPP_DEFAULT_USER_ID` ayarlanabilir.

Demo hesabını canlı Supabase projesinde oluşturmak ve satış/demo verileriyle doldurmak için:
\`\`\`bash
npm run seed:demo
\`\`\`
Varsayılan demo girişi: `demo@butceai.app` / `Demo2026!`. Normal kayıt olan kullanıcıların işlem, hedef ve limit verileri boş başlar.

### Üretim Notları
*   API endpointleri Supabase oturum tokenı ister; client istekleri otomatik `Authorization: Bearer ...` ile gider.
*   WhatsApp operasyon durumu Ayarlar ekranından izlenebilir.
*   CSV import Garanti, İş Bankası, Yapı Kredi, Akbank, Enpara, Ziraat ve genel CSV formatlarını algılar; tekrar görünen işlemler içe aktarımda atlanır.
*   Ürün analitiği ve frontend hata olayları `/api/events` üzerinden toplanır. Kalıcı saklama için `supabase_schema.sql` içindeki `app_events` tablosunu canlı Supabase projesine uygulayın.

Sunucuyu başlatın:
\`\`\`bash
npm start
\`\`\`
*(Sunucu http://localhost:3001 adresinde çalışacaktır)*

### 2. Frontend (React Arayüzü)
Ana dizinde (FinCoach-AI) yeni bir terminal açın ve bağımlılıkları kurun:
\`\`\`bash
npm install
\`\`\`
`.env` dosyanızda sadece public frontend değişkenlerini tutun:
\`\`\`env
VITE_SUPABASE_URL=https://proje-id.supabase.co
VITE_SUPABASE_ANON_KEY=public_anon_key
VITE_API_URL=http://localhost:3001
\`\`\`
Canlı deploy için `VITE_API_URL` değerini deploy edilmiş backend originine ayarlayın; Gemini ve Supabase service-role anahtarlarını frontend env dosyalarına koymayın.

Arayüzü başlatın:
\`\`\`bash
npm run dev
\`\`\`
*(Arayüz http://localhost:5173 adresinde açılacaktır)*

## 📄 Lisans
Bu proje geliştirilmeye açık bir hackathon/demo projesidir.
