import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafetyBadge } from "@/components/ui/SafetyBadge";
import { usePairCheck } from "@/hooks/usePairCheck";
import { colors } from "@/constants/theme";

interface Props {
  pair:     string;
  onPress?: () => void;
}

function timeUntil(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function PairCard({ pair, onPress }: Props) {
  const { data, isLoading, isError } = usePairCheck(pair);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-surface border rounded-sm mb-2 overflow-hidden ${
        data
          ? data.safe_to_trade
            ? "border-safe/20"
            : "border-blocked/30"
          : "border-border"
      }`}
    >
      <View
        className={`absolute left-0 top-0 bottom-0 w-0.5 ${
          data
            ? data.safe_to_trade ? "bg-safe" : "bg-blocked"
            : "bg-border"
        }`}
      />
      <View className="px-4 py-4 pl-5">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-text font-mono-bold text-base tracking-wider">
            {pair}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={colors.dim} />}
          {isError   && <Text className="text-urgent font-mono text-xs">ERROR</Text>}
          {data      && <SafetyBadge safe={data.safe_to_trade} />}
        </View>

        {data && (
          <Text className="text-dim font-mono text-xs tracking-wide">
            {data.safe_to_trade
              ? "No active blackout windows"
              : data.blocking_events
                  .map((e) => `${e.title} · clears in ${timeUntil(e.window_end)}`)
                  .join("  ·  ")}
          </Text>
        )}
        {isLoading && !data && (
          <Text className="text-faint font-mono text-xs tracking-wide">Checking…</Text>
        )}
        {isError && (
          <Text className="text-faint font-mono text-xs tracking-wide">
            Could not reach API
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
