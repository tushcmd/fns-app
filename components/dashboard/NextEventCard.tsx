import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getUpcomingEvents, NewsEvent } from '@/lib/api';
import { useSettings } from '@/hooks/useSettings';
import { colors, fonts, alpha } from '@/constants/theme';

function fmtTime(iso: string) {
  return new Date(iso).toUTCString().slice(17, 22) + ' UTC';
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return `${days[d.getUTCDay()]} ${d.getUTCDate()}`;
}

function getCountdown(targetIso: string): { text: string; urgent: boolean } {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return { text: 'NOW', urgent: true };
  const totalMins = Math.floor(diff / 60000);
  if (totalMins < 60) return { text: `${totalMins}m`, urgent: totalMins <= 15 };
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const text = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  return { text, urgent: hrs < 1 };
}

function getNextEvent(events: NewsEvent[]): NewsEvent | null {
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.event_time).getTime() > now)
    .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime());
  return upcoming[0] ?? null;
}

function getNextBlockedEvent(events: NewsEvent[]): NewsEvent | null {
  const now = Date.now();
  const blocked = events
    .filter((e) => {
      const start = new Date(e.window_start).getTime();
      const end = new Date(e.window_end).getTime();
      return end > now && start <= now;
    })
    .sort((a, b) => new Date(a.window_end).getTime() - new Date(b.window_end).getTime());
  return blocked[0] ?? null;
}

export function NextEventCard() {
  const { settings } = useSettings();
  const [, setTick] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-dashboard', settings?.includeMedium],
    queryFn: () => getUpcomingEvents(undefined, settings?.includeMedium ?? false),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!settings,
  });

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const nextEvent = data?.events ? getNextEvent(data.events) : null;
  const activeBlocked = data?.events ? getNextBlockedEvent(data.events) : null;
  const countdown = nextEvent ? getCountdown(nextEvent.event_time) : null;

  if (isLoading) {
    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 2,
          padding: 16,
          marginBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ActivityIndicator size="small" color={colors.dim} />
        <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
          Loading schedule…
        </Text>
      </View>
    );
  }

  if (!data || data.events.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: activeBlocked ? alpha(colors.blocked, 0.3) : colors.border,
        borderRadius: 2,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {activeBlocked && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: colors.blocked,
          }}
        />
      )}

      <View style={{ padding: 16, paddingLeft: activeBlocked ? 20 : 16 }}>
        {activeBlocked ? (
          <>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: colors.blocked, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2 }}>
                ACTIVE BLACKOUT
              </Text>
              <View
                style={{
                  backgroundColor: alpha(colors.blocked, 0.1),
                  borderWidth: 1,
                  borderColor: alpha(colors.blocked, 0.3),
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: colors.blocked, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1 }}>
                  BLOCKED
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.5, marginBottom: 4 }}>
              {activeBlocked.title}
            </Text>
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  backgroundColor: colors.surface2,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: colors.dim, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2 }}>
                  {activeBlocked.currency}
                </Text>
              </View>
              <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 11 }}>
                clears at {fmtTime(activeBlocked.window_end)}
              </Text>
            </View>
          </>
        ) : nextEvent ? (
          <>
            <View className="flex-row items-center justify-between mb-2">
              <Text style={{ color: colors.faint, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2 }}>
                NEXT EVENT
              </Text>
              {countdown && (
                <View
                  style={{
                    backgroundColor: countdown.urgent ? alpha(colors.urgent, 0.1) : alpha(colors.accent, 0.1),
                    borderWidth: 1,
                    borderColor: countdown.urgent ? alpha(colors.urgent, 0.3) : alpha(colors.accent, 0.3),
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.bold,
                      fontSize: 12,
                      letterSpacing: 1,
                      color: countdown.urgent ? colors.urgent : colors.accent,
                    }}
                  >
                    {countdown.text}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 14, letterSpacing: 0.5, marginBottom: 4 }}>
              {nextEvent.title}
            </Text>
            <View className="flex-row items-center gap-3">
              <View
                style={{
                  backgroundColor: colors.surface2,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: colors.dim, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2 }}>
                  {nextEvent.currency}
                </Text>
              </View>
              <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 11 }}>
                {fmtDay(nextEvent.event_time)} · {fmtTime(nextEvent.event_time)}
              </Text>
            </View>
            {(nextEvent.forecast || nextEvent.previous) && (
              <View className="flex-row gap-4 mt-2">
                {nextEvent.forecast && (
                  <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11 }}>
                    FCT: {nextEvent.forecast}
                  </Text>
                )}
                {nextEvent.previous && (
                  <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11 }}>
                    PRV: {nextEvent.previous}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
              No upcoming events this week
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
