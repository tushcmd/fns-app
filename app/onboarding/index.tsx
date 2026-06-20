import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingIndex() {
    return (
        <SafeAreaView className="flex-1 bg-bg">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 px-6 pt-16 pb-10 justify-between min-h-full">

                    <View>
                        <View className="mb-12">
                            <Text className="text-accent font-mono-extrabold text-3xl tracking-widest">
                                ◎ FNS
                            </Text>
                            <Text className="text-dim font-mono text-xs tracking-widest mt-1">
                                FUNDAMENTAL NEWS STEER
                            </Text>
                        </View>

                        <Text className="text-text font-mono-extrabold text-2xl tracking-wider leading-tight mb-4">
                            KNOW WHEN{"\n"}
                            <Text className="text-safe">TO TRADE</Text>{"\n"}
                            KNOW WHEN{"\n"}
                            <Text className="text-blocked">NOT TO</Text>
                        </Text>

                        <Text className="text-dim font-mono text-sm leading-relaxed mb-6">
                            High-impact news events like NFP, CPI, and FOMC create violent
                            price spikes that can stop out technically perfect setups in
                            seconds.
                        </Text>

                        <Text className="text-dim font-mono text-sm leading-relaxed mb-8">
                            FNS tells you when a blackout window is active — so you stop
                            paddling out into hurricanes.
                        </Text>

                        {[
                            ["◈", "Live CLEAR/BLOCKED status for your pairs"],
                            ["🔔", "Notifications before blackout windows open"],
                            ["📅", "Full week event calendar at a glance"],
                        ].map(([icon, text]) => (
                            <View key={text} className="flex-row items-start mb-4">
                                <Text className="text-accent font-mono text-base mr-3 mt-0.5">
                                    {icon}
                                </Text>
                                <Text className="text-dim font-mono text-sm leading-relaxed flex-1">
                                    {text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <View>
                        <View className="border border-border rounded px-4 py-3 mb-6">
                            <Text className="text-faint font-mono text-xs leading-relaxed tracking-wide">
                                ⚠ NOT FINANCIAL ADVICE — A timing tool, not a strategy.
                                Always apply your own analysis.
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="bg-accent/10 border border-accent/30 rounded py-4 items-center"
                            onPress={() => router.push("/onboarding/watchlist")}
                            activeOpacity={0.7}
                        >
                            <Text className="text-accent font-mono-bold text-xs tracking-widest">
                                GET STARTED →
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}