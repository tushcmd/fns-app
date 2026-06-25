import { View, Text, ScrollView } from 'react-native';
import { fonts, alpha } from '@/constants/theme';
import { useColors } from '@/providers/ThemeProvider';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

interface Zone {
  start: string;
  end: string;
  currency: string;
  event: string;
  event_time: string;
}

interface Props {
  zones: Zone[];
  watchedPairs: string[];
}

function getWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getCurrenciesFromPairs(pairs: string[]): string[] {
  const set = new Set<string>();
  for (const pair of pairs) {
    if (pair.length >= 6) {
      set.add(pair.slice(0, 3));
      set.add(pair.slice(3, 6));
    }
  }
  return [...set].sort();
}

interface CellData {
  minutes: number;
  events: string[];
  count: number;
}

function buildGrid(zones: Zone[], currencies: string[]): Map<string, CellData> {
  const grid = new Map<string, CellData>();
  for (const cur of currencies) {
    for (let d = 0; d < 5; d++) {
      grid.set(`${cur}-${d}`, { minutes: 0, events: [], count: 0 });
    }
  }

  const weekDates = getWeekDates();

  for (const zone of zones) {
    const zoneDate = new Date(zone.event_time);
    const dayIdx = weekDates.findIndex((wd) =>
      wd.getUTCFullYear() === zoneDate.getUTCFullYear() &&
      wd.getUTCMonth() === zoneDate.getUTCMonth() &&
      wd.getUTCDate() === zoneDate.getUTCDate()
    );
    if (dayIdx < 0) continue;

    const cur = zone.currency.toUpperCase();
    const key = `${cur}-${dayIdx}`;
    const cell = grid.get(key);
    if (!cell) continue;

    const startMs = new Date(zone.start).getTime();
    const endMs = new Date(zone.end).getTime();
    const mins = Math.max(0, Math.round((endMs - startMs) / 60000));
    cell.minutes += mins;
    cell.count += 1;
    if (!cell.events.includes(zone.event)) {
      cell.events.push(zone.event);
    }
  }

  return grid;
}

export function HeatmapGrid({ zones, watchedPairs }: Props) {
  const colors = useColors();
  const currencies = getCurrenciesFromPairs(watchedPairs);

  function cellColor(minutes: number): string {
    if (minutes === 0) return colors.surface;
    if (minutes <= 15) return alpha('#f59e0b', 0.15);
    if (minutes <= 30) return alpha('#f59e0b', 0.3);
    if (minutes <= 60) return alpha('#f59e0b', 0.5);
    return alpha('#ef4444', 0.5);
  }

  function cellBorder(minutes: number): string {
    if (minutes === 0) return colors.border;
    if (minutes <= 15) return alpha('#f59e0b', 0.2);
    if (minutes <= 30) return alpha('#f59e0b', 0.35);
    if (minutes <= 60) return alpha('#f59e0b', 0.5);
    return alpha('#ef4444', 0.5);
  }
  const grid = buildGrid(zones, currencies);

  if (currencies.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, textAlign: 'center' }}>
          Add pairs to your watchlist to see the heatmap.
        </Text>
      </View>
    );
  }

  const cellWidth = 56;
  const labelWidth = 52;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', paddingLeft: labelWidth }}>
          {DAYS.map((day, i) => (
            <View key={day} style={{ width: cellWidth, alignItems: 'center', marginBottom: 8 }}>
              <Text
                style={{
                  color: colors.dim,
                  fontFamily: fonts.bold,
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {currencies.map((cur) => (
          <View key={cur} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: labelWidth, paddingRight: 8 }}>
              <Text
                style={{
                  color: colors.dim,
                  fontFamily: fonts.bold,
                  fontSize: 10,
                  letterSpacing: 1,
                  textAlign: 'right',
                }}
              >
                {cur}
              </Text>
            </View>
            {Array.from({ length: 5 }, (_, dayIdx) => {
              const cell = grid.get(`${cur}-${dayIdx}`);
              const mins = cell?.minutes ?? 0;
              return (
                <View
                  key={dayIdx}
                  style={{
                    width: cellWidth,
                    height: 36,
                    backgroundColor: cellColor(mins),
                    borderWidth: 1,
                    borderColor: cellBorder(mins),
                    borderRadius: 2,
                    margin: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mins > 0 ? (
                    <Text
                      style={{
                        color: mins >= 60 ? colors.urgent : colors.blocked,
                        fontFamily: fonts.bold,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      }}
                    >
                      {mins}m
                    </Text>
                  ) : (
                    <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 9 }}>—</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ flexDirection: 'row', paddingLeft: labelWidth, marginTop: 12, gap: 12 }}>
          {[
            { label: 'Clear', color: colors.surface, border: colors.border },
            { label: '≤15m', color: alpha('#f59e0b', 0.15), border: alpha('#f59e0b', 0.2) },
            { label: '≤30m', color: alpha('#f59e0b', 0.3), border: alpha('#f59e0b', 0.35) },
            { label: '≤60m', color: alpha('#f59e0b', 0.5), border: alpha('#f59e0b', 0.5) },
            { label: '60m+', color: alpha('#ef4444', 0.5), border: alpha('#ef4444', 0.5) },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderWidth: 1,
                  borderColor: item.border,
                  borderRadius: 2,
                }}
              />
              <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 9 }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
