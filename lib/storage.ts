import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_API_URL } from '../constants/pairs';

const KEYS = {
  watchlist: 'fns:watchlist',
  settings: 'fns:settings',
  hasOnboarded: 'fns:hasOnboarded',
  notifiedZones: 'fns:notifiedZones',
} as const;

const SECURE_KEYS = {
  apiKey: 'fns:apiKey',
} as const;

export interface Settings {
  notifyMinutesBefore: 5 | 10 | 15 | 30;
  includeMedium: boolean;
  windowMinutesOverride: number | null;
  apiUrl: string;
}

export const DEFAULT_SETTINGS: Settings = {
  notifyMinutesBefore: 10,
  includeMedium: false,
  windowMinutesOverride: null,
  apiUrl: DEFAULT_API_URL,
};

// ── Watchlist ─────────────────────────────────────────────────────────────────
export async function getWatchlist(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.watchlist);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setWatchlist(pairs: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.watchlist, JSON.stringify(pairs));
}

export async function addToWatchlist(pair: string): Promise<string[]> {
  const current = await getWatchlist();
  const upper = pair.toUpperCase().trim();
  if (current.includes(upper)) return current;
  const updated = [...current, upper];
  await setWatchlist(updated);
  return updated;
}

export async function removeFromWatchlist(pair: string): Promise<string[]> {
  const current = await getWatchlist();
  const updated = current.filter((p) => p !== pair.toUpperCase());
  await setWatchlist(updated);
  return updated;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...patch };
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(updated));
  return updated;
}

// ── API Key ───────────────────────────────────────────────────────────────────
export async function getApiKey(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(SECURE_KEYS.apiKey)) ?? '';
  } catch {
    return '';
  }
}

export async function setApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.apiKey, key);
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export async function getHasOnboarded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.hasOnboarded);
  return val === 'true';
}

export async function setHasOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.hasOnboarded, 'true');
}

// ── Notification dedup ────────────────────────────────────────────────────────
export async function getNotifiedZones(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.notifiedZones);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function markZoneNotified(key: string): Promise<void> {
  const current = await getNotifiedZones();
  current[key] = Date.now();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  Object.keys(current).forEach((k) => {
    if (current[k] < cutoff) delete current[k];
  });
  await AsyncStorage.setItem(KEYS.notifiedZones, JSON.stringify(current));
}

export async function isZoneNotified(key: string): Promise<boolean> {
  const current = await getNotifiedZones();
  return key in current;
}
