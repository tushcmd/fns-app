import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getBlackoutZones } from '../lib/api';
import { processZonesForNotifications } from '../lib/notifications';
import { getWatchlist, getSettings } from '../lib/storage';

async function refreshNotifications(): Promise<void> {
  try {
    const watchlist = await getWatchlist();
    if (watchlist.length === 0) return;
    const settings = await getSettings();
    const result = await getBlackoutZones(
      undefined,
      settings.includeMedium,
      settings.windowMinutesOverride ?? undefined
    );
    await processZonesForNotifications(result.zones, watchlist);
  } catch (err) {
    console.error('[FNS Notifications] refresh failed:', err);
  }
}

export function useNotifications() {
  const lastRefresh = useRef(0);

  useEffect(() => {
    refreshNotifications();
    lastRefresh.current = Date.now();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state !== 'active') return;
      const elapsed = Date.now() - lastRefresh.current;
      if (elapsed > 60_000) {
        refreshNotifications();
        lastRefresh.current = Date.now();
      }
    });

    return () => sub.remove();
  }, []);
}
