import { useQuery } from '@tanstack/react-query';
import { checkSafeToTrade, CheckResponse, CachedResponse } from '../lib/api';
import { useSettings } from '../hooks/useSettings';

const REFETCH_INTERVAL = 5 * 60 * 1000;

export function usePairCheck(symbol: string) {
  const { settings } = useSettings();

  return useQuery<CachedResponse<CheckResponse>, Error>({
    queryKey: ['check', symbol, settings?.includeMedium, settings?.windowMinutesOverride],
    queryFn: () =>
      checkSafeToTrade(
        symbol,
        settings?.includeMedium ?? false,
        settings?.windowMinutesOverride ?? undefined
      ),
    enabled: !!symbol && !!settings,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
    retry: 2,
  });
}
