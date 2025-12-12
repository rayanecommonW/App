import { AIPersona } from "@/lib/database.types";
import { shadowStyle } from "@/lib/shadow";
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
  const { profile, user } = useAuthStore();
  const { startSession } = useChatStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);

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
    if (isSearching) return; // guard double taps

    setMatchError(null);
    setIsSearching(true);
    setSearchStatus("Entering the queue...");
    console.log("[match] start");

    try {
      const userId = profile?.id ?? user?.id;
      if (!userId) {
        throw new Error("Not signed in. Please sign in again.");
      }

      if (
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL.includes("YOUR_SUPABASE_URL")
      ) {
        throw new Error("Supabase environment variables are missing.");
      }

      // Simulate queue time for immersion
      await new Promise((r) => setTimeout(r, 1500));
      setSearchStatus("Searching for opponent...");
      await new Promise((r) => setTimeout(r, 2000));
      setSearchStatus("Match found! Connecting...");

      // Get a random AI persona
      const { data: personas, error: personaError } = await supabase
        .from("ai_personas")
        .select("*")
        .limit(25);

      if (personaError || !personas?.length) {
        throw new Error("No personas available");
      }

      const randomPersona = personas[
        Math.floor(Math.random() * personas.length)
      ] as AIPersona;
      console.log("[match] persona", randomPersona.id);

      // Create chat session
      const { data: session, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          ai_persona_id: randomPersona.id,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      console.log("[match] session created", session.id);

      // Initialize chat store
      startSession(session.id, randomPersona);

      await new Promise((r) => setTimeout(r, 500));

      // Reset searching state before navigation
      setIsSearching(false);
      setSearchStatus("");

      // Navigate to chat
      router.push(`/(main)/chat/${session.id}`);
    } catch (error) {
      console.error("[match] failed", error);
      const message =
        error instanceof Error ? error.message : "Unable to start match.";
      setMatchError(message);
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
        colors={["#fff2f6", "#ffffff"]}
        className="absolute inset-0"
      />
      <View className="absolute -right-20 -top-24 w-56 h-56 rounded-full bg-primary/10" />
      <View className="absolute -left-16 bottom-10 w-48 h-48 rounded-full bg-primary-soft/30" />

      {/* Header */}
      <View className="pt-14 pb-6 px-6 flex-row justify-between items-center">
        <View className="gap-1">
          <View className="px-3 py-1 rounded-full bg-primary/10 border border-border-subtle/80 self-start">
            <Text className="text-primary text-[11px] font-semibold tracking-[0.8px]">
              LIVE ARENA
            </Text>
          </View>
          <Text className="text-text-primary text-[32px] font-black tracking-tight">
            BotRoyal
          </Text>
          <Text className="text-text-secondary">
            5 minutes. One guess. Don’t blink.
          </Text>
        </View>
        <Pressable
          onPress={signOut}
          className="active:scale-95"
        >
          <LinearGradient
            colors={["#ffffff", "#fff2f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-11 h-11 rounded-2xl items-center justify-center border border-border-subtle"
          >
            <Ionicons name="log-out-outline" size={22} color="#ef233c" />
          </LinearGradient>
        </Pressable>
      </View>

      <View className="px-6">
        {/* Rank + mode */}
        <View
          className="bg-surface rounded-3xl p-5 border border-border-subtle"
          style={shadowStyle({
            color: "#ef233c",
            opacity: 0.08,
            radius: 16,
            offsetY: 10,
            elevation: 6,
          })}
        >
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-text-secondary text-xs">ELO RATING</Text>
              <Text className="text-text-primary text-4xl font-black mt-1">
                {profile?.elo_rating || 1000}
              </Text>
              <Text className="text-primary font-semibold mt-1">
                {profile?.is_premium ? "TRUTH tier" : "Ranked ladder"}
              </Text>
            </View>
            <View className="items-end space-y-2">
              <View className="px-3 py-2 rounded-2xl bg-primary/10 border border-primary/20">
                <Text className="text-primary font-semibold text-xs">
                  5:00 RANKED
                </Text>
              </View>
              <View className="px-3 py-2 rounded-2xl bg-surface-light/80 border border-border-subtle/80">
                <Text className="text-text-secondary font-semibold text-xs">
                  {profile?.is_premium ? "Real-only enabled" : "Mixed queue"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Mode explainer */}
        <View className="mt-4 bg-surface-light rounded-3xl p-4 border border-border-subtle/70">
          <View className="flex-row items-center">
            <View className="w-11 h-11 rounded-2xl bg-primary/15 items-center justify-center mr-3">
              <Ionicons name="flash" size={22} color="#ef233c" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary font-semibold">
                Ranked mind game
              </Text>
              <Text className="text-text-secondary text-sm">
                Chat fast, read vibes, drop your verdict when the timer dies.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Play Area */}
      <View className="flex-1 justify-center items-center px-6">
        {isSearching ? (
          <View className="items-center gap-3">
            <View className="w-32 h-32 rounded-full border-4 border-primary/30 items-center justify-center mb-2">
              <ActivityIndicator size="large" color="#ef233c" />
            </View>
            <Text className="text-text-primary text-lg font-semibold">
              {searchStatus}
            </Text>
            <Text className="text-text-secondary text-sm">
              Matching you with a sharp mind...
            </Text>
            <Pressable onPress={cancelSearch} className="mt-3">
              <Text className="text-danger font-semibold">Cancel search</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View style={animatedStyle} className="items-center">
            <Pressable onPress={handleFindMatch}>
              <LinearGradient
                colors={["#ef233c", "#ff6b6b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-48 h-48 rounded-full items-center justify-center"
                style={shadowStyle({
                  color: "#ef233c",
                  opacity: 0.42,
                  radius: 26,
                  offsetY: 0,
                  elevation: 14,
                })}
              >
                <Ionicons name="sparkles" size={26} color="#ffffff" />
                <Text className="text-background text-2xl font-black mt-1">
                  FIND MATCH
                </Text>
                <Text className="text-background/70 text-sm mt-1">
                  5-minute duel
                </Text>
              </LinearGradient>
            </Pressable>
            <View className="flex-row items-center mt-5">
              <View className="w-8 h-8 rounded-2xl bg-primary/10 items-center justify-center mr-3">
                <Ionicons name="chatbubbles" size={18} color="#ef233c" />
              </View>
              <Text className="text-text-secondary">
                Win by vibe-checking the impostor.
              </Text>
            </View>
            {matchError ? (
              <Text className="text-danger text-sm mt-4 text-center px-6">
                {matchError}
              </Text>
            ) : null}
          </Animated.View>
        )}
      </View>

      {/* Bottom Info */}
      <View className="px-6 pb-10">
        <View className="bg-surface rounded-2xl px-4 py-3 border border-border-subtle flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-primary mr-2" />
            <Text className="text-text-secondary text-sm">
              {Math.floor(Math.random() * 500) + 100} players online now
            </Text>
          </View>
          <Text className="text-primary text-sm font-semibold">Rank up</Text>
        </View>
      </View>
    </View>
  );
}

