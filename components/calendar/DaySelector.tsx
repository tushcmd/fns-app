import { View, Text, TouchableOpacity } from 'react-native';
import { colors, fonts, alpha } from '@/constants/theme';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

interface Props {
  selected: number;
  onSelect: (index: number) => void;
  eventCounts: number[];
}

export function DaySelector({ selected, onSelect, eventCounts }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {DAYS.map((day, i) => {
        const isActive = selected === i;
        const count = eventCounts[i] ?? 0;
        return (
          <TouchableOpacity
            key={day}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: isActive ? alpha(colors.accent, 0.05) : 'transparent',
              borderBottomWidth: isActive ? 2 : 0,
              borderBottomColor: isActive ? colors.accent : 'transparent',
            }}
            onPress={() => onSelect(i)}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontFamily: fonts.bold,
                fontSize: 11,
                letterSpacing: 1,
                color: isActive ? colors.accent : colors.dim,
              }}
            >
              {day}
            </Text>
            {count > 0 && (
              <View
                style={{
                  marginTop: 4,
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  backgroundColor: isActive ? alpha(colors.accent, 0.2) : colors.surface2,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.bold,
                    fontSize: 11,
                    color: isActive ? colors.accent : colors.faint,
                  }}
                >
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
