import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { DEFAULT_API_URL, DEFAULT_API_KEY } from '../constants/pairs';

const KEYS = {
  watchlist: 'fns:watchlist',
  watchlists: 'fns:watchlists',
  activeWatchlist: 'fns:activeWatchlist',
  settings: 'fns:settings',
  hasOnboarded: 'fns:hasOnboarded',
  notifiedZones: 'fns:notifiedZones',
  activityLog: 'fns:activityLog',
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

// ── API Key — bundled by default, no user input needed ────────────────────────
export async function getApiKey(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(SECURE_KEYS.apiKey);
    return stored || DEFAULT_API_KEY;
  } catch {
    return DEFAULT_API_KEY;
  }
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

// ── Named Watchlists ────────────────────────────────────────────────────────
export interface NamedWatchlist {
  name: string;
  pairs: string[];
  createdAt: number;
}

export async function getNamedWatchlists(): Promise<NamedWatchlist[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.watchlists);
    if (raw) return JSON.parse(raw) as NamedWatchlist[];
    const legacy = await getWatchlist();
    if (legacy.length > 0) {
      const defaultList: NamedWatchlist = { name: 'Default', pairs: legacy, createdAt: Date.now() };
      await setNamedWatchlists([defaultList]);
      await setActiveWatchlist('Default');
      return [defaultList];
    }
    return [];
  } catch {
    return [];
  }
}

export async function setNamedWatchlists(lists: NamedWatchlist[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.watchlists, JSON.stringify(lists));
}

export async function getActiveWatchlistName(): Promise<string> {
  try {
    const name = await AsyncStorage.getItem(KEYS.activeWatchlist);
    return name || 'Default';
  } catch {
    return 'Default';
  }
}

export async function setActiveWatchlist(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.activeWatchlist, name);
}

export async function createWatchlist(name: string, pairs: string[] = []): Promise<NamedWatchlist[]> {
  const lists = await getNamedWatchlists();
  if (lists.some((l) => l.name === name)) return lists;
  const newList: NamedWatchlist = { name, pairs, createdAt: Date.now() };
  const updated = [...lists, newList];
  await setNamedWatchlists(updated);
  return updated;
}

export async function deleteWatchlist(name: string): Promise<NamedWatchlist[]> {
  const lists = await getNamedWatchlists();
  const updated = lists.filter((l) => l.name !== name);
  await setNamedWatchlists(updated);
  const active = await getActiveWatchlistName();
  if (active === name && updated.length > 0) {
    await setActiveWatchlist(updated[0].name);
  }
  return updated;
}

export async function renameWatchlist(oldName: string, newName: string): Promise<NamedWatchlist[]> {
  const lists = await getNamedWatchlists();
  const updated = lists.map((l) => (l.name === oldName ? { ...l, name: newName } : l));
  await setNamedWatchlists(updated);
  const active = await getActiveWatchlistName();
  if (active === oldName) await setActiveWatchlist(newName);
  return updated;
}

export async function updateWatchlistPairs(name: string, pairs: string[]): Promise<NamedWatchlist[]> {
  const lists = await getNamedWatchlists();
  const updated = lists.map((l) => (l.name === name ? { ...l, pairs } : l));
  await setNamedWatchlists(updated);
  return updated;
}

// ── Activity Log ────────────────────────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  pair: string;
  fromSafe: boolean;
  toSafe: boolean;
  blockingEvent?: string;
}

const MAX_LOG_ENTRIES = 200;

export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.activityLog);
    return raw ? (JSON.parse(raw) as ActivityLogEntry[]) : [];
  } catch {
    return [];
  }
}

export async function addActivityLogEntry(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>): Promise<ActivityLogEntry[]> {
  const log = await getActivityLog();
  const newEntry: ActivityLogEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...log].slice(0, MAX_LOG_ENTRIES);
  await AsyncStorage.setItem(KEYS.activityLog, JSON.stringify(updated));
  return updated;
}

export async function clearActivityLog(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.activityLog);
}