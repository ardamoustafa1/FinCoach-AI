import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { fetchTransactions, fetchGoals, fetchBudgetLimits } from '../utils/supabaseStorage';
import useStore from '../store/useStore';

/**
 * Buluttaki veriyi çeker; oturum yoksa ya da bulut boş dönerse
 * yerel mağazaya (Zustand) düşer.
 *
 * Bu yedek olmadan demo modu ve çevrimdışı kullanımda bu hook'u kullanan
 * sayfalar boş görünüyordu — uygulamanın geri kalanı zaten mağazayı okuyor.
 */
export function useSupabaseData() {
  const [loading, setLoading] = useState(true);
  const [remote, setRemote] = useState(null); // null → bulut verisi yok
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  // Yerel kaynak (demo, çevrimdışı ve bulut senkronu sonrası tek gerçek kaynak)
  const localTransactions = useStore((s) => s.transactions);
  const localGoals = useStore((s) => s.goals);
  const localLimits = useStore((s) => s.budgetLimits);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await supabase.auth.getUser();
      const user = response?.data?.user;
      if (!user) {
        // Oturum yok → yerel mağaza kullanılacak
        if (isMountedRef.current) { setRemote(null); setLoading(false); }
        return;
      }

      const [tData, gData, lData] = await Promise.all([
        fetchTransactions(),
        fetchGoals(),
        fetchBudgetLimits(),
      ]);

      if (isMountedRef.current) {
        setRemote({
          transactions: Array.isArray(tData) ? tData : [],
          goals: Array.isArray(gData) ? gData : [],
          limits: lData && typeof lData === 'object' ? lData : {},
        });
      }
    } catch (err) {
      console.error('[useSupabaseData] Yükleme hatası:', err);
      if (isMountedRef.current) { setError(err); setRemote(null); }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { refreshData(); }, 0);
    return () => clearTimeout(id);
  }, [refreshData]);

  // Bulut boşsa yerele düş — böylece hiçbir sayfa boş kalmaz.
  const transactions = remote?.transactions?.length ? remote.transactions : (localTransactions || []);
  const goals = remote?.goals?.length ? remote.goals : (localGoals || []);
  const limits = remote?.limits && Object.keys(remote.limits).length ? remote.limits : (localLimits || {});

  return { transactions, goals, limits, loading, error, refreshData };
}
