import '../lib/background';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
  JetBrainsMono_800ExtraBold,
} from '@expo-google-fonts/jetbrains-mono';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { registerBackgroundFetch } from '../lib/background';
import { widgetTaskHandler } from '../widgets/widget-task-handler';
import { ThemeProvider, useTheme } from '../providers/ThemeProvider';
import { useNotifications } from '../hooks/useNotifications';
import '../global.css';

registerWidgetTaskHandler(widgetTaskHandler);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 60 * 1000 },
  },
});

function RootLayoutInner() {
  const [ready, setReady] = useState(false);
  const { isDark } = useTheme();
  useNotifications();

  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    JetBrainsMono_800ExtraBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    async function prepare() {
      await registerBackgroundFetch();
      setReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, [fontsLoaded]);

  if (!ready) return null;

  // Onboarding routing is handled by a redirect gate in app/(tabs)/_layout.tsx.
  // Screens are declared normally here — the `/` route resolves to the tabs
  // group, which redirects first-run users to /onboarding.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDark ? '#0a0a0b' : '#f5f5f7' },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
