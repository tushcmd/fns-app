import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { DEFAULT_PAIRS } from "../../constants/pairs";
import { setWatchlist } from "../../lib/storage";
import { colors } from "../../constants/theme";

export default function OnboardingWatchlist() {
    const [selected, setSelected] = useState<string[]>([]);
    const [custom, setCustom] = useState("");

    function toggle(pair: string) {
        setSelected((prev) =>
            prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair],
        );
    }

    function addCustom() {
        const upper = custom.toUpperCase().trim();
        if (upper.length >= 3 && !selected.includes(upper)) {
            setSelected((prev) => [...prev, upper]);
            setCustom("");
        }
    }

    async function proceed() {
        if (selected.length > 0) await setWatchlist(selected);
        router.push("/onboarding/notifications");
    }

    return (
        <SafeAreaView className="flex-1 bg-bg">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-6 pt-12 pb-10 justify-between min-h-full">

                    <View>
                        <Text className="text-faint font-mono text-xs tracking-widest mb-8">
                            STEP 2 OF 3
                        </Text>
                        <Text className="text-text font-mono-extrabold text-xl tracking-wider mb-2">
                            ADD YOUR PAIRS
                        </Text>
                        <Text className="text-dim font-mono text-sm leading-relaxed mb-8">
                            Select the pairs you trade. FNS will monitor their status and
                            notify you before blackout windows open.
                        </Text>

                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {DEFAULT_PAIRS.map((pair) => {
                                const isSelected = selected.includes(pair);
                                return (
                                    <TouchableOpacity
                                        key={pair}
                                        onPress={() => toggle(pair)}
                                        activeOpacity={0.7}
                                        className={`px-4 py-2 rounded border ${isSelected
                                            ? "bg-accent/10 border-accent/40"
                                            : "bg-surface border-border"
                                            }`}
                                    >
                                        <Text
                                            className={`font-mono-bold text-xs tracking-wider ${isSelected ? "text-accent" : "text-dim"
                                                }`}
                                        >
                                            {pair}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View className="flex-row gap-2 mb-2">
                            <TextInput
                                className="flex-1 bg-surface border border-border rounded px-4 py-3 text-text font-mono text-sm"
                                placeholder="Custom pair (e.g. GBPCAD)"
                                placeholderTextColor={colors.faint}
                                value={custom}
                                onChangeText={setCustom}
                                autoCapitalize="characters"
                                onSubmitEditing={addCustom}
                            />
                            <TouchableOpacity
                                className="bg-surface border border-border rounded px-4 items-center justify-center"
                                onPress={addCustom}
                                activeOpacity={0.7}
                            >
                                <Text className="text-accent font-mono-bold text-sm">+</Text>
                            </TouchableOpacity>
                        </View>

                        {selected.length > 0 && (
                            <Text className="text-dim font-mono text-xs tracking-wide mt-2">
                                {selected.length} pair{selected.length > 1 ? "s" : ""} selected
                            </Text>
                        )}
                    </View>

                    <View>
                        <TouchableOpacity
                            className="bg-accent/10 border border-accent/30 rounded py-4 items-center mb-3"
                            onPress={proceed}
                            activeOpacity={0.7}
                        >
                            <Text className="text-accent font-mono-bold text-xs tracking-widest">
                                {selected.length > 0 ? "CONTINUE →" : "SKIP FOR NOW →"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                            <Text className="text-faint font-mono text-xs tracking-widest text-center">
                                ← BACK
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}