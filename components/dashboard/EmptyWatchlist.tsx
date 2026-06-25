import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { fonts, alpha } from '@/constants/theme';
import { useColors } from '@/providers/ThemeProvider';

export function EmptyWatchlist() {
  const colors = useColors();
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text style={{ color: colors.accent, fontFamily: fonts.regular, fontSize: 32, marginBottom: 24 }}>
        ◎
      </Text>
      <Text
        style={{
          color: colors.text,
          fontFamily: fonts.bold,
          fontSize: 13,
          letterSpacing: 2,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        NO PAIRS WATCHED
      </Text>
      <Text
        style={{
          color: colors.dim,
          fontFamily: fonts.regular,
          fontSize: 12,
          lineHeight: 20,
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        Add currency pairs to your watchlist to see their live CLEAR/BLOCKED status here.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: alpha(colors.accent, 0.1),
          borderWidth: 1,
          borderColor: alpha(colors.accent, 0.3),
          borderRadius: 4,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
        onPress={() => router.push('/(tabs)/settings')}
        activeOpacity={0.7}
      >
        <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2 }}>
          ADD PAIRS →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
