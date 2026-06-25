import { View, Text, TouchableOpacity, Modal, Pressable, FlatList } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, alpha } from '@/constants/theme';
import { NamedWatchlist } from '@/lib/storage';

interface Props {
  lists: NamedWatchlist[];
  activeName: string;
  onSelect: (name: string) => void;
}

export function WatchlistSwitcher({ lists, activeName, onSelect }: Props) {
  const [visible, setVisible] = useState(false);

  function handleSelect(name: string) {
    onSelect(name);
    setVisible(false);
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: alpha(colors.accent, 0.08),
          borderWidth: 1,
          borderColor: alpha(colors.accent, 0.2),
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <Text style={{ color: colors.accent, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.5 }}>
          {activeName}
        </Text>
        <Ionicons name="chevron-down" size={12} color={colors.accent} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 32 }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: colors.bg,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              maxHeight: 360,
              overflow: 'hidden',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 13, letterSpacing: 2 }}>
                SWITCH WATCHLIST
              </Text>
            </View>

            <FlatList
              data={lists}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => {
                const isActive = item.name === activeName;
                return (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isActive ? alpha(colors.accent, 0.05) : 'transparent',
                    }}
                    onPress={() => handleSelect(item.name)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text
                        style={{
                          color: isActive ? colors.accent : colors.text,
                          fontFamily: fonts.bold,
                          fontSize: 12,
                          letterSpacing: 1,
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          color: colors.faint,
                          fontFamily: fonts.regular,
                          fontSize: 10,
                          marginTop: 2,
                        }}
                      >
                        {item.pairs.length} pair{item.pairs.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    {isActive && <Ionicons name="checkmark" size={16} color={colors.accent} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 12 }}>
                    No watchlists yet
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
