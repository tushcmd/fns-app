import "../lib/background";

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
    useFonts,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    JetBrainsMono_800ExtraBold,
} from "@expo-google-fonts/jetbrains-mono";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getHasOnboarded } from "../lib/storage";
import { registerBackgroundFetch } from "../lib/background";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 2, staleTime: 60 * 1000 },
    },
});

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const [onboarded, setOnboarded] = useState<boolean>(false);
    const [checked, setChecked] = useState(false);

    const [fontsLoaded] = useFonts({
        JetBrainsMono_400Regular,
        JetBrainsMono_500Medium,
        JetBrainsMono_700Bold,
        JetBrainsMono_800ExtraBold,
    });

    useEffect(() => {
        if (!fontsLoaded) return;
        async function prepare() {
            const hasOnboarded = await getHasOnboarded();
            setOnboarded(hasOnboarded);
            setChecked(true);
            await registerBackgroundFetch();
            setReady(true);
            await SplashScreen.hideAsync();
        }
        prepare();
    }, [fontsLoaded]);

    if (!ready || !checked) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <StatusBar style="light" />
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