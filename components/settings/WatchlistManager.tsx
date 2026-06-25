import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';

interface Props {
  pairs: string[];
  onRemove: (pair: string) => void;
  onReorder: (newOrder: string[]) => void;
}

export function WatchlistManager({ pairs, onRemove, onReorder }: Props) {
  function moveUp(index: number) {
    if (index <= 0) return;
    const next = [...pairs];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onReorder(next);
  }

  function moveDown(index: number) {
    if (index >= pairs.length - 1) return;
    const next = [...pairs];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onReorder(next);
  }

  return (
    <View>
      {pairs.map((pair, index) => (
        <View
          key={pair}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="flex-row" style={{ gap: 2 }}>
              <TouchableOpacity
                onPress={() => moveUp(index)}
                disabled={index === 0}
                hitSlop={8}
                activeOpacity={0.5}
              >
                <Ionicons
                  name="chevron-up"
                  size={16}
                  color={index === 0 ? colors.surface2 : colors.dim}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveDown(index)}
                disabled={index === pairs.length - 1}
                hitSlop={8}
                activeOpacity={0.5}
              >
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={index === pairs.length - 1 ? colors.surface2 : colors.dim}
                />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 }}>
              {pair}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onRemove(pair)} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={colors.urgent} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
