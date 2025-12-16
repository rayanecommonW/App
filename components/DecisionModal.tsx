import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuthStore, useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

// Grass score constants
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

      // Update user's grass score
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
            <Card variant="elevated" className="p-5">
              <View className="mb-5">
                <Text className="text-text-secondary text-xs font-semibold tracking-[0.8px]">
                  TIME’S UP
                </Text>
                <Text className="text-text-primary text-2xl font-bold mt-2">
                  Make your call
                </Text>
                <Text className="text-text-secondary mt-2">
                  Was your match a real person or an AI?
                </Text>
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={() => handleGuess("real")}
                  disabled={isProcessing}
                  className="bg-primary border border-primary rounded-2xl px-4 py-4 flex-row items-center justify-center gap-3 active:opacity-90"
                >
                  <Ionicons name="person-outline" size={20} color="#ffffff" />
                  <Text className="text-background font-bold text-base">
                    Real human
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleGuess("ai")}
                  disabled={isProcessing}
                  className="bg-surface border border-border-subtle rounded-2xl px-4 py-4 flex-row items-center justify-center gap-3 active:opacity-90"
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={20}
                    color="#14060f"
                  />
                  <Text className="text-text-primary font-bold text-base">
                    AI agent
                  </Text>
                </Pressable>
              </View>
            </Card>
          </Animated.View>
        )}

        {state === "revealing" && (
          <Animated.View
            entering={ZoomIn.duration(300)}
            className="w-full max-w-sm"
          >
            <Card variant="elevated" className="items-center py-8">
              <View className="w-16 h-16 rounded-2xl bg-surface-light border border-border-subtle items-center justify-center">
                <ActivityIndicator size="small" color="#ef233c" />
              </View>
              <Text className="text-text-primary text-lg font-bold mt-4">
                Analyzing...
              </Text>
              <Text className="text-text-secondary mt-2">
                You guessed: {userGuess === "real" ? "Human" : "AI"}
              </Text>
            </Card>
          </Animated.View>
        )}

        {state === "result" && (
          <Animated.View
            entering={FadeIn.duration(500)}
            className="w-full max-w-sm items-center"
          >
            <Card variant="elevated" className="w-full">
              <View className="items-center">
                <Animated.View
                  entering={ZoomIn.delay(200).duration(400)}
                  className={`w-20 h-20 rounded-2xl items-center justify-center border ${
                    wasCorrect
                      ? "bg-surface-light border-border-subtle"
                      : "bg-surface-light border-border-subtle"
                  }`}
                >
                  <Ionicons
                    name={wasCorrect ? "checkmark" : "close"}
                    size={40}
                    color={wasCorrect ? "#ef233c" : "#d7263d"}
                  />
                </Animated.View>
              </View>

              <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                <Text
                  className={`text-3xl font-bold text-center mt-5 ${
                    wasCorrect ? "text-text-primary" : "text-text-primary"
                  }`}
                >
                  {wasCorrect ? "Correct" : "Wrong"}
                </Text>

                <Text className="text-text-secondary text-center mt-3">
                  Your match was an <Text className="font-bold">AI agent</Text>.
                </Text>

                <View className="items-center mt-6">
                  <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px]">
                    🍃 GRASS CHANGE
                  </Text>
                  <Text
                    className={`text-3xl font-bold mt-1 ${
                      eloChange > 0 ? "text-primary" : "text-danger"
                    }`}
                  >
                    {eloChange > 0 ? "+" : ""}
                    {eloChange}
                  </Text>
                </View>

                {!wasCorrect && (
                  <View className="mt-6 bg-surface-light rounded-2xl p-4 border border-border-subtle">
                    <Text className="text-text-primary font-semibold text-center">
                      Want real-only matches?
                    </Text>
                    <Text className="text-text-secondary text-center text-sm mt-2">
                      TRUTH tier removes the guessing (demo).
                    </Text>
                    <Button
                      onPress={() => {}}
                      title="View plans"
                      variant="primary"
                      size="md"
                      className="mt-4"
                    />
                  </View>
                )}

                <Button
                  onPress={handleClose}
                  title="Continue"
                  variant="secondary"
                  size="lg"
                  className="mt-6"
                />
              </Animated.View>
            </Card>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

