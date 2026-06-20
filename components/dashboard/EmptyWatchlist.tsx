import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export function EmptyWatchlist() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-accent font-mono text-3xl mb-6">◎</Text>
      <Text className="text-text font-mono-bold text-sm tracking-widest mb-3 text-center">
        NO PAIRS WATCHED
      </Text>
      <Text className="text-dim font-mono text-xs leading-relaxed text-center mb-8">
        Add currency pairs to your watchlist to see their live CLEAR/BLOCKED
        status here.
      </Text>
      <TouchableOpacity
        className="bg-accent/10 border border-accent/30 rounded px-6 py-3"
        onPress={() => router.push("/(tabs)/settings")}
        activeOpacity={0.7}
      >
        <Text className="text-accent font-mono-bold text-xs tracking-widest">
          ADD PAIRS →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
