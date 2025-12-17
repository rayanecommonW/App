import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
} from "react-native-reanimated";

type StartsFirst = "user" | "match";

interface CoinFlipRevealProps {
  startsFirst: StartsFirst;
  matchName: string;
  onComplete: () => void;
}

export default function CoinFlipReveal({
  startsFirst,
  matchName,
  onComplete,
}: CoinFlipRevealProps) {
  const [phase, setPhase] = useState<"flipping" | "revealed">("flipping");

  useEffect(() => {
    // Show "Flipping..." for 2.6s, then reveal
    const flipTimer = setTimeout(() => {
      setPhase("revealed");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 2600);

    return () => clearTimeout(flipTimer);
  }, []);

  useEffect(() => {
    if (phase === "revealed") {
      // Auto-dismiss after 3.5s
      const dismissTimer = setTimeout(() => {
        onComplete();
      }, 3500);

      return () => clearTimeout(dismissTimer);
    }
  }, [phase, onComplete]);

  const handleTap = () => {
    if (phase === "revealed") {
      onComplete();
    }
  };

  const isUserFirst = startsFirst === "user";

  return (
    <Pressable
      onPress={handleTap}
      className="absolute inset-0 z-50 bg-background items-center justify-center"
    >
      {phase === "flipping" && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="items-center"
        >
          <View className="w-20 h-20 rounded-full bg-surface-light border border-border-subtle items-center justify-center mb-4">
            <Ionicons name="sync" size={32} color="#a17b88" />
          </View>
          <Text className="text-text-secondary text-lg font-medium">
            Flipping...
          </Text>
        </Animated.View>
      )}

      {phase === "revealed" && (
        <Animated.View
          entering={ZoomIn.duration(300)}
          className="items-center px-8"
        >
          <View
            className={`w-24 h-24 rounded-full items-center justify-center mb-5 ${
              isUserFirst ? "bg-primary" : "bg-surface-light border border-border-subtle"
            }`}
          >
            <Ionicons
              name={isUserFirst ? "person" : "chatbubble-ellipses"}
              size={40}
              color={isUserFirst ? "#ffffff" : "#14060f"}
            />
          </View>

          <Text className="text-text-primary text-2xl font-bold text-center">
            {isUserFirst ? "You go first" : `${matchName} goes first`}
          </Text>

          <Text className="text-text-secondary text-base mt-2 text-center">
            {isUserFirst
              ? "Break the ice with something good"
              : "Wait for their opener..."}
          </Text>

          <Text className="text-muted text-xs mt-6">tap to continue</Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

