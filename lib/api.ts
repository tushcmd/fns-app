import { getApiKey, getSettings } from '../lib/storage';

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

async function apiFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const settings = await getSettings();
  const apiKey = await getApiKey();
  const url = new URL(`${settings.apiUrl}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function checkSafeToTrade(
  symbol: string,
  includeMedium = false,
  windowMinutes?: number
): Promise<CheckResponse> {
  const params: Record<string, string> = { symbol };
  if (includeMedium) params.include_medium = 'true';
  if (windowMinutes) params.window_minutes = String(windowMinutes);
  return apiFetch<CheckResponse>('/v1/news/check', params);
}

export async function getUpcomingEvents(
  currency?: string,
  includeMedium = false,
  windowMinutes?: number
): Promise<UpcomingResponse> {
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
): Promise<BlackoutZonesResponse> {
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
