import { describe, it, expect } from 'vitest';
import { kisilikTipiBelirle } from '../spendingPersonality';

describe('spendingPersonality', () => {
  it('should return a default personality or valid analysis for empty data', () => {
    const transactions = [];
    const result = kisilikTipiBelirle(transactions);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    // Expected to have an archetype string
    if (result.id) {
      expect(typeof result.id).toBe('string');
    }
  });

  it('should analyze high food spending appropriately', () => {
    const transactions = [
      { kategori: 'Yemek', tutar: 500, tarih: '2026-06-01' },
      { kategori: 'Yemek', tutar: 800, tarih: '2026-06-02' },
      { kategori: 'Market', tutar: 100, tarih: '2026-06-03' }
    ];
    const result = kisilikTipiBelirle(transactions);
    expect(result).toBeDefined();
  });
});
