import { View, Text } from 'react-native';
import { ImpactBadge } from '@/components/ui/ImpactBadge';
import { NewsEvent } from '@/lib/api';
import { colors, fonts } from '@/constants/theme';

function fmtTime(iso: string) {
  return new Date(iso).toUTCString().slice(17, 22) + ' UTC';
}
function fmtWindow(start: string, end: string) {
  return `${new Date(start).toUTCString().slice(17, 22)} → ${new Date(end).toUTCString().slice(17, 22)}`;
}

export function EventCard({ event }: { event: NewsEvent }) {
  const isHigh = event.impact === 'High';

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: isHigh ? colors.urgent : colors.dim,
        }}
      />

      <View style={{ paddingHorizontal: 16, paddingVertical: 16, paddingLeft: 20 }}>
        <View className="flex-row items-start justify-between mb-2">
          <Text
            style={{
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: 13,
              letterSpacing: 0.5,
              flex: 1,
              marginRight: 8,
            }}
          >
            {event.title}
          </Text>
          <ImpactBadge impact={event.impact} />
        </View>

        <View className="flex-row items-center gap-3 mb-2">
          <View
            style={{
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: colors.dim, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2 }}>
              {event.currency}
            </Text>
          </View>
          <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 11 }}>
            {fmtTime(event.event_time)}
          </Text>
        </View>

        <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11, letterSpacing: 0.5 }}>
          WINDOW: {fmtWindow(event.window_start, event.window_end)}
        </Text>

        {(event.forecast || event.previous || event.actual) && (
          <View className="flex-row gap-4 mt-2">
            {event.actual && (
              <Text style={{ color: colors.safe, fontFamily: fonts.regular, fontSize: 11 }}>
                ACT: {event.actual}
              </Text>
            )}
            {event.forecast && (
              <Text style={{ color: colors.dim, fontFamily: fonts.regular, fontSize: 11 }}>
                FCT: {event.forecast}
              </Text>
            )}
            {event.previous && (
              <Text style={{ color: colors.faint, fontFamily: fonts.regular, fontSize: 11 }}>
                PRV: {event.previous}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
