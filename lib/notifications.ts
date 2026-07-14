import * as Notifications from 'expo-notifications';
import { BlackoutZone, NewsEvent } from '../lib/api';
import {
  isZoneNotified,
  markZoneNotified,
  getSettings,
  getISOWeekKey,
  getLastSeenWeek,
  setLastSeenWeek,
} from '../lib/storage';

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

/**
 * Determines which ISO week a set of ForexFactory events belongs to by taking
 * the most common week key across all events. This is robust against ordering
 * and the occasional stray event that spills past the week boundary.
 */
function weekKeyForEvents(events: NewsEvent[]): string | null {
  const counts = new Map<string, number>();
  for (const e of events) {
    const t = new Date(e.event_time).getTime();
    if (Number.isNaN(t)) continue;
    const key = getISOWeekKey(new Date(t));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let best: string | null = null;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Detects when ForexFactory has published a new week's calendar and fires a
 * one-time notification. Works by comparing the ISO week the upcoming events
 * fall in against the last week we saw. When the API starts serving next week's
 * data (over the weekend), the week key advances and we notify the user.
 *
 * The first time this runs (no stored week) it silently records the current
 * week without notifying, so a fresh install / first launch doesn't nag.
 */
export async function processNewWeekNotification(events: NewsEvent[]): Promise<void> {
  const currentWeek = weekKeyForEvents(events);
  if (!currentWeek) return;

  const settings = await getSettings();
  const lastSeen = await getLastSeenWeek();

  // Nothing changed — nothing to do.
  if (currentWeek === lastSeen) return;

  // Advance the stored baseline whenever the week changes, regardless of whether
  // the user has the alert enabled. This keeps re-enabling from firing a stale
  // notification for a week that already rolled over.
  await setLastSeenWeek(currentWeek);

  // Don't notify on the very first run (fresh install), on a backward/rollback
  // change, or when the user has opted out.
  const isNewerWeek = lastSeen !== null && currentWeek > lastSeen;
  if (!isNewerWeek || !settings.notifyNewWeek) return;

  await fireNow(
    '📅 New week calendar is live',
    "This week's ForexFactory events are out — check your blackout windows."
  );
}

const WEEKLY_REMINDER_ID = 'fns-weekly-calendar-reminder';

/**
 * Schedules a repeating weekly local notification that nudges the user to open
 * FNS and load the new week's calendar. Unlike the data-driven check, this is
 * OS-scheduled, so it fires even when the app has been fully closed all weekend
 * — the pragmatic, no-backend guarantee of delivery.
 *
 * Fires every Sunday at 12:00 (device local time), around when ForexFactory
 * typically publishes the upcoming week. Idempotent: it always cancels the
 * previous instance first, so calling it repeatedly (on launch, on foreground,
 * on toggle) never stacks duplicates. Respects the `notifyNewWeek` setting.
 */
export async function syncWeeklyCalendarReminder(): Promise<void> {
  // Clear any previously-scheduled instance so we never stack duplicates.
  try {
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_REMINDER_ID);
  } catch {
    // No existing reminder — nothing to cancel.
  }

  const settings = await getSettings();
  if (!settings.notifyNewWeek) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_REMINDER_ID,
      content: {
        title: '📅 New trading week',
        body: "A new ForexFactory week should be live — open FNS to load this week's calendar.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // 1 = Sunday
        hour: 12,
        minute: 0,
      },
    });
  } catch (err) {
    console.error('[FNS Notifications] weekly reminder schedule failed:', err);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing, ios } = await Notifications.getPermissionsAsync();
  const iosGranted = ios?.allowsAlert && ios?.allowsSound && ios?.allowsBadge;
  if (existing === 'granted' && iosGranted) return true;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: true },
  });
  return status === 'granted';
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
