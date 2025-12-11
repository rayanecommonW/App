import { AIPersona } from "@/lib/database.types";
import { useAuthStore, useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const { profile } = useAuthStore();
  const { startSession } = useChatStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");

  // Pulsing animation for the button
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleFindMatch = async () => {
    setIsSearching(true);
    setSearchStatus("Entering the queue...");

    try {
      // Simulate queue time for immersion
      await new Promise((r) => setTimeout(r, 1500));
      setSearchStatus("Searching for opponent...");
      await new Promise((r) => setTimeout(r, 2000));
      setSearchStatus("Match found! Connecting...");

      // Get a random AI persona
      const { data: personas, error: personaError } = await supabase
        .from("ai_personas")
        .select("*");

      if (personaError || !personas?.length) {
        throw new Error("No personas available");
      }

      const randomPersona = personas[
        Math.floor(Math.random() * personas.length)
      ] as AIPersona;

      // Create chat session
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: profile!.id,
          ai_persona_id: randomPersona.id,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Initialize chat store
      startSession(session.id, randomPersona);

      await new Promise((r) => setTimeout(r, 500));

      // Reset searching state before navigation
      setIsSearching(false);
      setSearchStatus("");

      // Navigate to chat
      router.push(`/(main)/chat/${session.id}`);
    } catch (error) {
      console.error("Match error:", error);
      setSearchStatus("Error finding match. Try again.");
      setTimeout(() => {
        setIsSearching(false);
        setSearchStatus("");
      }, 2000);
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setSearchStatus("");
  };

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={["#fff3f6", "#ffffff"]}
        className="absolute inset-0"
      />
      {/* Header */}
      <View className="pt-16 pb-6 px-6 flex-row justify-between items-start">
        <View>
          <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 self-start mb-2">
            <Text className="text-primary text-xs font-semibold">
              Daily Playground
            </Text>
          </View>
          <Text className="text-text-primary text-3xl font-bold">TURING</Text>
          <Text className="text-text-secondary mt-1">
            Real or AI? Prove your skill.
          </Text>
        </View>
        <Pressable
          onPress={signOut}
          className="bg-surface-light p-2 rounded-xl border border-border-subtle active:scale-95"
        >
          <Ionicons name="log-out-outline" size={22} color="#a698b7" />
        </Pressable>
      </View>

      {/* Stats Card */}
      <View className="mx-6 bg-surface rounded-3xl p-6 border border-border-subtle shadow-glow">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-text-secondary text-sm">YOUR RANK</Text>
            <Text className="text-text-primary text-3xl font-bold mt-1">
              {profile?.elo_rating || 1000}
            </Text>
            <Text className="text-primary text-sm mt-1">ELO Rating</Text>
          </View>
          <View className="items-end">
            <View
              className={`px-4 py-2 rounded-full ${
                profile?.is_premium ? "bg-warning/20" : "bg-surface-light/80"
              }`}
            >
              <Text
                className={`font-semibold ${
                  profile?.is_premium ? "text-warning" : "text-text-secondary"
                }`}
              >
                {profile?.is_premium ? "TRUTH" : "SEEKER"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Game Mode Info */}
      <View className="mx-6 mt-6 bg-surface-light/70 rounded-3xl p-5 border border-border-subtle/60">
        <Text className="text-primary font-semibold mb-2">RANKED QUEUE</Text>
        <Text className="text-text-secondary text-sm leading-5">
          Chat with your match for 5 minutes. When time expires, decide: are you
          talking to a real person or an AI? Guess correctly to climb the ranks.
        </Text>
      </View>

      {/* Main Play Area */}
      <View className="flex-1 justify-center items-center px-6">
        {isSearching ? (
          <View className="items-center">
            <View className="w-32 h-32 rounded-full border-4 border-primary/30 items-center justify-center mb-6">
              <ActivityIndicator size="large" color="#ff5c7c" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mb-2">
              {searchStatus}
            </Text>
            <Pressable onPress={cancelSearch} className="mt-4">
              <Text className="text-danger font-semibold">Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View style={animatedStyle}>
            <Pressable onPress={handleFindMatch}>
              <LinearGradient
                colors={["#ff5c7c", "#ff87a4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-48 h-48 rounded-full items-center justify-center"
                style={{
                  shadowColor: "#ff5c7c",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.45,
                  shadowRadius: 24,
                  elevation: 12,
                }}
              >
                <Text className="text-background text-2xl font-bold">PLAY</Text>
                <Text className="text-background/70 text-sm mt-1">
                  Find Match
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Bottom Info */}
      <View className="px-6 pb-8">
        <View className="flex-row justify-center items-center space-x-2">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-text-secondary text-sm">
            {Math.floor(Math.random() * 500) + 100} players online
          </Text>
        </View>
      </View>
    </View>
  );
}

