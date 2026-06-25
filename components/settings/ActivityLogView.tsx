import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/constants/theme';
import { ActivityLogEntry } from '@/lib/storage';

function fmtTime(ts: number) {
  const d = new Date(ts);
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  const mon = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `${mon}/${day}`;
}

interface Props {
  entries: ActivityLogEntry[];
  onClear: () => void;
  onClose: () => void;
}

export function ActivityLogView({ entries, onClear, onClose }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 14, letterSpacing: 2 }}>
          ACTIVITY LOG
        </Text>
        <View className="flex-row items-center gap-3">
          {entries.length > 0 && (
            <TouchableOpacity onPress={onClear} hitSlop={8}>
              <Text style={{ color: colors.urgent, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 1 }}>
                CLEAR
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={colors.dim} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.toSafe ? colors.safe : colors.blocked,
              }}
            />
            <View style={{ flex: 1 }}>
              <View className="flex-row items-center gap-2">
                <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1 }}>
                  {item.pair}
                </Text>
                <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 10 }}>
                  {item.fromSafe ? 'CLEAR' : 'BLOCKED'} → {item.toSafe ? 'CLEAR' : 'BLOCKED'}
                </Text>
              </View>
              {item.blockingEvent && (
                <Text
                  style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 10, marginTop: 2 }}
                  numberOfLines={1}
                >
                  {item.blockingEvent}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 10 }}>
                {fmtTime(item.timestamp)}
              </Text>
              <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 9 }}>
                {fmtDate(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-16">
            <Ionicons name="document-text-outline" size={28} color={colors.faint} />
            <Text
              style={{
                color: colors.faint,
                fontFamily: fonts.regular,
                fontSize: 12,
                marginTop: 10,
                letterSpacing: 0.5,
              }}
            >
              No activity yet
            </Text>
            <Text
              style={{
                color: colors.faint,
                fontFamily: fonts.regular,
                fontSize: 11,
                marginTop: 4,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              Status changes will appear here{'\n'}when your watched pairs flip CLEAR↔BLOCKED.
            </Text>
          </View>
        }
      />
    </View>
  );
}
