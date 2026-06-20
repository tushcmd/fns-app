import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getUpcomingEvents, NewsEvent } from "../../lib/api";
import { EventCard } from "../../components/calendar/EventCard";
import { DaySelector } from "../../components/calendar/DaySelector";
import { useSettings } from "../../hooks/useSettings";
import { colors } from "../../constants/theme";

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
    const { settings } = useSettings();
    const [selectedDay, setDay] = useState(todayIndex);
    const weekDates = getWeekDates();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["upcoming", settings?.includeMedium],
        queryFn: () => getUpcomingEvents(undefined, settings?.includeMedium ?? false),
        staleTime: 10 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
        enabled: !!settings,
    });

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
        <SafeAreaView className="flex-1 bg-bg">
            <View className="px-5 py-4 border-b border-border">
                <Text className="text-text font-mono-extrabold text-base tracking-widest">
                    CALENDAR
                </Text>
                <Text className="text-dim font-mono text-xs tracking-wide mt-0.5">
                    HIGH-IMPACT EVENTS · THIS WEEK · UTC
                </Text>
            </View>

            <DaySelector
                selected={selectedDay}
                onSelect={setDay}
                eventCounts={eventCounts}
            />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={colors.accent} />
                    <Text className="text-dim font-mono text-xs mt-3 tracking-widest">
                        LOADING CALENDAR…
                    </Text>
                </View>
            ) : isError ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-urgent font-mono text-xs text-center tracking-wide">
                        Could not load calendar.{"\n"}Check your API connection in Settings.
                    </Text>
                </View>
            ) : dayEvents.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-dim font-mono text-xs text-center tracking-wide leading-relaxed">
                        No high-impact events{"\n"}scheduled for this day.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={dayEvents}
                    keyExtractor={(item) => `${item.currency}-${item.title}-${item.event_time}`}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => <EventCard event={item} />}
                    ListHeaderComponent={
                        <Text className="text-faint font-mono text-xs tracking-widest mb-4">
                            {dayEvents.length} EVENT{dayEvents.length > 1 ? "S" : ""}
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}