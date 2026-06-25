import { useState, useEffect, useCallback } from 'react';
import {
  getNamedWatchlists,
  getActiveWatchlistName,
  setActiveWatchlist,
  createWatchlist,
  deleteWatchlist,
  renameWatchlist,
  updateWatchlistPairs,
  setWatchlist,
  NamedWatchlist,
} from '../lib/storage';

export function useWatchlists() {
  const [lists, setLists] = useState<NamedWatchlist[]>([]);
  const [activeName, setActiveName] = useState('Default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [allLists, active] = await Promise.all([getNamedWatchlists(), getActiveWatchlistName()]);
      if (!cancelled) {
        setLists(allLists);
        setActiveName(active);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const switchTo = useCallback(async (name: string) => {
    await setActiveWatchlist(name);
    setActiveName(name);
    const allLists = await getNamedWatchlists();
    const target = allLists.find((l) => l.name === name);
    if (target) await setWatchlist(target.pairs);
  }, []);

  const create = useCallback(async (name: string, pairs: string[] = []) => {
    const updated = await createWatchlist(name, pairs);
    setLists(updated);
    return updated;
  }, []);

  const remove = useCallback(async (name: string) => {
    const updated = await deleteWatchlist(name);
    setLists(updated);
    const active = await getActiveWatchlistName();
    setActiveName(active);
    const target = updated.find((l) => l.name === active);
    if (target) await setWatchlist(target.pairs);
    return updated;
  }, []);

  const rename = useCallback(async (oldName: string, newName: string) => {
    const updated = await renameWatchlist(oldName, newName);
    setLists(updated);
    const active = await getActiveWatchlistName();
    setActiveName(active);
    return updated;
  }, []);

  const updatePairs = useCallback(async (name: string, pairs: string[]) => {
    const updated = await updateWatchlistPairs(name, pairs);
    setLists(updated);
    const active = await getActiveWatchlistName();
    if (active === name) await setWatchlist(pairs);
    return updated;
  }, []);

  const refresh = useCallback(async () => {
    const [allLists, active] = await Promise.all([getNamedWatchlists(), getActiveWatchlistName()]);
    setLists(allLists);
    setActiveName(active);
  }, []);

  const activeList = lists.find((l) => l.name === activeName) ?? null;

  return {
    lists,
    activeName,
    activeList,
    loading,
    switchTo,
    create,
    remove,
    rename,
    updatePairs,
    refresh,
  };
}
