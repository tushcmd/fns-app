import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fonts, alpha } from '@/constants/theme';
import { useColors } from '@/providers/ThemeProvider';

interface Props {
  stale: boolean;
  cachedAt?: number;
}

function formatAge(ms: number): string {
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m ago` : `${hrs}h ago`;
}

export function StaleDataBanner({ stale, cachedAt }: Props) {
  const colors = useColors();
  const [ageText, setAgeText] = useState('');

  useEffect(() => {
    if (!stale || !cachedAt) return;
    function update() {
      setAgeText(formatAge(Date.now() - cachedAt));
    }
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [stale, cachedAt]);

  if (!stale) return null;

  return (
    <View
      style={{
        backgroundColor: alpha(colors.blocked, 0.1),
        borderBottomWidth: 1,
        borderBottomColor: alpha(colors.blocked, 0.2),
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Ionicons name="cloud-offline-outline" size={14} color={colors.blocked} />
      <Text style={{ color: colors.blocked, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5, flex: 1 }}>
        Offline — showing cached data{ageText ? ` from ${ageText}` : ''}
      </Text>
    </View>
  );
}
