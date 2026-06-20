import { useState, useEffect, useCallback } from 'react';
import { getWatchlist, addToWatchlist, removeFromWatchlist, setWatchlist } from '../lib/storage';

export function useWatchlist() {
  const [pairs, setPairs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWatchlist().then((p) => {
      setPairs(p);
      setLoading(false);
    });
  }, []);

  const add = useCallback(async (pair: string) => {
    const updated = await addToWatchlist(pair);
    setPairs(updated);
  }, []);

  const remove = useCallback(async (pair: string) => {
    const updated = await removeFromWatchlist(pair);
    setPairs(updated);
  }, []);

  const reorder = useCallback(async (newOrder: string[]) => {
    await setWatchlist(newOrder);
    setPairs(newOrder);
  }, []);

  return { pairs, loading, add, remove, reorder };
}
