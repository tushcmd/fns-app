import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestNotificationPermissions } from '../../lib/notifications';
import { setHasOnboarded } from '../../lib/storage';
import { fonts, alpha } from '../../constants/theme';
import { useColors } from '../../providers/ThemeProvider';

async function finish() {
  await setHasOnboarded();
  router.replace('/(tabs)');
}

export default function OnboardingNotifications() {
  const colors = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View className="flex-1 px-6 pt-12 pb-10 justify-between">

        <View>
          <Text
            style={{
              color: colors.faint,
              fontFamily: fonts.regular,
              fontSize: 12,
              letterSpacing: 2,
              marginBottom: 32,
            }}
          >
            STEP 3 OF 3
          </Text>
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.extraBold,
              fontSize: 20,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            STAY AHEAD OF{'\n'}
            <Text style={{ color: colors.blocked }}>THE BLACKOUT</Text>
          </Text>
          <Text
            style={{
              color: colors.dim,
              fontFamily: fonts.regular,
              fontSize: 14,
              lineHeight: 22,
              marginBottom: 40,
            }}
          >
            FNS can notify you before a blackout window opens — so you&apos;re
            never caught in a trade when NFP drops.
          </Text>

          {[
            ['🔔', 'Alert X minutes before a window opens'],
            ['🚫', 'Immediate alert when a window is currently active'],
            ['✅', 'All times based on your watched pairs only'],
          ].map(([icon, text]) => (
            <View key={text} className="flex-row items-start mb-5">
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: fonts.regular,
                  fontSize: 16,
                  marginRight: 12,
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

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 4,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginTop: 16,
            }}
          >
            <Text
              style={{
                color: colors.faint,
                fontFamily: fonts.regular,
                fontSize: 12,
                lineHeight: 20,
              }}
            >
              All notifications are scheduled locally on your device. No data
              is sent to any server.
            </Text>
          </View>
        </View>

        <View>
          <TouchableOpacity
            style={{
              backgroundColor: alpha(colors.accent, 0.1),
              borderWidth: 1,
              borderColor: alpha(colors.accent, 0.3),
              borderRadius: 4,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
            }}
            onPress={async () => {
              await requestNotificationPermissions();
              await finish();
            }}
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
              ENABLE NOTIFICATIONS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={finish} activeOpacity={0.7}>
            <Text
              style={{
                color: colors.faint,
                fontFamily: fonts.regular,
                fontSize: 12,
                letterSpacing: 2,
                textAlign: 'center',
              }}
            >
              SKIP — ENABLE LATER IN SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
