# FinCoach Production Deployment Guide

This guide outlines the critical steps and requirements for deploying FinCoach into a real-world, enterprise-level production environment.

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
ALLOWED_ORIGINS=https://fincoach.app,https://www.fincoach.app
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-secure-service-role-key
```

## 2. Supabase Schema Migration & RLS

Before launching, you MUST enable Row Level Security (RLS) on all Supabase tables.

1. **Enable RLS:**
   ```sql
   ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
   ```
2. **Create Policies:**
   Ensure users can only access their own data based on `auth.uid()`.
   ```sql
   CREATE POLICY "Users can view own transactions" 
   ON transactions FOR SELECT 
   USING (auth.uid() = user_id);
   ```
3. **Database Backups:**
   Enable Point-in-Time Recovery (PITR) in your Supabase project settings.

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
