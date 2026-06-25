import { getApiKey, getSettings } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BlockingEvent {
  title: string;
  currency: string;
  impact: string;
  event_time: string;
  window_start: string;
  window_end: string;
  minutes_to_event: number | null;
}

export interface CheckResponse {
  safe_to_trade: boolean;
  symbol: string;
  currencies_checked: string[];
  checked_at: string;
  blocking_events: BlockingEvent[];
}

export interface NewsEvent {
  title: string;
  currency: string;
  impact: string;
  event_time: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  window_start: string;
  window_end: string;
  window_minutes: number;
}

export interface UpcomingResponse {
  fetched_at: string;
  event_count: number;
  events: NewsEvent[];
}

export interface BlackoutZone {
  start: string;
  end: string;
  event: string;
  currency: string;
  impact: string;
  event_time: string;
}

export interface BlackoutZonesResponse {
  fetched_at: string;
  zone_count: number;
  zones: BlackoutZone[];
}

export interface HealthResponse {
  status: string;
  cache_age_seconds: number | null;
  cache_populated: boolean;
}

export interface CachedResponse<T> {
  data: T;
  cachedAt: number;
  stale: boolean;
}

const CACHE_PREFIX = 'fns:apiCache:';

function cacheKey(path: string, params: Record<string, string>): string {
  const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b));
  return `${CACHE_PREFIX}${path}?${sorted.map(([k, v]) => `${k}=${v}`).join('&')}`;
}

async function getCached<T>(key: string): Promise<CachedResponse<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedResponse<T>;
    return parsed;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CachedResponse<T> = { data, cachedAt: Date.now(), stale: false };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ignore cache write failures
  }
}

export async function getCacheAge(key: string): Promise<number | null> {
  const cached = await getCached(key);
  if (!cached) return null;
  return Date.now() - cached.cachedAt;
}

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<CachedResponse<T>> {
  const settings = await getSettings();
  const apiKey = await getApiKey();
  const url = new URL(`${settings.apiUrl}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const key = cacheKey(path, params);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'X-API-Key': apiKey },
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as T;
    await setCache(key, data);
    return { data, cachedAt: Date.now(), stale: false };
  } catch (err) {
    const cached = await getCached<T>(key);
    if (cached) {
      return { data: cached.data, cachedAt: cached.cachedAt, stale: true };
    }
    throw err;
  }
}

export async function checkSafeToTrade(
  symbol: string,
  includeMedium = false,
  windowMinutes?: number
): Promise<CachedResponse<CheckResponse>> {
  const params: Record<string, string> = { symbol };
  if (includeMedium) params.include_medium = 'true';
  if (windowMinutes) params.window_minutes = String(windowMinutes);
  return apiFetch<CheckResponse>('/v1/news/check', params);
}

export async function getUpcomingEvents(
  currency?: string,
  includeMedium = false,
  windowMinutes?: number
): Promise<CachedResponse<UpcomingResponse>> {
  const params: Record<string, string> = {};
  if (currency) params.currency = currency;
  if (includeMedium) params.include_medium = 'true';
  if (windowMinutes) params.window_minutes = String(windowMinutes);
  return apiFetch<UpcomingResponse>('/v1/news/upcoming', params);
}

export async function getBlackoutZones(
  currency?: string,
  includeMedium = false,
  windowMinutes?: number
): Promise<CachedResponse<BlackoutZonesResponse>> {
  const params: Record<string, string> = {};
  if (currency) params.currency = currency;
  if (includeMedium) params.include_medium = 'true';
  if (windowMinutes) params.window_minutes = String(windowMinutes);
  return apiFetch<BlackoutZonesResponse>('/v1/news/blackout-zones', params);
}

export async function getHealth(): Promise<HealthResponse> {
  const settings = await getSettings();
  const res = await fetch(`${settings.apiUrl}/health`);
  return res.json() as Promise<HealthResponse>;
}
