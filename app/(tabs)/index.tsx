import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { PairCard } from '@/components/dashboard/PairCard';
import { EmptyWatchlist } from '@/components/dashboard/EmptyWatchlist';
import { colors } from '@/constants/theme';

function UTCClock() {
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000);
    return () => clearInterval(id);
  }, []);
  return <Text className="text-dim font-mono text-xs tracking-widest">{time} UTC</Text>;
}

export default function Dashboard() {
  const { pairs, loading } = useWatchlist();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['check'] });
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="bg-bg flex-1">
      <View className="border-border flex-row items-center justify-between border-b px-5 py-4">
        <Text className="text-text font-mono-extrabold text-base tracking-widest">◎ FNS</Text>
        <UTCClock />
      </View>

      {loading ? null : pairs.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <FlatList
          data={pairs}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <PairCard pair={item} />}
          ListHeaderComponent={
            <Text className="text-faint mb-4 font-mono text-xs tracking-widest">
              WATCHLIST — {pairs.length} PAIR{pairs.length > 1 ? 'S' : ''}
            </Text>
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
