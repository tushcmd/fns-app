export const DEFAULT_PAIRS = [
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'GBPJPY',
  'USDCHF',
  'XAUUSD',
  'NZDUSD',
  'EURGBP',
  'EURJPY',
  'AUDJPY',
] as const;

export type Pair = (typeof DEFAULT_PAIRS)[number] | string;

export const DEFAULT_API_URL = 'https://fnewsteer-api.onrender.com';
