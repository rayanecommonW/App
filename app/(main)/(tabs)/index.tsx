import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import { AIPersona } from "@/lib/database.types";
import { useAuthStore, useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const { profile, user } = useAuthStore();
  const { startSession } = useChatStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);
  const searchRunIdRef = useRef(0);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const withTimeout = async <T,>(
    promise: PromiseLike<T>,
    ms: number,
    label: string
  ): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out`));
      }, ms);
    });

    try {
      return await Promise.race([Promise.resolve(promise), timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const handleFindMatch = async () => {
    if (isSearching) return; // guard double taps
    const runId = ++searchRunIdRef.current;
    const isStale = () => runId !== searchRunIdRef.current;

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
      await sleep(900);
      if (isStale()) return;
      setSearchStatus("Searching for opponent...");
      await sleep(1200);
      if (isStale()) return;
      setSearchStatus("Match found! Connecting...");
      console.log("[match] fetching persona");

      // Get a random AI persona
      const { data: personas, error: personaError } = await withTimeout(
        supabase.from("ai_personas").select("*").limit(25),
        12_000,
        "Fetching personas"
      );

      if (personaError || !personas?.length) {
        throw new Error("No personas available");
      }

      const randomPersona = personas[
        Math.floor(Math.random() * personas.length)
      ] as AIPersona;
      console.log("[match] persona", randomPersona.id);

      // Create chat session
      console.log("[match] creating session");
      const { data: session, error: sessionError } = await withTimeout(
        supabase
          .from("chat_sessions")
          .insert({
            user_id: userId,
            ai_persona_id: randomPersona.id,
          })
          .select()
          .single(),
        12_000,
        "Creating session"
      );

      if (sessionError) throw sessionError;
      console.log("[match] session created", session.id);

      // Initialize chat store
      startSession(session.id, randomPersona);

      await sleep(250);
      if (isStale()) return;

      // Reset searching state before navigation
      setIsSearching(false);
      setSearchStatus("");

      // Navigate to chat
      router.push(`/(main)/chat/${session.id}`);
    } catch (error) {
      console.error("[match] failed", error);
      const message = error instanceof Error ? error.message : "Unable to start match.";
      setMatchError(message);
      setSearchStatus("Error finding match. Try again.");
      setTimeout(() => {
        setIsSearching(false);
        setSearchStatus("");
      }, 2000);
    }
  };

  const cancelSearch = () => {
    searchRunIdRef.current += 1;
    setIsSearching(false);
    setSearchStatus("");
  };

  return (
    <View className="flex-1 bg-background pb-40">
      {/* Top bar (Home only): Settings + Profile on the right */}
      <View className="pt-14 pb-5 px-6 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-text-primary text-3xl font-bold tracking-tight">
            BotRoyal
          </Text>
          <Text className="text-text-secondary mt-1">
            5 minutes. One guess. Don’t blink.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <IconButton
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push("/(main)/settings")}
          />
          <IconButton
            icon="person-outline"
            label="Profile"
            onPress={() => router.push("/(main)/profile")}
          />
        </View>
      </View>

      {/* Stats + rules */}
      <View className="px-6 gap-3">
        <Card variant="elevated">
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px]">
            ELO
          </Text>
          <View className="flex-row items-end justify-between mt-2">
            <Text className="text-text-primary text-4xl font-bold">
              {profile?.elo_rating || 1000}
            </Text>
            <View className="px-3 py-2 rounded-xl bg-surface-light border border-border-subtle">
              <Text className="text-text-secondary text-xs font-semibold">
                {profile?.is_premium ? "TRUTH" : "RANKED"}
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="outlined">
          <View className="flex-row items-center justify-between">
            <Text className="text-text-primary font-semibold">How it works</Text>
            <View className="w-10 h-10 rounded-2xl bg-surface-light border border-border-subtle items-center justify-center">
              <Ionicons name="flash-outline" size={18} color="#ef233c" />
            </View>
          </View>
          <Text className="text-text-secondary mt-2">
            Chat fast, read vibes, then guess real or AI when time runs out.
          </Text>
          <Text className="text-muted mt-2">
            Tip: long-press the Home tab to open notifications.
          </Text>
        </Card>
      </View>

      {/* Main CTA */}
      <View className="flex-1 justify-center px-6">
        {isSearching ? (
          <Card variant="elevated" className="items-center py-8">
            <View className="w-16 h-16 rounded-2xl bg-surface-light border border-border-subtle items-center justify-center">
              <ActivityIndicator size="small" color="#ef233c" />
            </View>
            <Text className="text-text-primary text-lg font-semibold mt-4">
              {searchStatus}
            </Text>
            <Text className="text-text-secondary mt-2 text-center px-6">
              Matching you with a sharp mind...
            </Text>

            {matchError ? (
              <Text className="text-danger text-sm mt-3 text-center px-6">
                {matchError}
              </Text>
            ) : null}

            <Pressable onPress={cancelSearch} className="mt-5 active:opacity-80">
              <Text className="text-danger font-semibold">Cancel</Text>
            </Pressable>
          </Card>
        ) : (
          <View className="gap-3">
            <Button
              onPress={handleFindMatch}
              title="Find match"
              variant="primary"
              size="lg"
            />
            <Text className="text-text-secondary text-center">
              Pull up the bottom sheet for notifications.
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="px-6">
        <Card variant="outlined" className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-sm bg-primary mr-2" />
            <Text className="text-text-secondary text-sm">
              {Math.floor(Math.random() * 500) + 100} online
            </Text>
          </View>
          <Text className="text-primary text-sm font-semibold">Rank up</Text>
        </Card>
      </View>
    </View>
  );
}


