import { View, Text, TouchableOpacity } from "react-native";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

interface Props {
    selected: number;
    onSelect: (index: number) => void;
    eventCounts: number[];
}

export function DaySelector({ selected, onSelect, eventCounts }: Props) {
    return (
        <View className="flex-row border-b border-border">
            {DAYS.map((day, i) => {
                const isActive = selected === i;
                const count = eventCounts[i] ?? 0;
                return (
                    <TouchableOpacity
                        key={day}
                        className={`flex-1 py-3 items-center ${isActive ? "bg-accent/5 border-b-2 border-accent" : ""
                            }`}
                        onPress={() => onSelect(i)}
                        activeOpacity={0.7}
                    >
                        <Text
                            className={`font-mono-bold text-xs tracking-wider ${isActive ? "text-accent" : "text-dim"
                                }`}
                        >
                            {day}
                        </Text>
                        {count > 0 && (
                            <View
                                className={`mt-1 rounded-full px-1.5 ${isActive ? "bg-accent/20" : "bg-surface2"
                                    }`}
                            >
                                <Text
                                    className={`font-mono-bold text-xs ${isActive ? "text-accent" : "text-faint"
                                        }`}
                                >
                                    {count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}