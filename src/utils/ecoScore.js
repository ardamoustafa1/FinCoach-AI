export function calculateEcoScore(transactions) {
  // Sadece bu ayın işlemlerini al
  const now = new Date();
  const currentMonthTx = transactions.filter(t => {
    if (t.type === 'income' || t.tur === 'gelir') return false;
    const d = new Date(t.tarih || t.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Kategori bazlı karbon ağırlıkları (kg CO2 / 100₺ harcama başına farazi değerler)
  const CARBON_WEIGHTS = {
    'Ulaşım': 4.5, // Benzin, uçak vs. yüksek etki
    'Fatura': 2.0, // Elektrik, doğalgaz
    'Alışveriş': 1.8, // Tekstil, elektronik vs.
    'Yemek Siparişi': 1.5, // Kurye, paketleme
    'Restoran': 1.2, // Dışarıda yeme
    'Market': 0.8, // Temel gıda, daha düşük etki
    'Sağlık': 0.5,
    'Eğlence': 0.5,
    'Abonelik': 0.2, // Dijital ürünler en düşük
    'Diğer': 1.0,
  };

  let totalCarbonKg = 0;
  
  currentMonthTx.forEach(tx => {
    const amount = Number(tx.tutar || tx.amount || 0);
    const weight = CARBON_WEIGHTS[tx.kategori] || CARBON_WEIGHTS['Diğer'];
    // Her 100₺ için karbon miktarını hesapla
    totalCarbonKg += (amount / 100) * weight;
  });

  // Toplam karbonu yuvarla
  const footprint = Math.round(totalCarbonKg);

  // Geri bildirim mesajları
  let message = '';
  let status = ''; // 'excellent', 'good', 'warning'
  
  if (footprint < 50) {
    status = 'excellent';
    message = 'Harika! Dünya dostu harcamalar yapıyorsun. Karbon izin çok düşük. 🌍💚';
  } else if (footprint < 150) {
    status = 'good';
    message = 'Fena değil. Ancak ulaşım ve yemek siparişlerini azaltarak doğaya daha çok katkı sağlayabilirsin. 🌱';
  } else {
    status = 'warning';
    message = 'Karbon izin yüksek seviyede. Gelecek nesiller için çevre dostu (toplu taşıma, ev yemeği) seçenekleri değerlendirmelisin. ⚠️';
  }

  return { footprint, status, message };
}
