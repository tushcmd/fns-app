import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUpcomingEvents, NewsEvent, CachedResponse, UpcomingResponse } from '../../lib/api';
import { EventCard } from '../../components/calendar/EventCard';
import { DaySelector } from '../../components/calendar/DaySelector';
import { useSettings } from '../../hooks/useSettings';
import { fonts } from '../../constants/theme';
import { useColors } from '../../providers/ThemeProvider';
import { StaleDataBanner } from '../../components/ui/StaleDataBanner';

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

function todayIndex(): number {
  const day = new Date().getDay();
  return Math.min(Math.max(day - 1, 0), 4);
}

export default function Calendar() {
  const colors = useColors();
  const { settings } = useSettings();
  const [selectedDay, setDay] = useState(todayIndex);
  const weekDates = getWeekDates();

  const { data: cachedData, isLoading, isError } = useQuery<CachedResponse<UpcomingResponse>>({
    queryKey: ['upcoming', settings?.includeMedium],
    queryFn: () => getUpcomingEvents(undefined, settings?.includeMedium ?? false),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    enabled: !!settings,
  });

  const data = cachedData?.data;

  function eventsForDay(i: number): NewsEvent[] {
    const target = weekDates[i];
    if (!target || !data) return [];
    return data.events.filter((e) => {
      const d = new Date(e.event_time);
      return (
        d.getUTCFullYear() === target.getUTCFullYear() &&
        d.getUTCMonth() === target.getUTCMonth() &&
        d.getUTCDate() === target.getUTCDate()
      );
    });
  }

  const eventCounts = weekDates.map((_, i) => eventsForDay(i).length);
  const dayEvents = eventsForDay(selectedDay);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        className="px-5 py-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 16, letterSpacing: 2 }}>
          CALENDAR
        </Text>
        <Text
          style={{
            color: colors.dim,
            fontFamily: fonts.regular,
            fontSize: 12,
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          HIGH-IMPACT EVENTS · THIS WEEK · UTC
        </Text>
      </View>

      <StaleDataBanner stale={cachedData?.stale ?? false} cachedAt={cachedData?.cachedAt} />

      <DaySelector
        selected={selectedDay}
        onSelect={setDay}
        eventCounts={eventCounts}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
          <Text
            style={{
              color: colors.dim,
              fontFamily: fonts.regular,
              fontSize: 12,
              letterSpacing: 2,
              marginTop: 12,
            }}
          >
            LOADING CALENDAR…
          </Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{
              color: colors.urgent,
              fontFamily: fonts.regular,
              fontSize: 12,
              textAlign: 'center',
              letterSpacing: 0.5,
            }}
          >
            Could not load calendar.{'\n'}Check your API connection in Settings.
          </Text>
        </View>
      ) : dayEvents.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{
              color: colors.dim,
              fontFamily: fonts.regular,
              fontSize: 12,
              textAlign: 'center',
              letterSpacing: 0.5,
              lineHeight: 20,
            }}
          >
            No high-impact events{'\n'}scheduled for this day.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dayEvents}
          keyExtractor={(item) => `${item.currency}-${item.title}-${item.event_time}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <EventCard event={item} />}
          ListHeaderComponent={
            <Text
              style={{
                color: colors.faint,
                fontFamily: fonts.regular,
                fontSize: 12,
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              {dayEvents.length} EVENT{dayEvents.length > 1 ? 'S' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
