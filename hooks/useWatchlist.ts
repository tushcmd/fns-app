import { useState, useEffect, useCallback } from 'react';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setWatchlist,
  getActiveWatchlistName,
  setActiveWatchlist,
  getNamedWatchlists,
  setNamedWatchlists,
  createWatchlist as createWatchlistStorage,
  deleteWatchlist as deleteWatchlistStorage,
  renameWatchlist as renameWatchlistStorage,
  updateWatchlistPairs,
  NamedWatchlist,
} from '../lib/storage';

async function syncNamedPairChanges(pairs: string[]) {
  const activeName = await getActiveWatchlistName();
  const lists = await getNamedWatchlists();
  const updated = lists.map((l) => (l.name === activeName ? { ...l, pairs } : l));
  await setNamedWatchlists(updated);
}

async function loadAll(): Promise<{
  pairs: string[];
  lists: NamedWatchlist[];
  activeName: string;
}> {
  const [pairs, lists, activeName] = await Promise.all([
    getWatchlist(),
    getNamedWatchlists(),
    getActiveWatchlistName(),
  ]);
  return { pairs, lists, activeName };
}

export function useWatchlist() {
  const [pairs, setPairs] = useState<string[]>([]);
  const [lists, setLists] = useState<NamedWatchlist[]>([]);
  const [activeName, setActiveName] = useState('Default');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await loadAll();
    setPairs(data.pairs);
    setLists(data.lists);
    setActiveName(data.activeName);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadAll();
      if (!cancelled) {
        setPairs(data.pairs);
        setLists(data.lists);
        setActiveName(data.activeName);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const add = useCallback(async (pair: string) => {
    const updated = await addToWatchlist(pair);
    setPairs(updated);
    await syncNamedPairChanges(updated);
    const lists = await getNamedWatchlists();
    setLists(lists);
  }, []);

  const remove = useCallback(async (pair: string) => {
    const updated = await removeFromWatchlist(pair);
    setPairs(updated);
    await syncNamedPairChanges(updated);
    const lists = await getNamedWatchlists();
    setLists(lists);
  }, []);

  const reorder = useCallback(async (newOrder: string[]) => {
    await setWatchlist(newOrder);
    setPairs(newOrder);
    await syncNamedPairChanges(newOrder);
    const lists = await getNamedWatchlists();
    setLists(lists);
  }, []);

  const switchTo = useCallback(async (name: string) => {
    await setActiveWatchlist(name);
    setActiveName(name);
    const allLists = await getNamedWatchlists();
    setLists(allLists);
    const target = allLists.find((l) => l.name === name);
    if (target) {
      await setWatchlist(target.pairs);
      setPairs(target.pairs);
    }
  }, []);

  const create = useCallback(async (name: string, pairs: string[] = []) => {
    const updated = await createWatchlistStorage(name, pairs);
    setLists(updated);
    return updated;
  }, []);

  const deleteList = useCallback(async (name: string) => {
    const updated = await deleteWatchlistStorage(name);
    setLists(updated);
    const active = await getActiveWatchlistName();
    setActiveName(active);
    const target = updated.find((l) => l.name === active);
    if (target) {
      await setWatchlist(target.pairs);
      setPairs(target.pairs);
    }
    return updated;
  }, []);

  const rename = useCallback(async (oldName: string, newName: string) => {
    const updated = await renameWatchlistStorage(oldName, newName);
    setLists(updated);
    const active = await getActiveWatchlistName();
    setActiveName(active);
    return updated;
  }, []);

  const updatePairs = useCallback(async (name: string, newPairs: string[]) => {
    const updated = await updateWatchlistPairs(name, newPairs);
    setLists(updated);
    const active = await getActiveWatchlistName();
    if (active === name) {
      await setWatchlist(newPairs);
      setPairs(newPairs);
    }
    return updated;
  }, []);

  const activeList = lists.find((l) => l.name === activeName) ?? null;

  return {
    pairs,
    lists,
    activeName,
    activeList,
    loading,
    add,
    remove,
    reorder,
    switchTo,
    create,
    deleteList,
    rename,
    updatePairs,
    refresh,
  };
}
