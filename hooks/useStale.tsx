import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface StaleContextValue {
  isStale: boolean;
  staleSince: number | null;
  setStale: (stale: boolean, cachedAt?: number) => void;
}

const StaleContext = createContext<StaleContextValue>({
  isStale: false,
  staleSince: null,
  setStale: () => {},
});

export function StaleProvider({ children }: { children: ReactNode }) {
  const [isStale, setIsStale] = useState(false);
  const [staleSince, setStaleSince] = useState<number | null>(null);

  const setStale = useCallback((stale: boolean, cachedAt?: number) => {
    setIsStale(stale);
    setStaleSince(stale && cachedAt ? cachedAt : null);
  }, []);

  return (
    <StaleContext.Provider value={{ isStale, staleSince, setStale }}>
      {children}
    </StaleContext.Provider>
  );
}

export function useStale() {
  return useContext(StaleContext);
}
