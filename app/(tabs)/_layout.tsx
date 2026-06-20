import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
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