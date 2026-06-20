import * as Notifications from 'expo-notifications';
import { BlackoutZone } from '../lib/api';
import { isZoneNotified, markZoneNotified, getSettings } from '../lib/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function zoneKey(zone: BlackoutZone): string {
  return `${zone.currency}__${zone.event}__${zone.start}`;
}

async function scheduleNotification(title: string, body: string, trigger: Date): Promise<void> {
  if (trigger.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

async function fireNow(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

export async function processZonesForNotifications(
  zones: BlackoutZone[],
  pairs: string[]
): Promise<void> {
  const settings = await getSettings();
  const notifyMs = settings.notifyMinutesBefore * 60 * 1000;
  const now = Date.now();

  for (const zone of zones) {
    const relevant = pairs.some(
      (pair) =>
        pair.toUpperCase().includes(zone.currency.toUpperCase()) ||
        zone.currency.toUpperCase().includes(pair.slice(0, 3).toUpperCase()) ||
        zone.currency.toUpperCase().includes(pair.slice(3, 6).toUpperCase())
    );
    if (!relevant) continue;

    const windowStart = new Date(zone.start).getTime();
    const windowEnd = new Date(zone.end).getTime();

    // Case 1: currently inside window
    const activeKey = `active__${zoneKey(zone)}`;
    if (now >= windowStart && now <= windowEnd) {
      if (!(await isZoneNotified(activeKey))) {
        const minsLeft = Math.round((windowEnd - now) / 60000);
        await fireNow(
          `🚫 ${zone.currency} BLOCKED`,
          `${zone.event} · Window clears in ~${minsLeft}m`
        );
        await markZoneNotified(activeKey);
      }
      continue;
    }

    // Case 2: window upcoming — schedule advance warning
    const advanceKey = `advance__${zoneKey(zone)}`;
    if (windowStart > now && !(await isZoneNotified(advanceKey))) {
      const notifyAt = new Date(windowStart - notifyMs);
      if (notifyAt.getTime() > now) {
        await scheduleNotification(
          `⚠️ ${zone.currency} — ${zone.event}`,
          `Blackout opens in ${settings.notifyMinutesBefore}m · Avoid new entries`,
          notifyAt
        );
        await markZoneNotified(advanceKey);
      }
    }
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
