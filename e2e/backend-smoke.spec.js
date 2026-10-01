import { test, expect } from '@playwright/test';

test.describe('Backend Smoke Tests', () => {
  test('GET /health yapılandırma durumunu döndürmeli', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('ai');
    expect(body).toHaveProperty('auth');
    expect(response.headers()['permissions-policy']).toContain('microphone=(self)');
  });

  test('CORS yalnızca açıkça izin verilen originleri kabul etmeli', async ({ request }) => {
    const trusted = await request.get('/health', {
      headers: { Origin: 'http://localhost:5173' },
    });
    expect(trusted.headers()['access-control-allow-origin']).toBe('http://localhost:5173');

    const untrusted = await request.get('/health', {
      headers: { Origin: 'https://saldirgan.vercel.app' },
    });
    expect(untrusted.headers()['access-control-allow-origin']).toBeUndefined();
  });

  test('GET /api/whatsapp/status 200 dönmeli', async ({ request }) => {
    const response = await request.get('/api/whatsapp/status');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });

  test('POST /api/chat geçerli bir durum kodu dönmeli (asla 404/500 değil)', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { messages: [{ role: 'user', content: 'Merhaba' }] },
    });
    // 200 = AI yapılandırılmış · 503 = GEMINI_API_KEY yok · 400/401/403 = giriş/doğrulama
    expect([200, 400, 401, 403, 429, 503]).toContain(response.status());
  });

  test('POST /api/events analitik olaylarını kabul etmeli', async ({ request }) => {
    const response = await request.post('/api/events', {
      data: { events: [{ id: 'test-1', name: 'smoke_test', path: '/', sessionId: 's1' }] },
    });
    expect([200, 401, 503]).toContain(response.status());
  });

  test('Bilinmeyen /api ucu 404 dönmeli, index.html değil', async ({ request }) => {
    const response = await request.get('/api/olmayan-uc');
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const type = response.headers()['content-type'] || '';
    expect(type).not.toContain('text/html');
  });
});
