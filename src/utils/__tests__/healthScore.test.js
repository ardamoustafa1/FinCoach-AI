import { describe, it, expect, vi } from 'vitest';
import { aySkoru } from '../healthScore';

// Mock Zustand store to avoid import issues
vi.mock('../../store/useStore', () => ({
  default: {
    getState: () => ({
      behavioralProfile: { goal: 'takip', income: 20000 }
    })
  }
}));

describe('healthScore', () => {
  it('should calculate a correct health score for empty transactions', () => {
    const islemler = [];
    const gelirler = [];
    const limitler = { Market: 5000 };
    
    const result = aySkoru(islemler, gelirler, 2026, 6, limitler);
    
    // With 0 spending, budget adherence is perfect.
    // Saving rate is 100% (perfect).
    // Regularity is perfect.
    // Trend is 0 (since previous month was also 0).
    expect(result.toplam).toBeGreaterThan(0);
    expect(result.metrikler.butceUyumu.puan).toBe(35); // Max for 'takip'
  });

  it('should reduce score when over budget', () => {
    const islemler = [
      { tutar: 6000, kategori: 'Market', tarih: '2026-06-01' }
    ];
    const gelirler = [];
    const limitler = { Market: 5000 };
    
    const result = aySkoru(islemler, gelirler, 2026, 6, limitler);
    
    // Since market spending (6000) > limit (5000), budget score should be 0 (for 1 category).
    expect(result.metrikler.butceUyumu.puan).toBe(0);
  });
});
