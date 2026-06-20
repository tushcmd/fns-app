import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { requestNotificationPermissions } from "../../lib/notifications";
import { setHasOnboarded } from "../../lib/storage";

async function finish() {
    await setHasOnboarded();
    router.replace("/(tabs)");
}

export default function OnboardingNotifications() {
    return (
        <SafeAreaView className="flex-1 bg-bg">
            <View className="flex-1 px-6 pt-12 pb-10 justify-between">

                <View>
                    <Text className="text-faint font-mono text-xs tracking-widest mb-8">
                        STEP 3 OF 3
                    </Text>
                    <Text className="text-text font-mono-extrabold text-xl tracking-wider mb-2">
                        STAY AHEAD OF{"\n"}
                        <Text className="text-blocked">THE BLACKOUT</Text>
                    </Text>
                    <Text className="text-dim font-mono text-sm leading-relaxed mb-10">
                        FNS can notify you before a blackout window opens — so you&apos;re
                        never caught in a trade when NFP drops.
                    </Text>

                    {[
                        ["🔔", "Alert X minutes before a window opens"],
                        ["🚫", "Immediate alert when a window is currently active"],
                        ["✅", "All times based on your watched pairs only"],
                    ].map(([icon, text]) => (
                        <View key={text} className="flex-row items-start mb-5">
                            <Text className="text-accent font-mono text-base mr-3">{icon}</Text>
                            <Text className="text-dim font-mono text-sm leading-relaxed flex-1">
                                {text}
                            </Text>
                        </View>
                    ))}

                    <View className="border border-border rounded px-4 py-3 mt-4">
                        <Text className="text-faint font-mono text-xs leading-relaxed">
                            All notifications are scheduled locally on your device. No data
                            is sent to any server.
                        </Text>
                    </View>
                </View>

                <View>
                    <TouchableOpacity
                        className="bg-accent/10 border border-accent/30 rounded py-4 items-center mb-3"
                        onPress={async () => {
                            await requestNotificationPermissions();
                            await finish();
                        }}
                        activeOpacity={0.7}
                    >
                        <Text className="text-accent font-mono-bold text-xs tracking-widest">
                            ENABLE NOTIFICATIONS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={finish} activeOpacity={0.7}>
                        <Text className="text-faint font-mono text-xs tracking-widest text-center">
                            SKIP — ENABLE LATER IN SETTINGS
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
    );
}