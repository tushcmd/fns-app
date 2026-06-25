import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRef, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafetyBadge } from '@/components/ui/SafetyBadge';
import { usePairCheck } from '@/hooks/usePairCheck';
import { addActivityLogEntry } from '@/lib/storage';
import { colors, fonts, alpha } from '@/constants/theme';

interface Props {
  pair: string;
  onPress?: () => void;
}

function timeUntil(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return 'now';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function PairCard({ pair, onPress }: Props) {
  const { data, isLoading, isError } = usePairCheck(pair);
  const prevStatus = useRef<boolean | null>(null);

  const glowOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (data?.safe_to_trade != null && prevStatus.current != null && prevStatus.current !== data.safe_to_trade) {
      glowOpacity.value = withSequence(
        withTiming(0.4, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
      );
      scale.value = withSequence(
        withTiming(1.015, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) })
      );
      const blocking = !data.safe_to_trade && data.blocking_events.length > 0
        ? data.blocking_events[0].title
        : undefined;
      void addActivityLogEntry({
        pair,
        fromSafe: prevStatus.current,
        toSafe: data.safe_to_trade,
        blockingEvent: blocking,
      });
    }
    if (data?.safe_to_trade != null) {
      prevStatus.current = data.safe_to_trade;
    }
  }, [data?.safe_to_trade, glowOpacity, scale, pair, data?.blocking_events]);

  const borderColor = data
    ? data.safe_to_trade
      ? alpha(colors.safe, 0.2)
      : alpha(colors.blocked, 0.3)
    : colors.border;

  const accentBarColor = data
    ? data.safe_to_trade
      ? colors.safe
      : colors.blocked
    : colors.border;

  const glowColor = data?.safe_to_trade === false ? colors.blocked : colors.safe;

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={animatedCardStyle}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor,
          borderRadius: 2,
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              inset: 0,
              backgroundColor: glowColor,
              borderRadius: 2,
            },
            animatedGlowStyle,
          ]}
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: accentBarColor,
          }}
        />

        <View style={{ paddingHorizontal: 16, paddingVertical: 16, paddingLeft: 20 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 15, letterSpacing: 1 }}>
              {pair}
            </Text>
            {isLoading && <ActivityIndicator size="small" color={colors.dim} />}
            {isError && (
              <Text style={{ color: colors.urgent, fontFamily: fonts.regular, fontSize: 11 }}>ERROR</Text>
            )}
            {data && <SafetyBadge safe={data.safe_to_trade} />}
          </View>

          {data && (
            <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
              {data.safe_to_trade
                ? 'No active blackout windows'
                : data.blocking_events
                    .map((e) => `${e.title} · clears in ${timeUntil(e.window_end)}`)
                    .join('  ·  ')}
            </Text>
          )}
          {isLoading && !data && (
            <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
              Checking…
            </Text>
          )}
          {isError && (
            <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
              Could not reach API
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
