/**
 * emotionCoach.js
 * Finansal Duygu Koçu — hesaplama motoru.
 * Russell Circumplex Model (valence + arousal) temelli.
 */

// ─── Sabitler ────────────────────────────────────────────────────────────────
const RISK_AROUSAL_THRESHOLD = 7;
const DOPAMINE_RATIO_THRESHOLD = 0.70;
const PEARSON_STRONG = 0.6;

/**
 * Pearson korelasyon katsayısı (r) hesaplar.
 * x: sayısal dizi, y: sayısal dizi
 */
export function pearsonR(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i] - mx, yi = y[i] - my;
    num += xi * yi;
    dx += xi * xi;
    dy += yi * yi;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : +(num / denom).toFixed(3);
}

/**
 * Valence string'ini sayıya çevirir (Pearson için).
 * pozitif=1, sakin=0.5, negatif=-0.5, stresli=-1
 */
export function valenceToScore(valence) {
  const map = { pozitif: 1, sakin: 0.5, negatif: -0.5, stresli: -1 };
  return map[valence] ?? 0;
}

/**
 * Bir log kaydının risk seviyesini döndürür.
 * 'high' | 'medium' | 'low'
 */
export function getRiskLevel(arousal, valence) {
  const isNeg = valence === 'stresli' || valence === 'negatif';
  if (arousal >= RISK_AROUSAL_THRESHOLD && isNeg) return 'high';
  if (isNeg) return 'medium';
  return 'low';
}

/**
 * Son 30 günlük emotion loglarından metrikler çıkarır.
 * logs: [{date, hour, valence, arousal, amount, category}]
 */
export function computeEmotionMetrics(logs) {
  if (!logs || logs.length === 0) {
    return { pearsonR: 0, riskiestHour: null, dopamineCategory: null, dopaminePct: 0, stressMultiplier: 1 };
  }

  // Pearson r: arousal vs amount
  const arousalArr = logs.map(l => l.arousal);
  const amountArr  = logs.map(l => l.amount);
  const r = pearsonR(arousalArr, amountArr);

  // En riskli saat dilimi (negatif/stresli anlar)
  const negLogs = logs.filter(l => l.valence === 'stresli' || l.valence === 'negatif');
  const hourCounts = {};
  negLogs.forEach(l => { hourCounts[l.hour] = (hourCounts[l.hour] || 0) + 1; });
  const riskiestHour = Object.keys(hourCounts).sort((a, b) => hourCounts[b] - hourCounts[a])[0] ?? null;

  // Dopamine kategorisi
  const catStats = {};
  logs.forEach(l => {
    if (!catStats[l.category]) catStats[l.category] = { total: 0, neg: 0 };
    catStats[l.category].total++;
    if (l.valence === 'stresli' || l.valence === 'negatif') catStats[l.category].neg++;
  });
  let topDopCat = null, topDopPct = 0;
  Object.entries(catStats).forEach(([cat, s]) => {
    const pct = s.neg / s.total;
    if (pct > topDopPct && pct >= DOPAMINE_RATIO_THRESHOLD) { topDopCat = cat; topDopPct = pct; }
  });

  // Stres çarpanı: negatif anlarda harcama / pozitif anlarda harcama
  const negAvg = negLogs.length ? negLogs.reduce((a, b) => a + b.amount, 0) / negLogs.length : 0;
  const posLogs = logs.filter(l => l.valence === 'pozitif' || l.valence === 'sakin');
  const posAvg = posLogs.length ? posLogs.reduce((a, b) => a + b.amount, 0) / posLogs.length : 1;
  const stressMultiplier = posAvg > 0 ? +(negAvg / posAvg).toFixed(2) : 1;

  return {
    pearsonR: r,
    riskiestHour: riskiestHour ? Number(riskiestHour) : null,
    dopamineCategory: topDopCat,
    dopaminePct: Math.round(topDopPct * 100),
    stressMultiplier,
    pearsonStrong: Math.abs(r) >= PEARSON_STRONG,
  };
}

/**
 * Anlık check-in için sistem promptu oluşturur.
 * Senaryo A/B/C otomatik seçilir.
 */
