import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useWatchlist } from '../../../hooks/useWatchlist';
import { useSettings } from '../../../hooks/useSettings';
import { DEFAULT_PAIRS } from '../../../constants/pairs';
import { colors, fonts, alpha } from '../../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFY_OPTIONS: Array<5 | 10 | 15 | 30> = [5, 10, 15, 30];

const rowBorder = { borderBottomWidth: 1, borderBottomColor: colors.border };

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        color: colors.faint,
        fontFamily: fonts.regular,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 12,
        marginTop: 24,
      }}
    >
      {children}
    </Text>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b" style={rowBorder}>
      <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 border-b"
      style={rowBorder}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 12 }}>↗</Text>
    </TouchableOpacity>
  );
}

export default function Settings() {
  const { pairs, add, remove } = useWatchlist();
  const { settings, update } = useSettings();
  const [showPicker, setShowPicker] = useState(false);
  const [customPair, setCustomPair] = useState('');

  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ FNS — Test Notification',
        body: 'Notifications are working correctly.',
      },
      trigger: null,
    });
  }

  async function addCustomPair() {
    const upper = customPair.toUpperCase().trim();
    if (upper.length >= 3) {
      await add(upper);
      setCustomPair('');
      setShowPicker(false);
    }
  }

  async function resetOnboarding() {
    await AsyncStorage.removeItem('fns:hasOnboarded');
    router.replace('/onboarding');
  }

  if (!settings) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView className="flex-1">

        {/* Header */}
        <View className="px-5 py-4 border-b" style={rowBorder}>
          <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 16, letterSpacing: 2 }}>
            SETTINGS
          </Text>
        </View>

        <View className="px-5">

          {/* ── Watchlist ── */}
          <SectionLabel>WATCHLIST</SectionLabel>

          {pairs.map((pair) => (
            <View
              key={pair}
              className="flex-row items-center justify-between py-3 border-b"
              style={rowBorder}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 }}>
                {pair}
              </Text>
              <TouchableOpacity onPress={() => remove(pair)} activeOpacity={0.7}>
                <Text style={{ color: colors.urgent, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 1 }}>
                  REMOVE
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            className="py-3 border-b"
            style={rowBorder}
            onPress={() => setShowPicker(!showPicker)}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2 }}>
              + ADD PAIR
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <View className="py-3 border-b" style={rowBorder}>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {DEFAULT_PAIRS.filter((p) => !pairs.includes(p)).map((p) => (
                  <TouchableOpacity
                    key={p}
                    className="rounded px-3 py-1.5"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    onPress={() => { add(p); setShowPicker(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: colors.dim, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 }}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 rounded px-3 py-2"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                    fontFamily: fonts.regular,
                    fontSize: 12,
                  }}
                  placeholder="Custom pair (e.g. GBPCAD)"
                  placeholderTextColor={colors.faint}
                  value={customPair}
                  onChangeText={setCustomPair}
                  autoCapitalize="characters"
                  onSubmitEditing={addCustomPair}
                />
                <TouchableOpacity
                  className="rounded px-4 items-center justify-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={addCustomPair}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 14 }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Notifications ── */}
          <SectionLabel>NOTIFICATIONS</SectionLabel>

          <Row label="INCLUDE MEDIUM IMPACT">
            <Switch
              value={settings.includeMedium}
              onValueChange={(v) => { void update({ includeMedium: v }); }}
              trackColor={{ false: colors.border, true: colors.accent + '50' }}
              thumbColor={colors.accent}
            />
          </Row>

          <View className="py-3 border-b" style={rowBorder}>
            <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5, marginBottom: 12 }}>
              NOTIFY BEFORE WINDOW (MIN)
            </Text>
            <View className="flex-row gap-2">
              {NOTIFY_OPTIONS.map((opt) => {
                const isSelected = settings.notifyMinutesBefore === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    className="flex-1 py-2 rounded items-center"
                    style={{
                      backgroundColor: isSelected ? alpha(colors.accent, 0.1) : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? alpha(colors.accent, 0.4) : colors.border,
                    }}
                    onPress={() => update({ notifyMinutesBefore: opt })}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: isSelected ? colors.accent : colors.dim }}>
                      {opt}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            className="py-3 border-b"
            style={rowBorder}
            onPress={sendTestNotification}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5 }}>
              SEND TEST NOTIFICATION
            </Text>
          </TouchableOpacity>

          {/* ── More Tools ── */}
          <SectionLabel>MORE TOOLS</SectionLabel>
          <LinkRow label="CHROME EXTENSION" url="https://chromewebstore.google.com/detail/nfdcdhkgoiohipbhoalpnenhincbpnlc" />
          <LinkRow label="MCP FOR CLAUDE" url="https://tushcmd.github.io/fns-fe/mcp/" />
          <LinkRow label="API DOCS" url="https://tushcmd.github.io/fns-fe/apiv1/" />
          <LinkRow label="EVENT TAXONOMY" url="https://tushcmd.github.io/fns-fe/event-taxonomy/" />
          <LinkRow label="GITHUB" url="https://github.com/tushcmd/fnewsteer" />
          <LinkRow label="𝕏 @0xtush" url="https://x.com/0xtush" />

          {/* ── Development ── */}
          <SectionLabel>DEVELOPMENT</SectionLabel>
          <TouchableOpacity
            className="py-3 border-b"
            style={rowBorder}
            onPress={resetOnboarding}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.blocked, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5 }}>
              RESET ONBOARDING
            </Text>
          </TouchableOpacity>

          {/* ── Legal ── */}
          <SectionLabel>LEGAL</SectionLabel>
          <LinkRow label="PRIVACY POLICY" url="https://tushcmd.github.io/fns-fe/privacy/" />
          <LinkRow label="TERMS OF SERVICE" url="https://tushcmd.github.io/fns-fe/terms/" />
          <LinkRow label="DISCLAIMER" url="https://tushcmd.github.io/fns-fe/disclaimer/" />

          <View className="py-8 items-center">
            <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 2 }}>
              FNS v1.0.0 · NOT FINANCIAL ADVICE
            </Text>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}