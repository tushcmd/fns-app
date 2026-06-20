import { View, Text } from "react-native";
import { ImpactBadge } from "../../components/ui/ImpactBadge";
import { NewsEvent } from "../../lib/api";

function fmtTime(iso: string) {
    return new Date(iso).toUTCString().slice(17, 22) + " UTC";
}
function fmtWindow(start: string, end: string) {
    return `${new Date(start).toUTCString().slice(17, 22)} → ${new Date(end).toUTCString().slice(17, 22)}`;
}

export function EventCard({ event }: { event: NewsEvent }) {
    return (
        <View className="bg-surface border border-border rounded-sm mb-2 overflow-hidden">
            <View
                className={`absolute left-0 top-0 bottom-0 w-0.5 ${event.impact === "High" ? "bg-urgent" : "bg-dim"
                    }`}
            />
            <View className="px-4 py-4 pl-5">
                <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-text font-mono-bold text-sm tracking-wide flex-1 mr-2">
                        {event.title}
                    </Text>
                    <ImpactBadge impact={event.impact} />
                </View>

                <View className="flex-row items-center gap-3 mb-2">
                    <View className="bg-surface2 border border-border rounded px-2 py-0.5">
                        <Text className="text-dim font-mono-bold text-xs tracking-widest">
                            {event.currency}
                        </Text>
                    </View>
                    <Text className="text-dim font-mono text-xs">{fmtTime(event.event_time)}</Text>
                </View>

                <Text className="text-faint font-mono text-xs tracking-wide">
                    WINDOW: {fmtWindow(event.window_start, event.window_end)}
                </Text>

                {(event.forecast || event.previous || event.actual) && (
                    <View className="flex-row gap-4 mt-2">
                        {event.actual && <Text className="text-safe font-mono text-xs">ACT: {event.actual}</Text>}
                        {event.forecast && <Text className="text-dim font-mono text-xs">FCT: {event.forecast}</Text>}
                        {event.previous && <Text className="text-faint font-mono text-xs">PRV: {event.previous}</Text>}
                    </View>
                )}
            </View>
        </View>
    );
}