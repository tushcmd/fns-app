import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { updateFNSWidget } from '../../lib/widget';
import { PairCard } from '../../components/dashboard/PairCard';
import { EmptyWatchlist } from '../../components/dashboard/EmptyWatchlist';
import { NextEventCard } from '../../components/dashboard/NextEventCard';
import { WatchlistSwitcher } from '../../components/dashboard/WatchlistSwitcher';
import { StaleDataBanner } from '../../components/ui/StaleDataBanner';
import { fonts } from '../../constants/theme';
import { useColors } from '../../providers/ThemeProvider';

function UTCClock() {
  const colors = useColors();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 2 }}>
      {time} UTC
    </Text>
  );
}

export default function Dashboard() {
  const colors = useColors();
  const { pairs, lists, activeName, switchTo, refresh, loading } = useWatchlist();
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['check'] }),
      queryClient.invalidateQueries({ queryKey: ['upcoming-dashboard'] }),
    ]);
    void updateFNSWidget();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        className="flex-row items-center justify-between border-b px-5 py-4"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 16, letterSpacing: 2 }}>
            ◎ FNS
          </Text>
          {lists.length > 1 && (
            <WatchlistSwitcher lists={lists} activeName={activeName} onSelect={switchTo} />
          )}
        </View>
        <UTCClock />
      </View>

      {!isOnline && (
        <StaleDataBanner stale={true} />
      )}

      {loading ? null : pairs.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <PairCard pair={item} />}
          ListHeaderComponent={
            <>
              <NextEventCard />
              <Text
                style={{
                  color: colors.faint,
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  letterSpacing: 2,
                  marginBottom: 16,
                }}
              >
                WATCHLIST — {pairs.length} PAIR{pairs.length > 1 ? 'S' : ''}
              </Text>
            </>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
