import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Linking,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useWatchlist } from '../../../hooks/useWatchlist';
import { useWatchlists } from '../../../hooks/useWatchlists';
import { useSettings } from '../../../hooks/useSettings';
import { useActivityLog } from '../../../hooks/useActivityLog';
import { colors, fonts, alpha } from '../../../constants/theme';
import { PairPickerModal } from '../../../components/settings/PairPickerModal';
import { WatchlistManager } from '../../../components/settings/WatchlistManager';
import { ActivityLogView } from '../../../components/settings/ActivityLogView';
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
  const { pairs, add, remove, reorder } = useWatchlist();
  const { lists, activeName, create, remove: deleteList, refresh } = useWatchlists();
  const { settings, update } = useSettings();
  const [showPicker, setShowPicker] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const { entries: logEntries, clear: clearLog } = useActivityLog();

  async function sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ FNS — Test Notification',
        body: 'Notifications are working correctly.',
      },
      trigger: null,
    });
  }

  async function handleCreateList() {
    const name = newListName.trim();
    if (!name) return;
    if (lists.some((l) => l.name === name)) {
      Alert.alert('Already exists', `A watchlist named "${name}" already exists.`);
      return;
    }
    await create(name, []);
    setNewListName('');
    setShowNewList(false);
    await refresh();
  }

  async function handleDeleteList(name: string) {
    if (lists.length <= 1) return;
    Alert.alert('Delete Watchlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteList(name);
          await refresh();
        },
      },
    ]);
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

          {/* ── Watchlists ── */}
          <SectionLabel>WATCHLISTS</SectionLabel>

          {lists.map((list) => (
            <View
              key={list.name}
              className="flex-row items-center justify-between py-3 border-b"
              style={rowBorder}
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 }}>
                  {list.name}
                </Text>
                {list.name === activeName && (
                  <View
                    style={{
                      backgroundColor: alpha(colors.accent, 0.15),
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}
                  >
                    <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1 }}>
                      ACTIVE
                    </Text>
                  </View>
                )}
                <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 10 }}>
                  {list.pairs.length} pair{list.pairs.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View className="flex-row gap-3">
                {lists.length > 1 && (
                  <TouchableOpacity onPress={() => handleDeleteList(list.name)} activeOpacity={0.7}>
                    <Text style={{ color: colors.urgent, fontFamily: fonts.regular, fontSize: 11 }}>DEL</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {showNewList ? (
            <View className="py-3 border-b" style={rowBorder}>
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
                  placeholder="Watchlist name"
                  placeholderTextColor={colors.faint}
                  value={newListName}
                  onChangeText={setNewListName}
                  autoFocus
                  onSubmitEditing={handleCreateList}
                />
                <TouchableOpacity
                  className="rounded px-4 items-center justify-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={handleCreateList}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12 }}>ADD</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded px-3 items-center justify-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => { setShowNewList(false); setNewListName(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.dim, fontFamily: fonts.bold, fontSize: 12 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="py-3 border-b"
              style={rowBorder}
              onPress={() => setShowNewList(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2 }}>
                + NEW WATCHLIST
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Active Watchlist Pairs ── */}
          <SectionLabel>
            {activeName.toUpperCase()} — PAIRS
          </SectionLabel>

          <WatchlistManager pairs={pairs} onRemove={remove} onReorder={reorder} />

          <TouchableOpacity
            className="py-3 border-b"
            style={rowBorder}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2 }}>
              + ADD PAIR
            </Text>
          </TouchableOpacity>

          <PairPickerModal
            visible={showPicker}
            onClose={() => setShowPicker(false)}
            onAdd={(pair) => { add(pair); setShowPicker(false); }}
            watchedPairs={pairs}
          />

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

          {/* ── Activity Log ── */}
          <SectionLabel>ACTIVITY LOG</SectionLabel>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3 border-b"
            style={rowBorder}
            onPress={() => setShowLog(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.5 }}>
              VIEW LOG
            </Text>
            <View className="flex-row items-center gap-2">
              {logEntries.length > 0 && (
                <View
                  style={{
                    backgroundColor: alpha(colors.accent, 0.15),
                    borderRadius: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 10 }}>
                    {logEntries.length}
                  </Text>
                </View>
              )}
              <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 12 }}>↗</Text>
            </View>
          </TouchableOpacity>

          <Modal visible={showLog} animationType="slide" onRequestClose={() => setShowLog(false)}>
            <ActivityLogView entries={logEntries} onClear={() => { clearLog(); }} onClose={() => setShowLog(false)} />
          </Modal>

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