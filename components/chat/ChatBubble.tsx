import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatBubble({
  content,
  isUser,
  timestamp,
}: ChatBubbleProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      className={`max-w-[82%] mb-3 ${isUser ? "self-end" : "self-start"}`}
    >
      <View
        className={`px-4 py-3 rounded-[22px] ${
          isUser
            ? "bg-primary shadow-glow"
            : "bg-surface border border-border-subtle/80"
        }`}
      >
        <Text
          className={`text-base leading-5 ${
            isUser ? "text-background" : "text-text-primary"
          }`}
        >
          {content}
        </Text>
      </View>
      {timestamp && (
        <Text
          className={`text-xs text-muted mt-1 ${isUser ? "text-right mr-1" : "ml-1"}`}
        >
          {timestamp}
        </Text>
      )}
    </Animated.View>
  );
}

// Typing Indicator Component
export function TypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="self-start max-w-[82%] mb-3"
    >
      <View className="bg-surface border border-border-subtle/80 rounded-[22px] px-4 py-3 flex-row items-center">
        <View className="flex-row space-x-1">
          <Animated.View
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              opacity: 0.4,
            }}
          />
          <Animated.View
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              opacity: 0.6,
            }}
          />
          <Animated.View
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              opacity: 0.8,
            }}
          />
        </View>
        <Text className="text-muted text-sm ml-2">typing...</Text>
      </View>
    </Animated.View>
  );
}

