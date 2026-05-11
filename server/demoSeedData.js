export const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@butceai.app';
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo2026!';

export const demoProfile = {
  full_name: 'BütçeAI Demo',
  phone_text: '0 (555) 000 00 00',
  email: DEMO_EMAIL,
  onboarding_completed: true,
};

export const demoBudgetLimits = {
  Market: 14000,
  'Yemek Siparişi': 6500,
  Ulaşım: 4500,
  Abonelik: 1600,
  Fatura: 5200,
  Alışveriş: 9000,
  Eğlence: 3500,
  Sağlık: 3200,
};

export const demoGoals = [
  {
    name: 'Acil Durum Fonu',
    targetAmount: 180000,
    currentAmount: 118500,
    deadline: '2026-12-31',
    icon: '🛡️',
    color: '#6366F1',
  },
  {
    name: 'Yaz Tatili',
    targetAmount: 95000,
    currentAmount: 46200,
    deadline: '2026-08-15',
    icon: '✈️',
    color: '#10B981',
  },
  {
    name: 'Yeni MacBook',
    targetAmount: 125000,
    currentAmount: 38000,
    deadline: '2026-10-01',
    icon: '💻',
    color: '#F59E0B',
  },
  {
    name: 'Borç Kapatma',
    targetAmount: 60000,
    currentAmount: 42000,
    deadline: '2026-07-01',
    icon: '✅',
    color: '#EF4444',
  },
];

export const demoTransactions = [
  ['2026-05-01', 72000, 'Maaş ödemesi - Mayıs', 'İşveren', 'Maaş', 'gelir'],
  ['2026-05-02', 3250, 'Haftalık market alışverişi', 'Migros', 'Market', 'gider'],
  ['2026-05-03', 485, 'Kahve ve toplantı', 'Petra Coffee', 'Restoran', 'gider'],
  ['2026-05-04', 1250, 'İstanbulkart aylık yükleme', 'İstanbulkart', 'Ulaşım', 'gider'],
  ['2026-05-05', 229, 'Spotify aile planı', 'Spotify', 'Abonelik', 'gider'],
  ['2026-05-05', 349, 'Netflix aboneliği', 'Netflix', 'Abonelik', 'gider'],
  ['2026-05-06', 1840, 'Elektrik faturası', 'BEDAŞ', 'Fatura', 'gider'],
  ['2026-05-07', 980, 'Takım yemeği', 'BigChefs', 'Restoran', 'gider'],
  ['2026-05-08', 4200, 'Online alışveriş', 'Trendyol', 'Alışveriş', 'gider'],
  ['2026-05-09', 680, 'Eczane harcaması', 'Eczane', 'Sağlık', 'gider'],
  ['2026-05-10', 16000, 'Freelance danışmanlık', 'Finansal Eğitim Atölyesi', 'Maaş', 'gelir'],
  ['2026-05-10', 2190, 'Market stok alışverişi', 'CarrefourSA', 'Market', 'gider'],
  ['2026-05-11', 760, 'WhatsApp fiş demosu - öğle yemeği', 'Sushico', 'Restoran', 'gider'],
  ['2026-04-01', 72000, 'Maaş ödemesi - Nisan', 'İşveren', 'Maaş', 'gelir'],
  ['2026-04-02', 2920, 'Haftalık market alışverişi', 'Macrocenter', 'Market', 'gider'],
  ['2026-04-04', 1320, 'Doğalgaz faturası', 'İGDAŞ', 'Fatura', 'gider'],
  ['2026-04-05', 1199, 'Yapay zeka aracı aboneliği', 'OpenAI', 'Abonelik', 'gider'],
  ['2026-04-07', 830, 'Taksi yolculuğu', 'BiTaksi', 'Ulaşım', 'gider'],
  ['2026-04-09', 5400, 'Giyim alışverişi', 'Zara', 'Alışveriş', 'gider'],
  ['2026-04-11', 890, 'Sinema ve atıştırmalık', 'Paribu Cineverse', 'Eğlence', 'gider'],
  ['2026-04-15', 15000, 'Eğitim geliri', 'Workshop', 'Maaş', 'gelir'],
  ['2026-04-18', 2380, 'Büyük market alışverişi', 'Migros', 'Market', 'gider'],
  ['2026-04-22', 670, 'Yemek siparişi', 'Yemeksepeti', 'Yemek Siparişi', 'gider'],
  ['2026-03-01', 70000, 'Maaş ödemesi - Mart', 'İşveren', 'Maaş', 'gelir'],
  ['2026-03-02', 2780, 'Market alışverişi', 'BİM', 'Market', 'gider'],
  ['2026-03-04', 1670, 'Su ve elektrik faturaları', 'İSKİ / BEDAŞ', 'Fatura', 'gider'],
  ['2026-03-05', 349, 'Netflix aboneliği', 'Netflix', 'Abonelik', 'gider'],
  ['2026-03-06', 229, 'Spotify aboneliği', 'Spotify', 'Abonelik', 'gider'],
  ['2026-03-08', 1890, 'Akşam yemeği', 'Nusr-Et Burger', 'Restoran', 'gider'],
  ['2026-03-12', 7600, 'Kulaklık satın alma', 'Amazon', 'Alışveriş', 'gider'],
  ['2026-03-18', 1260, 'Ulaşım ve otopark', 'İSPARK', 'Ulaşım', 'gider'],
  ['2026-03-21', 520, 'Kişisel bakım', 'Watsons', 'Sağlık', 'gider'],
  ['2026-03-26', 940, 'Kitap ve dergi', 'D&R', 'Eğlence', 'gider'],
].map(([tarih, tutar, aciklama, magaza, kategori, tur]) => ({
  tarih,
  tutar,
  aciklama,
  magaza,
  kategori,
  tur,
}));
