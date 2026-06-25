import { View, Text } from 'react-native';
import { fonts, alpha } from '@/constants/theme';
import { useColors } from '@/providers/ThemeProvider';

interface Props {
  safe: boolean;
  size?: 'sm' | 'lg';
}

export function SafetyBadge({ safe, size = 'sm' }: Props) {
  const colors = useColors();
  const isLg = size === 'lg';
  const dotSize = isLg ? 10 : 8;
  const fontSize = isLg ? 13 : 11;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        backgroundColor: safe ? alpha(colors.safe, 0.1) : alpha(colors.blocked, 0.1),
        borderWidth: 1,
        borderColor: safe ? alpha(colors.safe, 0.3) : alpha(colors.blocked, 0.3),
      }}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: safe ? colors.safe : colors.blocked,
        }}
      />
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize,
          letterSpacing: 1.5,
          color: safe ? colors.safe : colors.blocked,
        }}
      >
        {safe ? 'CLEAR' : 'BLOCKED'}
      </Text>
    </View>
  );
}
