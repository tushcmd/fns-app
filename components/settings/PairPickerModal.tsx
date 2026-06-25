import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_PAIRS } from '@/constants/pairs';
import { colors, fonts } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (pair: string) => void;
  watchedPairs: string[];
}

export function PairPickerModal({ visible, onClose, onAdd, watchedPairs }: Props) {
  const [search, setSearch] = useState('');

  const available = DEFAULT_PAIRS.filter((p) => !watchedPairs.includes(p));
  const filtered = search.trim()
    ? available.filter((p) => p.includes(search.toUpperCase().trim()))
    : available;

  const customPair = search.toUpperCase().trim();
  const isCustom = customPair.length >= 3 && !DEFAULT_PAIRS.includes(customPair as (typeof DEFAULT_PAIRS)[number]) && !watchedPairs.includes(customPair);

  function handleAdd(pair: string) {
    onAdd(pair.toUpperCase().trim());
    setSearch('');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80%',
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.border,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 14, letterSpacing: 2 }}>
                ADD PAIR
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={20} color={colors.dim} />
              </TouchableOpacity>
            </View>

            <View
              className="flex-row items-center rounded px-3"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="search" size={16} color={colors.faint} style={{ marginRight: 8 }} />
              <TextInput
                className="flex-1 py-2.5"
                style={{
                  color: colors.text,
                  fontFamily: fonts.regular,
                  fontSize: 13,
                }}
                placeholder="Search or type custom pair…"
                placeholderTextColor={colors.faint}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="characters"
                autoFocus
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={colors.faint} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {isCustom && (
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => handleAdd(customPair)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1 }}>
                  {customPair}
                </Text>
              </View>
              <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11 }}>
                CUSTOM
              </Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 400 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => handleAdd(item)}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1 }}>
                  {item}
                </Text>
                <Ionicons name="add-outline" size={18} color={colors.dim} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !isCustom ? (
                <View className="py-12 items-center">
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.faint} />
                  <Text
                    style={{
                      color: colors.faint,
                      fontFamily: fonts.regular,
                      fontSize: 12,
                      marginTop: 8,
                      letterSpacing: 0.5,
                    }}
                  >
                    All pairs added
                  </Text>
                </View>
              ) : null
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
