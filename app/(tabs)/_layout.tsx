import { Tabs, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useColors } from "../../providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { getHasOnboarded } from "../../lib/storage";

export default function TabsLayout() {
    const colors = useColors();
    const [onboarded, setOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        getHasOnboarded().then(setOnboarded);
    }, []);

    // Still resolving onboarding state — render nothing to avoid a flash.
    if (onboarded === null) return null;
    // The `/` route lands here (tabs group owns `/`); send first-run users out.
    if (!onboarded) return <Redirect href="/onboarding" />;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.dim,
                tabBarLabelStyle: {
                    fontFamily: "JetBrainsMono_700Bold",
                    fontSize: 9,
                    letterSpacing: 1,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "DASHBOARD",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="radio-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "CALENDAR",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="heatmap"
                options={{
                    title: "HEATMAP",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "SETTINGS",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}