# FinCoach AI 🚀

Kişisel finans yönetiminizi yapay zeka gücüyle kolaylaştıran, modern ve enterprise-grade bir finansal koçluk uygulaması.

## 🌟 Özellikler

### 🤖 Gerçek AI/ML Implementasyonları
- **AI Finansal Koç:** Google Gemini 2.5 Flash destekli chat — Supabase JWT korumalı backend proxy üzerinden (API key frontend'e asla açılmaz)
- **Yerel RAG (Retrieval-Augmented Generation):** Kullanıcı işlemleri üzerinde client-side Cosine Similarity ile semantik arama — veri tarayıcıdan çıkmaz
- **Federated Learning:** `@tensorflow/tfjs` ile cihaz içi gerçek model eğitimi + Laplace Differential Privacy (ε=0.25) — P2P ağ bağlantısı kontrollü demo
- **Apriori Market Basket Analysis:** 48 saatlik zaman pencereli sequential pattern mining — gerçek kullanıcı verisiyle çalışır
- **EWMA Harcama Tahmini:** Exponential Weighted Moving Average + hafta sonu çarpanı ile ay sonu projeksiyonu

### 🔒 Güvenlik & Altyapı
- **AES-GCM 256-bit Şifreleme:** Tüm yerel state WebCrypto API ile şifrelenir; anahtar IndexedDB'de non-extractable saklanır
- **Offline-First Mimari:** IndexedDB sync kuyruğu + Service Worker Background Sync ile kesintisiz kullanım
- **Optimistic Updates:** Supabase başarısız olursa transaction rollback, offline ise queue'ya ekle

### 💫 Demo Özellikleri (Açıkça Etiketlenmiş)
- **Self-Driving Money:** Nakit/borç asimetri analizi gösterimi (gerçek EFT yapılmaz)
- **Web3 Escrow:** Sesli komutla Solidity sözleşme simülasyonu (gerçek blockchain işlemi yapılmaz)
- **Dead Man's Switch:** DeFi varlık devri konsept demosu (gerçek on-chain işlem yapılmaz)

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, Vite 8, React Router v7, TailwindCSS v4, Recharts |
| State | Zustand + AES-GCM encrypted localStorage adapter |
| AI/ML | Google Gemini 2.5 Flash API, TensorFlow.js, Cosine Similarity RAG |
| Backend | Node.js, Express.js |
| Veritabanı | Supabase (PostgreSQL + Auth + RLS) |
| Offline | Service Worker (Background Sync), IndexedDB |
| Diğer | Web Speech API, jsPDF, PapaParse, react-virtuoso |

## 🚀 Kurulum & Çalıştırma

### 1. Backend (API Sunucusu)
```bash
cd server
npm install
```

`server/.env` dosyası oluşturun:
```env
PORT=3001
GEMINI_API_KEY=sizin_gemini_api_anahtariniz
SUPABASE_URL=https://proje-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key
```

```bash
npm start
# http://localhost:3001
```

### 2. Frontend
```bash
npm install
```

`.env` dosyası (root dizinde):
```env
VITE_SUPABASE_URL=https://proje-id.supabase.co
VITE_SUPABASE_ANON_KEY=public_anon_key
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
# http://localhost:5173
```

### Demo Hesabı
`demo@butceai.app` / `Demo2026!`

> **Not:** CSV import; Garanti, İş Bankası, Yapı Kredi, Akbank, Enpara, Ziraat ve genel CSV formatlarını algılar. Tekrar görünen işlemler import sırasında atlanır.

## 📄 Lisans
Hackathon/demo projesi — tüm haklar saklıdır.
