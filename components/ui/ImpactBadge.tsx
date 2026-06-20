import { View, Text } from "react-native";

interface Props {
  impact: string;
}

export function ImpactBadge({ impact }: Props) {
  const isHigh = impact === "High";
  return (
    <View
      className={`px-2 py-0.5 rounded border ${
        isHigh ? "bg-urgent/10 border-urgent/20" : "bg-surface2 border-border"
      }`}
    >
      <Text
        className={`font-mono-bold text-xs tracking-wider ${
          isHigh ? "text-urgent" : "text-dim"
        }`}
      >
        {impact.toUpperCase()}
      </Text>
    </View>
  );
}
