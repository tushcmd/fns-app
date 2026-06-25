import { useState, useEffect, useCallback } from 'react';
import { getActivityLog, addActivityLogEntry, clearActivityLog, ActivityLogEntry } from '../lib/storage';

export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const log = await getActivityLog();
      if (!cancelled) {
        setEntries(log);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logChange = useCallback(
    async (pair: string, fromSafe: boolean, toSafe: boolean, blockingEvent?: string) => {
      const updated = await addActivityLogEntry({ pair, fromSafe, toSafe, blockingEvent });
      setEntries(updated);
    },
    []
  );

  const clear = useCallback(async () => {
    await clearActivityLog();
    setEntries([]);
  }, []);

  const refresh = useCallback(async () => {
    const log = await getActivityLog();
    setEntries(log);
  }, []);

  return { entries, loading, logChange, clear, refresh };
}
