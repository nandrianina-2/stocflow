'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
}

export function useFetch<T>(url: string, deps: unknown[] = []) {
  const [state, setState] = useState<UseFetchState<T>>({
    data:    null,
    loading: true,
    error:   null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { ...state, refetch: fetchData };
}