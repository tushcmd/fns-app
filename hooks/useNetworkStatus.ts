import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
      setHasChecked(true);
    });

    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected !== false && state.isInternetReachable !== false);
      setHasChecked(true);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, hasChecked };
}
