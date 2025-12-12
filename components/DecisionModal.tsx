import { useAuthStore, useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

interface DecisionModalProps {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
}

type GuessType = "real" | "ai";
type ResultState = "guessing" | "revealing" | "result";

// ELO constants
const ELO_WIN = 25;
const ELO_LOSS = -20;

export default function DecisionModal({
  visible,
  sessionId,
  onClose,
}: DecisionModalProps) {
  const { profile, setProfile } = useAuthStore();
  const { reset: resetChat } = useChatStore();
  const [state, setState] = useState<ResultState>("guessing");
  const [userGuess, setUserGuess] = useState<GuessType | null>(null);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [eloChange, setEloChange] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // In MVP, all matches are AI
  const actualMatch: GuessType = "ai";

  const handleGuess = async (guess: GuessType) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setUserGuess(guess);
    setState("revealing");

    // Dramatic reveal haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Suspense delay
    await new Promise((r) => setTimeout(r, 2000));

    const correct = guess === actualMatch;
    const elo = correct ? ELO_WIN : ELO_LOSS;
    
    setWasCorrect(correct);
    setEloChange(elo);
    setState("result");

    // Result haptics
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Update database
    try {
      // Update session with result
      await supabase
        .from("chat_sessions")
        .update({
          ended_at: new Date().toISOString(),
          user_guess: guess,
          was_correct: correct,
          elo_change: elo,
        })
        .eq("id", sessionId);

      // Update user's ELO
      if (profile) {
        const newElo = Math.max(0, profile.elo_rating + elo);
        await supabase
          .from("profiles")
          .update({ elo_rating: newElo })
          .eq("id", profile.id);

        // Update local state
        setProfile({ ...profile, elo_rating: newElo });
      }
    } catch (error) {
      console.error("Failed to save result:", error);
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    resetChat();
    // Reset modal state
    setState("guessing");
    setUserGuess(null);
    setWasCorrect(null);
    setEloChange(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-background/90 items-center justify-center px-6">
        {state === "guessing" && (
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="w-full max-w-sm"
          >
            {/* Title */}
            <View className="items-center mb-8">
              <Text className="text-primary text-sm font-semibold tracking-widest mb-2">
                TIME&apos;S UP
              </Text>
              <Text className="text-text-primary text-3xl font-bold text-center">
                Make Your Call
              </Text>
              <Text className="text-text-secondary text-center mt-2">
                Was your match a real person or an AI?
              </Text>
            </View>

            {/* Buttons */}
            <View className="space-y-4">
              <Pressable
                onPress={() => handleGuess("real")}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={["#ef233c", "#ff6b6b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 rounded-3xl items-center shadow-glow"
                >
                  <View className="flex-row items-center space-x-3">
                    <Ionicons name="person" size={24} color="#ffffff" />
                    <Text className="text-background text-xl font-bold">
                      REAL HUMAN
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => handleGuess("ai")}
                disabled={isProcessing}
                className="mt-4"
              >
                <LinearGradient
                  colors={["#fff5f7", "#ffffff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-5 rounded-3xl items-center border border-border-subtle/60"
                >
                  <View className="flex-row items-center space-x-3">
                    <Ionicons name="hardware-chip" size={24} color="#1b102b" />
                    <Text className="text-text-primary text-xl font-bold">
                      AI AGENT
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {state === "revealing" && (
          <Animated.View
            entering={ZoomIn.duration(300)}
            className="items-center"
          >
            <ActivityIndicator size="large" color="#ef233c" />
            <Text className="text-text-primary text-xl font-bold mt-4">
              Analyzing match...
            </Text>
            <Text className="text-text-secondary mt-2">
              You guessed: {userGuess === "real" ? "HUMAN" : "AI"}
            </Text>
          </Animated.View>
        )}

        {state === "result" && (
          <Animated.View
            entering={FadeIn.duration(500)}
            className="w-full max-w-sm items-center"
          >
            {/* Result Icon */}
            <Animated.View
              entering={ZoomIn.delay(200).duration(400)}
              className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                wasCorrect ? "bg-primary/15" : "bg-danger/15"
              }`}
            >
              <Ionicons
                name={wasCorrect ? "checkmark-circle" : "close-circle"}
                size={64}
                color={wasCorrect ? "#ef233c" : "#d7263d"}
              />
            </Animated.View>

            {/* Result Text */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <Text
                className={`text-4xl font-bold text-center ${
                  wasCorrect ? "text-primary" : "text-danger"
                }`}
              >
                {wasCorrect ? "CORRECT!" : "WRONG!"}
              </Text>

              <Text className="text-text-secondary text-center mt-3">
                Your match was an{" "}
                <Text className="text-secondary font-bold">AI Agent</Text>
              </Text>

              {/* ELO Change */}
              <View className="items-center mt-6">
                <Text className="text-text-secondary text-sm">ELO CHANGE</Text>
                <Text
                  className={`text-3xl font-bold ${
                    eloChange > 0 ? "text-primary" : "text-danger"
                  }`}
                >
                  {eloChange > 0 ? "+" : ""}
                  {eloChange}
                </Text>
              </View>

              {/* Upsell for incorrect guess */}
              {!wasCorrect && (
                <Animated.View
                  entering={FadeInUp.delay(600)}
                  className="mt-8 bg-surface-light rounded-3xl p-5 border border-warning/30"
                >
                  <Text className="text-warning font-semibold text-center">
                    Fooled by the machine?
                  </Text>
                  <Text className="text-text-secondary text-center text-sm mt-2">
                    Upgrade to TRUTH tier and never guess again. Match with 100%
                    real humans.
                  </Text>
                  <Pressable className="mt-4">
                    <LinearGradient
                      colors={["#ef233c", "#ff6b6b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="py-3 rounded-2xl items-center"
                    >
                      <Text className="text-background font-bold">
                        UPGRADE NOW
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              )}
            </Animated.View>

            {/* Close Button */}
            <Animated.View
              entering={FadeIn.delay(800)}
              className="mt-8 w-full"
            >
              <Pressable
                onPress={handleClose}
                className="bg-surface border border-border-subtle py-4 rounded-2xl items-center active:scale-[0.99]"
              >
                <Text className="text-text-primary font-semibold">
                  Continue
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