export function buildCheckinPrompt(log, metrics, recentLogs) {
  const { valence, arousal, amount, category, hour, dayOfWeek } = log;
  const risk = getRiskLevel(arousal, valence);

  // Geçmişteki benzer an (aynı kategori, negatif)
  const similarPast = recentLogs
    .filter(l => l.category === category && (l.valence === 'stresli' || l.valence === 'negatif') && l.id !== log.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  // İptal oranı (24s sonra iptal edilen similar category logs)
  const cancelRate = recentLogs.filter(l => l.category === category && l.cancelled).length;
  const cancelRatio = recentLogs.filter(l => l.category === category).length > 0
    ? Math.round((cancelRate / recentLogs.filter(l => l.category === category).length) * 100)
    : 0;

  // Pişmanlık geçmişi
  const regretLogs = recentLogs.filter(l => l.regretScore && l.regretScore >= 6);
  const avgRegretDays = regretLogs.length
    ? Math.round(regretLogs.reduce((a, b) => a + (b.regretDays ?? 3), 0) / regretLogs.length)
    : 3;
  const avgRegretScore = regretLogs.length
    ? +(regretLogs.reduce((a, b) => a + b.regretScore, 0) / regretLogs.length).toFixed(1)
    : 7;

  let scenarioInstruction;
  if (risk === 'high') {
    scenarioInstruction = `SENARYO A (Yüksek Risk): Kullanıcıyı nazikçe uyar. Harcamayı ertelemesini ima et, ama suçlama.`;
  } else if (risk === 'medium') {
    scenarioInstruction = `SENARYO B (Orta Risk): Gözlemini paylaş. Merak uyandır. Karar ver deme.`;
  } else {
    scenarioInstruction = `SENARYO C (Düşük Risk): Kısaca onayla. Varsa küçük bir kalıp gözlemini ekle.`;
  }

  const similarStr = similarPast
    ? `Geçmişteki benzer an: ${similarPast.date} ${similarPast.hour}:00 — ${similarPast.amount}₺ ${similarPast.category} (o an not: "${similarPast.regretNote ?? 'kayıt yok'}")`
    : 'Benzer geçmiş kayıt yok.';

  return `Sen FinCoach AI'ın Finansal Duygu Koçusun — yargılamayan, meraklı, empatik bir koç.
Türkçe yaz. "sen" kullan. Maksimum 2 cümle. Emoji veya madde işareti kullanma. Robotik ifade kullanma.

${scenarioInstruction}

Kullanıcı verisi:
- Duygu: ${valence} (arousal: ${arousal}/10)
- Tutar: ${amount}₺ | Kategori: ${category} | Saat: ${hour}:00 | Gün: ${dayOfWeek}

Geçmiş bağlam:
- ${similarStr}
- Bu kategoride 24s sonra iptal oranı: %${cancelRatio}
- Pişmanlık genellikle ${avgRegretDays} gün sonra (skor: ${avgRegretScore}/10)
- Haftalık Pearson r (duygu-harcama): ${metrics.pearsonR}
- Dopamin kategorisi: ${metrics.dopamineCategory ?? 'tespit edilmedi'} (%${metrics.dopaminePct})
- Stres çarpanı: ${metrics.stressMultiplier}x`;
}

/**
 * Haftalık rapor için sistem promptu oluşturur.
 */
export function buildWeeklyReportPrompt(logs, metrics) {
  const entries = logs.slice(-7).map(l =>
    `- ${l.date} ${l.hour}:00 | Duygu: ${l.valence} (arousal: ${l.arousal}) | ${l.amount}₺ | ${l.category}`
  ).join('\n');

  const healthiest = logs
    .filter(l => l.valence === 'pozitif' || l.valence === 'sakin')
    .sort((a, b) => a.arousal - b.arousal)[0];

  const healthiestStr = healthiest
    ? `${healthiest.dayOfWeek} ${healthiest.hour}:00 — ${healthiest.amount}₺ ${healthiest.category} (${healthiest.valence})`
    : 'Net bir sağlıklı an tespit edilemedi';

  return `Sen FinCoach AI'ın Finansal Duygu Koçusun.
Türkçe yaz. "sen" kullan. Toplam 150 kelimeyi geçme. Emoji veya madde işareti kullanma.

Kullanıcının son 7 günlük harcama-duygu günlüğü:
${entries}

Hesaplanmış metrikler:
- Haftalık Pearson r: ${metrics.pearsonR}
- En riskli saat: ${metrics.riskiestHour !== null ? `${metrics.riskiestHour}:00` : 'tespit edilemedi'}
- Dopamin kategorisi: ${metrics.dopamineCategory ?? 'yok'} (%${metrics.dopaminePct} negatif anda)
- Stres çarpanı: ${metrics.stressMultiplier}x
- En sağlıklı karar anı: ${healthiestStr}

3 bölümlü haftalık rapor yaz:

BÖLÜM 1 — "Bu Hafta Seni En Çok Etkileyen Şey" (2–3 cümle)
En güçlü örüntüyü seç. Somut bir anekdotla anlat — soyut istatistik değil, "Salı gecesi saat 22'de..." gibi.

BÖLÜM 2 — "Güçlü Yanın" (1–2 cümle)
Haftada mutlaka bir gerçek pozitif gözlem bul. Uydurma.

BÖLÜM 3 — "Bu Hafta Deneyebileceğin Bir Şey" (1 cümle, somut 1 eylem)
Analizi bırak. Tek ve çok basit bir deney öner.

Her bölüm arasında boş satır bırak.`;
}
