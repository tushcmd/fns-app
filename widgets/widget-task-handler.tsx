'use no memo';

import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FNSStatusWidget } from './FNSStatusWidget';
import { getWatchlist, getSettings } from '../lib/storage';
import { checkSafeToTrade, getUpcomingEvents } from '../lib/api';

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    return `${hh}:${mm} UTC`;
  } catch {
    return '--:-- UTC';
  }
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

function renderFallback(isDark: boolean, message = 'Open FNS to load data') {
  return (
    <FNSStatusWidget
      pair="FNS"
      safeToTrade={true}
      statusText="—"
      detailText={message}
      updatedAt={fmtTime(new Date().toISOString())}
      isDark={isDark}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const action = props.widgetAction;

  // Always render something immediately for WIDGET_ADDED
  // so Android doesn't think the widget failed
  if (action === 'WIDGET_ADDED') {
    props.renderWidget(renderFallback(true, 'Loading…'));
  }

  switch (action) {
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
          props.renderWidget(renderFallback(isDark, 'Add a pair in the FNS app'));
          break;
        }

        const [checkResult, upcomingResult] = await Promise.allSettled([
          checkSafeToTrade(pair, settings.includeMedium, settings.windowMinutesOverride ?? undefined),
          getUpcomingEvents(undefined, settings.includeMedium),
        ]);

        if (checkResult.status === 'rejected') {
          props.renderWidget(renderFallback(isDark, 'Could not reach API'));
          break;
        }

        const check = checkResult.value.data;
        const upcoming = upcomingResult.status === 'fulfilled' ? upcomingResult.value.data : null;
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
        // Last resort fallback — never let the widget crash
        try {
          props.renderWidget(renderFallback(true, 'Tap to open FNS'));
        } catch {
          // nothing we can do
        }
      }
      break;
    }

    case 'WIDGET_CLICK':
      break;

    default:
      break;
  }
}
