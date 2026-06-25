import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getBlackoutZones } from '../../lib/api';
import { useSettings } from '../../hooks/useSettings';
import { useWatchlist } from '../../hooks/useWatchlist';
import { HeatmapGrid } from '../../components/heatmap/HeatmapGrid';
import { colors, fonts } from '../../constants/theme';

export default function Heatmap() {
  const { settings } = useSettings();
  const { pairs } = useWatchlist();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blackout-zones', settings?.includeMedium],
    queryFn: () => getBlackoutZones(undefined, settings?.includeMedium ?? false),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    enabled: !!settings,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        className="px-5 py-4 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 16, letterSpacing: 2 }}>
          HEATMAP
        </Text>
        <Text
          style={{
            color: colors.dim,
            fontFamily: fonts.regular,
            fontSize: 12,
            letterSpacing: 0.5,
            marginTop: 2,
          }}
        >
          BLACKOUT MINUTES BY CURRENCY · THIS WEEK · UTC
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
          <Text
            style={{
              color: colors.dim,
              fontFamily: fonts.regular,
              fontSize: 12,
              letterSpacing: 2,
              marginTop: 12,
            }}
          >
            LOADING ZONES…
          </Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{
              color: colors.urgent,
              fontFamily: fonts.regular,
              fontSize: 12,
              textAlign: 'center',
              letterSpacing: 0.5,
            }}
          >
            Could not load blackout zones.{'\n'}Check your API connection in Settings.
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          <HeatmapGrid zones={data?.zones ?? []} watchedPairs={pairs} />

          {data && (
            <View className="mt-4 px-2">
              <Text
                style={{
                  color: colors.faint,
                  fontFamily: fonts.regular,
                  fontSize: 11,
                  letterSpacing: 0.5,
                  lineHeight: 18,
                }}
              >
                {data.zone_count} blackout zone{data.zone_count !== 1 ? 's' : ''} this week.
                {'\n'}Cells show total blackout minutes per currency per day.
                {'\n'}Based on your watchlist&apos;s constituent currencies.
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
