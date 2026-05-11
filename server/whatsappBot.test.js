import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBotReplyTracker,
  createSupabaseTransactionStore,
  createWhatsAppMessageHandler,
  extractJsonObject,
  normalizePhone,
  normalizeTransaction,
  parseAmount,
  phonesMatch,
} from './whatsappBot.js';

function createFakeModel(responses) {
  const queue = [...responses];
  return {
    prompts: [],
    async generateContent(prompt) {
      this.prompts.push(prompt);
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return {
        response: {
          text: () => next,
        },
      };
    },
  };
}

function createFakeMessage(overrides = {}) {
  const msg = {
    from: '905551112233@c.us',
    to: '905070271251@c.us',
    fromMe: false,
    body: '',
    hasMedia: false,
    id: { _serialized: 'msg-1' },
    replies: [],
    async reply(text) {
      this.replies.push(text);
      return { id: { _serialized: `reply-${this.replies.length}` } };
    },
    async downloadMedia() {
      return null;
    },
    ...overrides,
  };
  return msg;
}

test('normalizes Turkish phone formats and WhatsApp ids', () => {
  assert.equal(normalizePhone('+90 555 111 22 33'), '905551112233');
  assert.equal(normalizePhone('0555 111 22 33'), '905551112233');
  assert.equal(normalizePhone('5551112233'), '905551112233');
  assert.equal(normalizePhone('905551112233@c.us'), '905551112233');
  assert.equal(phonesMatch('+90 555 111 22 33', '0555 111 22 33'), true);
});

test('extracts JSON from fenced or conversational AI output', () => {
  assert.deepEqual(extractJsonObject('```json\n{"tutar":125}\n```'), { tutar: 125 });
  assert.deepEqual(extractJsonObject('Tabii:\n{"islemMi":false,"tutar":null}\nİyi günler'), {
    islemMi: false,
    tutar: null,
  });
});

test('parses Turkish amounts and normalizes transaction fields', () => {
  assert.equal(parseAmount('₺1.234,56'), 1234.56);
  assert.equal(parseAmount('1,234.56 TL'), 1234.56);
  assert.equal(parseAmount('1.234'), 1234);

  const tx = normalizeTransaction(
    { tutar: '125 TL', magaza: 'Migros', kategori: 'market', tur: 'gider' },
    { now: new Date('2026-05-11T10:00:00Z') }
  );
  assert.equal(tx.tutar, 125);
  assert.equal(tx.magaza, 'Migros');
  assert.equal(tx.kategori, 'Market');
  assert.equal(tx.tarih, '2026-05-11');
});

test('saves a text transaction and replies only after store success', async () => {
  const model = createFakeModel([
    '{"islemMi":true,"tutar":125,"magaza":"Migros","kategori":"Market","tur":"gider","tarih":"2026-05-11"}',
  ]);
  const saved = [];
  const store = {
    async saveTransaction(payload) {
      saved.push(payload);
      return { ok: true, transaction: { ...payload.transaction, id: 'tx-1' } };
    },
  };
  const handler = createWhatsAppMessageHandler({
    model,
    transactionStore: store,
    now: () => new Date('2026-05-11T10:00:00Z'),
  });

  const msg = createFakeMessage({ body: 'Migros 125 TL' });
  const result = await handler(msg);

  assert.equal(result.status, 'saved');
  assert.equal(saved.length, 1);
  assert.equal(saved[0].contactId, '905551112233@c.us');
  assert.equal(saved[0].transaction.tutar, 125);
  assert.match(msg.replies[0], /sisteme kaydedildi/);
});

test('falls back to conversation when text is not a transaction', async () => {
  const model = createFakeModel([
    '{"islemMi":false,"tutar":null}',
    'Merhaba, buradayım. Fiş fotoğrafı ya da harcama mesajı gönderebilirsin.',
  ]);
  const store = {
    async saveTransaction() {
      throw new Error('save should not be called');
    },
  };
  const handler = createWhatsAppMessageHandler({ model, transactionStore: store });

  const msg = createFakeMessage({ body: 'Selam, nasılsın?' });
  const result = await handler(msg);

  assert.equal(result.status, 'chat_replied');
  assert.match(msg.replies[0], /Merhaba/);
});

test('handles receipt media by OCR parsing and saving', async () => {
  const model = createFakeModel([
    '{"islemMi":true,"tutar":"349,90","magaza":"CarrefourSA","kategori":"Market","tur":"gider","tarih":"2026-05-10"}',
  ]);
  const store = {
    async saveTransaction(payload) {
      return { ok: true, transaction: { ...payload.transaction, id: 'tx-2' } };
    },
  };
  const handler = createWhatsAppMessageHandler({ model, transactionStore: store });
  const msg = createFakeMessage({
    hasMedia: true,
    async downloadMedia() {
      return { mimetype: 'image/jpeg', data: 'base64-data' };
    },
  });

  const result = await handler(msg);

  assert.equal(result.status, 'saved');
  assert.equal(result.transaction.tutar, 349.9);
  assert.match(msg.replies[0], /Fiş okundu/);
});

test('does not claim saved when WhatsApp phone is not linked to a profile', async () => {
  const model = createFakeModel([
    '{"islemMi":true,"tutar":75,"magaza":"Kahveci","kategori":"Restoran","tur":"gider"}',
  ]);
  const store = {
    async saveTransaction() {
      return { ok: false, reason: 'unmatched_user' };
    },
  };
  const handler = createWhatsAppMessageHandler({
    model,
    transactionStore: store,
    now: () => new Date('2026-05-11T10:00:00Z'),
  });

  const msg = createFakeMessage({ body: 'Kahveci 75 TL' });
  const result = await handler(msg);

  assert.equal(result.status, 'unmatched_user');
  assert.match(msg.replies[0], /eşleşmiyor/);
});

test('Supabase store maps WhatsApp phone to profile and inserts transaction', async () => {
  let insertedRows = [];
  const fakeSupabase = {
    from(table) {
      if (table === 'profiles') {
        return {
          async select() {
            return {
              data: [{ id: 'user-1', full_name: 'Arda', phone_text: '+90 555 111 22 33', email: 'arda@example.com' }],
              error: null,
            };
          },
        };
      }

      if (table === 'transactions') {
        return {
          insert(rows) {
            insertedRows = rows;
            return {
              select() {
                return {
                  async single() {
                    return { data: { id: 'tx-db' }, error: null };
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };

  const store = createSupabaseTransactionStore({ supabaseAdmin: fakeSupabase });
  const result = await store.saveTransaction({
    contactId: '905551112233@c.us',
    transaction: {
      aciklama: 'Migros harcaması',
      tutar: 125,
      tarih: '2026-05-11',
      kategori: 'Market',
      magaza: 'Migros',
      tur: 'gider',
    },
    messageId: 'msg-1',
  });

  assert.equal(result.ok, true);
  assert.equal(result.transaction.id, 'tx-db');
  assert.equal(insertedRows[0].user_id, 'user-1');
  assert.equal(insertedRows[0].magaza, 'Migros');
});

test('skips bot replies when processing own WhatsApp messages is enabled', async () => {
  const tracker = createBotReplyTracker({ ttlMs: 10_000 });
  tracker.mark('✅ İşlem sisteme kaydedildi.');

  const handler = createWhatsAppMessageHandler({
    model: createFakeModel([]),
    processOwnMessages: true,
    replyTracker: tracker,
  });
  const msg = createFakeMessage({
    fromMe: true,
    body: '✅ İşlem sisteme kaydedildi.',
  });

  const result = await handler(msg);
  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'bot_reply');
});
