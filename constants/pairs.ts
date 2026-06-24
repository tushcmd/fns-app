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
export const DEFAULT_API_KEY = 'f1e922df0a7d52af4ff2bfc3c4eb1da01e5f8ea4779e28acb3200ced29aaf5a5';
