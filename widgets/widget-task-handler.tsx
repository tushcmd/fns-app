import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FNSStatusWidget } from './FNSStatusWidget';
import { getWatchlist, getSettings } from '../lib/storage';
import { checkSafeToTrade, getUpcomingEvents } from '../lib/api';

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

function getNextEvent(events: { event_time: string; title: string; currency: string }[]) {
  const now = Date.now();
  return events
    .filter((e) => new Date(e.event_time).getTime() > now)
    .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())[0] ?? null;
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

function renderFallback(isDark: boolean) {
  return (
    <FNSStatusWidget
      pair="—"
      safeToTrade={true}
      statusText="LOADING"
      detailText="Open FNS to load data"
      updatedAt={fmtTime(new Date().toISOString())}
      isDark={isDark}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      try {
        const [pairs, settings] = await Promise.all([
          getWatchlist(),
          getSettings(),
        ]);
        const pair = pairs[0];
        const isDark = settings.themeMode !== 'light';

        if (!pair) {
          props.renderWidget(renderFallback(isDark));
          break;
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

        props.renderWidget(
          <FNSStatusWidget
            pair={pair}
            safeToTrade={check.safe_to_trade}
            statusText={check.safe_to_trade ? 'CLEAR' : 'BLOCKED'}
            detailText={detailText}
            updatedAt={fmtTime(check.checked_at)}
            isDark={isDark}
          />
        );
      } catch {
        props.renderWidget(renderFallback(true));
      }
      break;
    }
    case 'WIDGET_CLICK':
      break;
    default:
      break;
  }
}
