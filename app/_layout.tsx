// Background task must be imported at top level before any rendering
import "../lib/background";
import { registerBackgroundFetch } from "../lib/background";

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getHasOnboarded } from "../lib/storage";

import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 2, staleTime: 60 * 1000 },
    },
});

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const [onboarded, setOnboarded] = useState<boolean | null>(null);

    useEffect(() => {
        async function prepare() {
            await Font.loadAsync({
                JetBrainsMono_400Regular: require("@expo-google-fonts/jetbrains-mono/JetBrainsMono_400Regular.ttf"),
                JetBrainsMono_500Medium: require("@expo-google-fonts/jetbrains-mono/JetBrainsMono_500Medium.ttf"),
                JetBrainsMono_700Bold: require("@expo-google-fonts/jetbrains-mono/JetBrainsMono_700Bold.ttf"),
                JetBrainsMono_800ExtraBold: require("@expo-google-fonts/jetbrains-mono/JetBrainsMono_800ExtraBold.ttf"),
            });
            const hasOnboarded = await getHasOnboarded();
            setOnboarded(hasOnboarded);
            await registerBackgroundFetch();
            setReady(true);
            await SplashScreen.hideAsync();
        }
        prepare();
    }, []);

    if (!ready || onboarded === null) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <StatusBar style="light" backgroundColor="#0a0a0b" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: "#0a0a0b" },
                    }}
                >
                    {onboarded ? (
                        <Stack.Screen name="(tabs)" />
                    ) : (
                        <Stack.Screen name="onboarding" />
                    )}
                </Stack>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}