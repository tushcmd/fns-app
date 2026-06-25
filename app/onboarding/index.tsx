import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts, alpha } from '../../constants/theme';
import { useColors } from '../../providers/ThemeProvider';

export default function OnboardingIndex() {
  const colors = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-16 pb-10 justify-between min-h-full">

          <View>
            <View className="mb-12">
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: fonts.extraBold,
                  fontSize: 30,
                  letterSpacing: 2,
                }}
              >
                ◎ FNS
              </Text>
              <Text
                style={{
                  color: colors.dim,
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  letterSpacing: 2,
                  marginTop: 4,
                }}
              >
                FUNDAMENTAL NEWS STEER
              </Text>
            </View>

            <Text
              style={{
                color: colors.text,
                fontFamily: fonts.extraBold,
                fontSize: 24,
                letterSpacing: 1,
                lineHeight: 32,
                marginBottom: 16,
              }}
            >
              KNOW WHEN{'\n'}
              <Text style={{ color: colors.safe }}>TO TRADE</Text>{'\n'}
              KNOW WHEN{'\n'}
              <Text style={{ color: colors.blocked }}>NOT TO</Text>
            </Text>

            <Text
              style={{
                color: colors.dim,
                fontFamily: fonts.regular,
                fontSize: 14,
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              High-impact news events like NFP, CPI, and FOMC create violent
              price spikes that can stop out technically perfect setups in
              seconds.
            </Text>

            <Text
              style={{
                color: colors.dim,
                fontFamily: fonts.regular,
                fontSize: 14,
                lineHeight: 22,
                marginBottom: 32,
              }}
            >
              FNS tells you when a blackout window is active — so you stop
              paddling out into hurricanes.
            </Text>

            {[
              ['◈', 'Live CLEAR/BLOCKED status for your pairs'],
              ['🔔', 'Notifications before blackout windows open'],
              ['📅', 'Full week event calendar at a glance'],
            ].map(([icon, text]) => (
              <View key={text} className="flex-row items-start mb-4">
                <Text
                  style={{
                    color: colors.accent,
                    fontFamily: fonts.regular,
                    fontSize: 16,
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  {icon}
                </Text>
                <Text
                  style={{
                    color: colors.dim,
                    fontFamily: fonts.regular,
                    fontSize: 14,
                    lineHeight: 22,
                    flex: 1,
                  }}
                >
                  {text}
                </Text>
              </View>
            ))}
          </View>

          <View>
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 4,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: colors.faint,
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  lineHeight: 20,
                  letterSpacing: 0.5,
                }}
              >
                ⚠ NOT FINANCIAL ADVICE — A timing tool, not a strategy.
                Always apply your own analysis.
              </Text>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: alpha(colors.accent, 0.1),
                borderWidth: 1,
                borderColor: alpha(colors.accent, 0.3),
                borderRadius: 4,
                paddingVertical: 16,
                alignItems: 'center',
              }}
              onPress={() => router.push('/onboarding/watchlist')}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: fonts.bold,
                  fontSize: 12,
                  letterSpacing: 2,
                }}
              >
                GET STARTED →
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
