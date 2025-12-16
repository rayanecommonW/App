import React from "react";
import { Text, View } from "react-native";

interface ChatTimerProps {
  timeRemaining: number;
  maxTime: number;
}

export default function ChatTimer({ timeRemaining, maxTime }: ChatTimerProps) {
  const minutes = Math.floor(Math.max(0, timeRemaining) / 60);
  const seconds = Math.max(0, timeRemaining) % 60;
  const progress = Math.max(0, timeRemaining) / maxTime;
  const isLow = timeRemaining <= 15;

  return (
    <View className="flex-row items-center gap-2 mt-0.5">
      <View
        className={`w-1.5 h-1.5 rounded-full ${
          isLow ? "bg-danger" : "bg-primary"
        }`}
      />
      <Text
        className={`text-sm font-medium tabular-nums ${
          isLow ? "text-danger" : "text-muted"
        }`}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Text>
      <View className="w-16 h-1 bg-surface-light rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${isLow ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
