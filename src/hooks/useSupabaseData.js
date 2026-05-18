import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { fetchTransactions, fetchGoals, fetchBudgetLimits } from '../utils/supabaseStorage';

export function useSupabaseData() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [limits, setLimits] = useState({});
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

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
        if (isMountedRef.current) setLoading(false);
        return;
      }

      const [tData, gData, lData] = await Promise.all([
        fetchTransactions(),
        fetchGoals(),
        fetchBudgetLimits()
      ]);

      if (isMountedRef.current) {
        setTransactions(tData);
        setGoals(gData);
        setLimits(lData);
      }
    } catch (err) {
      console.error('[useSupabaseData] Yükleme hatası:', err);
      if (isMountedRef.current) setError(err);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      refreshData();
    }, 0);
    return () => clearTimeout(id);
  }, [refreshData]);

  return { transactions, goals, limits, loading, error, refreshData };
}
