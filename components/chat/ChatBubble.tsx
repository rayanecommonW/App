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
      entering={FadeInUp.duration(250).springify()}
      className={`max-w-[80%] mb-2 ${isUser ? "self-end" : "self-start"}`}
    >
      <View
        className={`px-4 py-2.5 ${
          isUser
            ? "bg-primary rounded-2xl rounded-br-md"
            : "bg-surface-light rounded-2xl rounded-bl-md"
        }`}
      >
        <Text
          className={`text-[15px] leading-[21px] ${
            isUser ? "text-white" : "text-text-primary"
          }`}
        >
          {content}
        </Text>
      </View>
      {timestamp && (
        <Text
          className={`text-[11px] text-muted mt-1 ${
            isUser ? "text-right pr-1" : "pl-1"
          }`}
        >
          {timestamp}
        </Text>
      )}
    </Animated.View>
  );
}

export function TypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="self-start max-w-[80%] mb-2"
    >
      <View className="bg-surface-light rounded-2xl rounded-bl-md px-4 py-3 flex-row items-center gap-1">
        <View className="w-2 h-2 rounded-full bg-muted opacity-40" />
        <View className="w-2 h-2 rounded-full bg-muted opacity-60" />
        <View className="w-2 h-2 rounded-full bg-muted opacity-80" />
      </View>
    </Animated.View>
  );
}
