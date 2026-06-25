import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ColorTheme, alpha, fonts } from '../constants/theme';
import { getSettings, updateSettings } from '../lib/storage';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  colors: ColorTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: darkColors,
  mode: 'dark',
  isDark: true,
  setMode: () => {},
});

function resolveColors(mode: ThemeMode, systemScheme: string | null | undefined): ColorTheme {
  if (mode === 'system') {
    return systemScheme === 'light' ? lightColors : darkColors;
  }
  return mode === 'light' ? lightColors : darkColors;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSettings();
      if (!cancelled) {
        setModeState(s.themeMode ?? 'dark');
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const colors = useMemo(() => resolveColors(mode, systemScheme), [mode, systemScheme]);
  const isDark = colors === darkColors;

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await updateSettings({ themeMode: newMode });
  }, []);

  const value = useMemo(() => ({ colors, mode, isDark, setMode }), [colors, mode, isDark, setMode]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColors() {
  return useContext(ThemeContext).colors;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { alpha, fonts };
