import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getBlackoutZones } from '../lib/api';
import { getWatchlist, getSettings } from '../lib/storage';
import { processZonesForNotifications } from '../lib/notifications';

export const BACKGROUND_TASK_NAME = 'fns-background-fetch';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
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
