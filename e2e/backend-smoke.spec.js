import { test, expect } from '@playwright/test';

test.describe('Backend Smoke Tests', () => {
  test('GET /api/whatsapp/status should return 200', async ({ request }) => {
    const response = await request.get('/api/whatsapp/status');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });

  test('POST /api/chat should handle unauthorized or return valid response', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: {
        message: 'Hello',
        history: []
      }
    });
    
    // We expect either 200 or 401 depending on auth state, but NOT 404 or 500
    expect([200, 400, 401, 403]).toContain(response.status());
  });

  test('GET /api/events should support SSE or return valid endpoint', async ({ request }) => {
    // We just do a quick GET to see if it's 200 (SSE stream might stay open, so we check headers)
    const response = await request.get('/api/events');
    expect(response.ok()).toBeTruthy();
    
    // Server-Sent Events should have specific content type
    const contentType = response.headers()['content-type'];
    if (contentType) {
      expect(contentType).toContain('text/event-stream');
    }
  });
});
