import { shadowStyle } from "@/lib/shadow";
import React from "react";
import { Text, View } from "react-native";

interface ChatTimerProps {
  timeRemaining: number;
  maxTime: number;
}

export default function ChatTimer({ timeRemaining, maxTime }: ChatTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = timeRemaining / maxTime;

  // Determine color based on time remaining
  const getColor = () => {
    if (progress > 0.5) return "#ef233c";
    if (progress > 0.25) return "#ffb347";
    return "#d7263d";
  };

  const isLow = timeRemaining <= 60;

  return (
    <View className="items-center">
      <View className="flex-row items-center space-x-2">
        <View
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: getColor(),
            ...shadowStyle({
              color: getColor(),
              opacity: isLow ? 0.8 : 0.5,
              radius: isLow ? 8 : 4,
            }),
          }}
        />
        <Text
          className={`font-mono text-lg font-bold ${
            isLow ? "text-danger" : "text-text-primary"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="w-32 h-1.5 bg-surface-light rounded-full mt-2 overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: getColor(),
          }}
        />
      </View>
    </View>
  );
}

