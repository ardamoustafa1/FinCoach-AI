# FinCoach Production Deployment Guide

This guide outlines the critical steps and requirements for deploying FinCoach into a real-world, enterprise-level production environment.

## 0. Yayın Öncesi Kontrol Listesi

Tüm adımlar yerelde doğrulanmıştır:

```bash
npm run lint          # 0 hata
npm run typecheck     # 0 hata
npm run build         # başarılı
npm run test:unit     # 5/5
npm run test:e2e      # 21/21
npm run db:verify     # canlı şema/RLS doğrulaması
npm audit             # 0 açık
cd server && npm audit                   # 0 açık
```

### Zorunlu ortam değişkenleri

| Değişken | Yoksa ne olur |
|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Uygulama yerel demo Supabase taklidine düşer |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/*` uçları **503** döner (istemci yerel demo yanıtına düşer) |
| `DATABASE_URL` | Migration ve veritabanı doğrulama komutları çalışmaz |
| `GEMINI_API_KEY` | Yapay zekâ uçları **503 `AI_NOT_CONFIGURED`** döner (istemci yerel koça düşer) |
| `ALLOWED_ORIGINS` | Yalnızca localhost origin'leri kabul edilir |

Yapılandırma durumunu canlıda `GET /health` ile doğrulayın:

```json
{ "status": "ok", "ai": "configured", "auth": "configured", "uptime": 42 }
```

### ⚠️ DEMO_MODE

`DEMO_MODE=true` tüm `/api` kimlik doğrulamasını atlar; yalnızca yerel geliştirme
ve e2e testleri içindir. `NODE_ENV=production` ile birlikte verilirse sunucu
başlamayı reddeder.

### WhatsApp botu (isteğe bağlı)

`whatsapp-web.js` şu anda Puppeteer zincirindeki düzeltilmemiş `extract-zip`
güvenlik bildirimi nedeniyle varsayılan production bağımlılıklarına dahil
değildir. `WHATSAPP_ENABLED=false` bırakın. Upstream güvenli sürüm yayımlandıktan
sonra paket ayrıca eklenip bot etkinleştirilebilir; sunucu paketi eksikken güvenli
biçimde çalışmaya devam eder ve açık bir durum mesajı döndürür.

## 1. Environment Matrix

Ensure the following environment variables are correctly set in the production environment (`.env` for frontend build, and server-side `.env` for the API).

**Frontend (`.env.production`)**
```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_API_URL=https://api.fincoach.app
```

**Backend (`server/.env`)**
```env
PORT=3001
HOST=0.0.0.0
GEMINI_API_KEY=your-secure-gemini-key
GEMINI_MODEL=gemini-3.7-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash
DATABASE_URL=postgresql://postgres.project-ref:password@pooler-host:6543/postgres
ALLOWED_ORIGINS=https://fincoach.app,https://www.fincoach.app
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secure-service-role-key
```

## 2. Supabase Schema Migration & RLS

Şema `supabase/migrations` altında sürümlenir. Migration kilit, checksum ve transaction
korumasıyla uygulanır; uygulanmış dosya sonradan değiştirilirse komut hata verir.

```bash
node --env-file=server/.env scripts/migrate-database.mjs
node --env-file=server/.env scripts/verify-database.mjs
```

Tüm `public` tablolarında RLS zorunludur. Politikalar işlem başına ayrı tanımlanır,
`anon` rolünün erişimi kaldırılır ve `user_id` filtreleri indekslenir. Supabase proje
ayarlarından günlük yedeklemeyi ve üretim planında Point-in-Time Recovery'yi açın.

## 3. CORS Configuration

The backend Express server uses a strict whitelist for CORS.
- Update the `ALLOWED_ORIGINS` environment variable to include ONLY the exact production domains.
- Do not use wildcards (`*`) in production.

## 4. Rollback Plan

In the event of a critical failure after deployment:
1. **Frontend:** Use Vercel/Netlify instant rollback to revert to the previous successful build.
2. **Backend:** If hosted on Railway/Render, trigger a redeploy of the previous commit.
3. **Database:** Supabase migrations should be backward compatible. If a destructive migration was applied, use PITR to restore the database to the state immediately before the migration.

## 5. Monitoring & Logging

- Implement an error tracking pipeline (e.g., Sentry) in both `src/main.jsx` and `server/server.js`.
- Monitor API limits for Google Gemini API to prevent billing spikes.
