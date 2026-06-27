import { requestWidgetUpdate, type WidgetInfo } from 'react-native-android-widget';
import { getWatchlist, getSettings } from '../lib/storage';
import { checkSafeToTrade, getUpcomingEvents } from '../lib/api';
import { FNSStatusWidget } from '../widgets/FNSStatusWidget';

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

function getNextEvent(events: { event_time: string; title: string; currency: string }[]) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.event_time).getTime() > now)
    .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime());
  return upcoming[0] ?? null;
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export async function updateFNSWidget() {
  try {
    const pairs = await getWatchlist();
    const settings = await getSettings();
    const pair = pairs[0];

    if (!pair) {
      await requestWidgetUpdate({
        widgetName: 'FNSStatus',
        renderWidget: (widgetInfo: WidgetInfo) => (
          <FNSStatusWidget
            pair="—"
            safeToTrade={true}
            statusText="NO PAIRS"
            detailText="Add a pair in the app"
            updatedAt={fmtTime(new Date().toISOString())}
            isDark={settings.themeMode !== 'light'}
          />
        ),
      });
      return;
    }

    const [checkResult, upcomingResult] = await Promise.all([
      checkSafeToTrade(pair, settings.includeMedium, settings.windowMinutesOverride ?? undefined),
      getUpcomingEvents(undefined, settings.includeMedium).catch(() => null),
    ]);

    const check = checkResult.data;
    const upcoming = upcomingResult?.data;
    const nextEvent = upcoming ? getNextEvent(upcoming.events) : null;

    let detailText = 'No active blackout windows';
    if (!check.safe_to_trade && check.blocking_events.length > 0) {
      const evt = check.blocking_events[0];
      detailText = `${evt.title} · clears in ${timeUntil(evt.window_end)}`;
    } else if (nextEvent) {
      detailText = `Next: ${nextEvent.title} (${nextEvent.currency}) in ${timeUntil(nextEvent.event_time)}`;
    }

    const isDark = settings.themeMode !== 'light';

    await requestWidgetUpdate({
      widgetName: 'FNSStatus',
      renderWidget: (widgetInfo: WidgetInfo) => (
        <FNSStatusWidget
          pair={pair}
          safeToTrade={check.safe_to_trade}
          statusText={check.safe_to_trade ? 'CLEAR' : 'BLOCKED'}
          detailText={detailText}
          updatedAt={fmtTime(check.checked_at)}
          isDark={isDark}
        />
      ),
    });
  } catch {
    // Widget update failed silently — not critical
  }
}
