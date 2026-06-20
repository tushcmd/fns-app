import { View, Text } from "react-native";

interface Props {
  safe: boolean;
  size?: "sm" | "lg";
}

export function SafetyBadge({ safe, size = "sm" }: Props) {
  const isLg = size === "lg";
  return (
    <View
      className={`flex-row items-center gap-2 px-3 py-1.5 rounded border ${
        safe ? "bg-safe/10 border-safe/30" : "bg-blocked/10 border-blocked/30"
      }`}
    >
      <View
        className={`rounded-full ${safe ? "bg-safe" : "bg-blocked"} ${
          isLg ? "w-2.5 h-2.5" : "w-2 h-2"
        }`}
      />
      <Text
        className={`font-mono-bold tracking-widest ${
          safe ? "text-safe" : "text-blocked"
        } ${isLg ? "text-sm" : "text-xs"}`}
      >
        {safe ? "CLEAR" : "BLOCKED"}
      </Text>
    </View>
  );
}
