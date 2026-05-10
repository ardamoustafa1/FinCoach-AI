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
\`\`\`
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
Arayüzü başlatın:
\`\`\`bash
npm run dev
\`\`\`
*(Arayüz http://localhost:5173 adresinde açılacaktır)*

## 📄 Lisans
Bu proje geliştirilmeye açık bir hackathon/demo projesidir.
