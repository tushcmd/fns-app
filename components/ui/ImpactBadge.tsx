import { View, Text } from 'react-native';
import { fonts, alpha } from '@/constants/theme';
import { useColors } from '@/providers/ThemeProvider';

interface Props {
  impact: string;
}

export function ImpactBadge({ impact }: Props) {
  const colors = useColors();
  const isHigh = impact === 'High';
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: isHigh ? alpha(colors.urgent, 0.1) : colors.surface2,
        borderWidth: 1,
        borderColor: isHigh ? alpha(colors.urgent, 0.2) : colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: 11,
          letterSpacing: 1,
          color: isHigh ? colors.urgent : colors.dim,
        }}
      >
        {impact.toUpperCase()}
      </Text>
    </View>
  );
}
