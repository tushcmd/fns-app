import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getBlackoutZones, getUpcomingEvents } from '../lib/api';
import {
  processZonesForNotifications,
  processNewWeekNotification,
  syncWeeklyCalendarReminder,
} from '../lib/notifications';
import { getWatchlist, getSettings } from '../lib/storage';

async function refreshNotifications(): Promise<void> {
  // Keep the weekly "new week" reminder scheduled. This is independent of the
  // watchlist — it fires even when the app is fully closed, so it must run
  // regardless of whether there are pairs to check below.
  await syncWeeklyCalendarReminder();

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

    // Detect a freshly-published week calendar and notify once.
    try {
      const upcoming = await getUpcomingEvents(undefined, settings.includeMedium);
      await processNewWeekNotification(upcoming.data.events);
    } catch (err) {
      console.error('[FNS Notifications] new-week check failed:', err);
    }
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
