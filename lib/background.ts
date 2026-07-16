import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getBlackoutZones, getUpcomingEvents } from '../lib/api';
import { getWatchlist, getSettings } from '../lib/storage';
import {
  processZonesForNotifications,
  processNewWeekNotification,
  ensureAndroidChannel,
} from '../lib/notifications';
import { updateFNSWidget } from '../lib/widget';

export const BACKGROUND_TASK_NAME = 'fns-background-fetch';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    // The channel may not exist yet if the task runs after a reboot before the
    // app has been opened. Creating it is idempotent and UI-free.
    await ensureAndroidChannel();

    const watchlist = await getWatchlist();
    if (watchlist.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const settings = await getSettings();
    const result = await getBlackoutZones(
      undefined,
      settings.includeMedium,
      settings.windowMinutesOverride ?? undefined
    );
    await processZonesForNotifications(result.zones, watchlist);

    // Detect when ForexFactory publishes a new week's calendar and notify.
    try {
      const upcoming = await getUpcomingEvents(undefined, settings.includeMedium);
      await processNewWeekNotification(upcoming.data.events);
    } catch (err) {
      console.error('[FNS Background] new-week check failed:', err);
    }

    await updateFNSWidget();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[FNS Background]', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (error) {
    console.error('[FNS Background] Registration failed:', error);
  }
}

export async function unregisterBackgroundFetch(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    }
  } catch (error) {
    console.error('[FNS Background] Unregistration failed:', error);
  }
}
