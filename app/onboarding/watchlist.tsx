import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_PAIRS } from '../../constants/pairs';
import { setWatchlist } from '../../lib/storage';
import { colors, fonts, alpha } from '../../constants/theme';

export default function OnboardingWatchlist() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');

  function toggle(pair: string) {
    setSelected((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair],
    );
  }

  function addCustom() {
    const upper = custom.toUpperCase().trim();
    if (upper.length >= 3 && !selected.includes(upper)) {
      setSelected((prev) => [...prev, upper]);
      setCustom('');
    }
  }

  async function proceed() {
    if (selected.length > 0) await setWatchlist(selected);
    router.push('/onboarding/notifications');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-12 pb-10 justify-between min-h-full">

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
              STEP 2 OF 3
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
              ADD YOUR PAIRS
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
              Select the pairs you trade. FNS will monitor their status and
              notify you before blackout windows open.
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {DEFAULT_PAIRS.map((pair) => {
                const isSelected = selected.includes(pair);
                return (
                  <TouchableOpacity
                    key={pair}
                    onPress={() => toggle(pair)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 4,
                      borderWidth: 1,
                      backgroundColor: isSelected ? alpha(colors.accent, 0.1) : colors.surface,
                      borderColor: isSelected ? alpha(colors.accent, 0.4) : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.bold,
                        fontSize: 12,
                        letterSpacing: 1,
                        color: isSelected ? colors.accent : colors.dim,
                      }}
                    >
                      {pair}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="flex-row gap-2 mb-2">
              <TextInput
                className="flex-1 rounded px-4 py-3"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: fonts.regular,
                  fontSize: 14,
                }}
                placeholder="Custom pair (e.g. GBPCAD)"
                placeholderTextColor={colors.faint}
                value={custom}
                onChangeText={setCustom}
                autoCapitalize="characters"
                onSubmitEditing={addCustom}
              />
              <TouchableOpacity
                className="rounded px-4 items-center justify-center"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={addCustom}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 14 }}>+</Text>
              </TouchableOpacity>
            </View>

            {selected.length > 0 && (
              <Text
                style={{
                  color: colors.dim,
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  letterSpacing: 0.5,
                  marginTop: 8,
                }}
              >
                {selected.length} pair{selected.length > 1 ? 's' : ''} selected
              </Text>
            )}
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
              onPress={proceed}
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
                {selected.length > 0 ? 'CONTINUE →' : 'SKIP FOR NOW →'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text
                style={{
                  color: colors.faint,
                  fontFamily: fonts.regular,
                  fontSize: 12,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}
              >
                ← BACK
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
