import {
    View,
    Text,
    Switch,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useWatchlist } from "../../../hooks/useWatchlist";
import { useSettings } from "../../../hooks/useSettings";
import { getApiKey, setApiKey } from "../../../lib/storage";
import { DEFAULT_PAIRS } from "../../../constants/pairs";
import { colors } from "../../../constants/theme";

const NOTIFY_OPTIONS: Array<5 | 10 | 15 | 30> = [5, 10, 15, 30];

function SectionLabel({ children }: { children: string }) {
    return (
        <Text className="text-faint font-mono text-xs tracking-widest mb-3 mt-6">
            {children}
        </Text>
    );
}

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <View className="flex-row items-center justify-between py-3 border-b border-border">
            <Text className="text-dim font-mono text-xs tracking-wide">{label}</Text>
            {children}
        </View>
    );
}

function LinkRow({ label, url }: { label: string; url: string }) {
    return (
        <TouchableOpacity
            className="flex-row items-center justify-between py-3 border-b border-border"
            onPress={() => Linking.openURL(url)}
            activeOpacity={0.7}
        >
            <Text className="text-dim font-mono text-xs tracking-wide">{label}</Text>
            <Text className="text-faint font-mono text-xs">↗</Text>
        </TouchableOpacity>
    );
}

export default function Settings() {
    const { pairs, add, remove } = useWatchlist();
    const { settings, update } = useSettings();
    const [apiKey, setApiKeyState] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [customPair, setCustomPair] = useState("");

    useEffect(() => {
        getApiKey().then(setApiKeyState);
    }, []);

    async function saveApiKey(key: string) {
        setApiKeyState(key);
        await setApiKey(key);
    }

    async function sendTestNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "✅ FNS — Test Notification",
                body: "Notifications are working correctly.",
            },
            trigger: null,
        });
    }

    async function addCustomPair() {
        const upper = customPair.toUpperCase().trim();
        if (upper.length >= 3) {
            await add(upper);
            setCustomPair("");
            setShowPicker(false);
        }
    }

    if (!settings) return null;

    return (
        <SafeAreaView className="flex-1 bg-bg">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="px-5 py-4 border-b border-border">
                    <Text className="text-text font-mono-extrabold text-base tracking-widest">
                        SETTINGS
                    </Text>
                </View>

                <View className="px-5">

                    {/* ── Watchlist ── */}
                    <SectionLabel>WATCHLIST</SectionLabel>

                    {pairs.map((pair) => (
                        <View
                            key={pair}
                            className="flex-row items-center justify-between py-3 border-b border-border"
                        >
                            <Text className="text-text font-mono-bold text-xs tracking-wider">
                                {pair}
                            </Text>
                            <TouchableOpacity onPress={() => remove(pair)} activeOpacity={0.7}>
                                <Text className="text-urgent font-mono text-xs tracking-wider">
                                    REMOVE
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity
                        className="py-3 border-b border-border"
                        onPress={() => setShowPicker(!showPicker)}
                        activeOpacity={0.7}
                    >
                        <Text className="text-accent font-mono-bold text-xs tracking-widest">
                            + ADD PAIR
                        </Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <View className="py-3 border-b border-border">
                            <View className="flex-row flex-wrap gap-2 mb-3">
                                {DEFAULT_PAIRS.filter((p) => !pairs.includes(p)).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        className="bg-surface border border-border rounded px-3 py-1.5"
                                        onPress={() => {
                                            add(p);
                                            setShowPicker(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-dim font-mono-bold text-xs tracking-wider">
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View className="flex-row gap-2">
                                <TextInput
                                    className="flex-1 bg-surface border border-border rounded px-3 py-2 text-text font-mono text-xs"
                                    placeholder="Custom pair (e.g. GBPCAD)"
                                    placeholderTextColor={colors.faint}
                                    value={customPair}
                                    onChangeText={setCustomPair}
                                    autoCapitalize="characters"
                                    onSubmitEditing={addCustomPair}
                                />
                                <TouchableOpacity
                                    className="bg-surface border border-border rounded px-4 items-center justify-center"
                                    onPress={addCustomPair}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-accent font-mono-bold text-sm">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* ── Notifications ── */}
                    <SectionLabel>NOTIFICATIONS</SectionLabel>

                    <Row label="INCLUDE MEDIUM IMPACT">
                        <Switch
                            value={settings.includeMedium}
                            onValueChange={(v) => {
                                void update({ includeMedium: v });
                            }}
                            trackColor={{ false: colors.border, true: colors.accent + "50" }}
                            thumbColor={colors.accent}
                        />
                    </Row>

                    <View className="py-3 border-b border-border">
                        <Text className="text-dim font-mono text-xs tracking-wide mb-3">
                            NOTIFY BEFORE WINDOW (MIN)
                        </Text>
                        <View className="flex-row gap-2">
                            {NOTIFY_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    className={`flex-1 py-2 rounded border items-center ${settings.notifyMinutesBefore === opt
                                        ? "bg-accent/10 border-accent/40"
                                        : "bg-surface border-border"
                                        }`}
                                    onPress={() => update({ notifyMinutesBefore: opt })}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`font-mono-bold text-xs ${settings.notifyMinutesBefore === opt
                                            ? "text-accent"
                                            : "text-dim"
                                            }`}
                                    >
                                        {opt}m
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        className="py-3 border-b border-border"
                        onPress={sendTestNotification}
                        activeOpacity={0.7}
                    >
                        <Text className="text-dim font-mono text-xs tracking-wide">
                            SEND TEST NOTIFICATION
                        </Text>
                    </TouchableOpacity>

                    {/* ── Data / API ── */}
                    <SectionLabel>DATA</SectionLabel>

                    <View className="py-3 border-b border-border">
                        <Text className="text-dim font-mono text-xs tracking-wide mb-2">
                            API KEY
                        </Text>
                        <TextInput
                            className="bg-surface border border-border rounded px-3 py-2 text-dim font-mono text-xs"
                            value={apiKey}
                            onChangeText={saveApiKey}
                            placeholder="Enter API key"
                            placeholderTextColor={colors.faint}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View className="py-3 border-b border-border">
                        <Text className="text-dim font-mono text-xs tracking-wide mb-2">
                            API URL
                        </Text>
                        <TextInput
                            className="bg-surface border border-border rounded px-3 py-2 text-dim font-mono text-xs"
                            value={settings.apiUrl}
                            onChangeText={(v) => update({ apiUrl: v })}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* ── More Tools ── */}
                    <SectionLabel>MORE TOOLS</SectionLabel>
                    <LinkRow
                        label="CHROME EXTENSION"
                        url="https://chromewebstore.google.com/detail/nfdcdhkgoiohipbhoalpnenhincbpnlc"
                    />
                    <LinkRow label="MCP FOR CLAUDE" url="https://tushcmd.github.io/fns-fe/mcp/" />
                    <LinkRow label="API DOCS" url="https://tushcmd.github.io/fns-fe/apiv1/" />
                    <LinkRow label="EVENT TAXONOMY" url="https://tushcmd.github.io/fns-fe/event-taxonomy/" />
                    <LinkRow label="GITHUB" url="https://github.com/tushcmd/fnewsteer" />
                    <LinkRow label="𝕏 @0xtush" url="https://x.com/0xtush" />

                    {/* ── Legal ── */}
                    <SectionLabel>LEGAL</SectionLabel>
                    <LinkRow label="PRIVACY POLICY" url="https://tushcmd.github.io/fns-fe/privacy/" />
                    <LinkRow label="TERMS OF SERVICE" url="https://tushcmd.github.io/fns-fe/terms/" />
                    <LinkRow label="DISCLAIMER" url="https://tushcmd.github.io/fns-fe/disclaimer/" />

                    <View className="py-8 items-center">
                        <Text className="text-faint font-mono text-xs tracking-widest">
                            FNS v1.0.0 · NOT FINANCIAL ADVICE
                        </Text>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}