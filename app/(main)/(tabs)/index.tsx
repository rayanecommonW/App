import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { AIPersona } from "@/lib/database.types";
import { useDrawerStore } from "@/lib/drawerStore";
import { useAuthStore, useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { clamp, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const DRAWER_WIDTH = 320;
const OPEN_THRESHOLD = 0.35; // Open if dragged past 35% of drawer width
const VELOCITY_THRESHOLD = 500; // Open/close based on velocity

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

export default function HomeScreen() {
  const { profile, user } = useAuthStore();
  const { startSession } = useChatStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);
  const searchRunIdRef = useRef(0);

  // Left drawer (dating preferences)
  // drawerProgress: 0 = closed, 1 = fully open
  const drawerProgress = useSharedValue(0);
  const gestureStartProgress = useSharedValue(0);
  const { setOpen: setDrawerOpen } = useDrawerStore();

  const openDrawer = useCallback(() => {
    'worklet';
    drawerProgress.value = withSpring(1, SPRING_CONFIG);
    runOnJS(setDrawerOpen)(true);
  }, [drawerProgress, setDrawerOpen]);

  const closeDrawer = useCallback(() => {
    'worklet';
    drawerProgress.value = withSpring(0, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(setDrawerOpen)(false);
      }
    });
  }, [drawerProgress, setDrawerOpen]);

  // Open drawer from JS (for button press)
  const openDrawerJS = useCallback(() => {
    setDrawerOpen(true);
    drawerProgress.value = withSpring(1, SPRING_CONFIG);
  }, [drawerProgress, setDrawerOpen]);

  // Close drawer from JS (for button/overlay press)
  const closeDrawerJS = useCallback(() => {
    drawerProgress.value = withSpring(0, SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(setDrawerOpen)(false);
      }
    });
  }, [drawerProgress, setDrawerOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drawerProgress.value, [0, 1], [-DRAWER_WIDTH, 0]) }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drawerProgress.value, [0, 1], [0, 0.5]),
    pointerEvents: drawerProgress.value > 0.01 ? 'auto' : 'none',
  }));

  // Slight parallax effect on content when drawer opens
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(drawerProgress.value, [0, 1], [0, DRAWER_WIDTH * 0.15]) }],
  }));

  // Navigate to explore tab
  const navigateToExplore = useCallback(() => {
    router.replace("/(main)/(tabs)/explore");
  }, []);

  // Combined gesture for both opening/closing the drawer AND navigating to explore
  // This gesture works anywhere on the screen
  const panGesture = useMemo(() => {
    const NAV_THRESHOLD = 64; // Minimum swipe distance to trigger navigation

    return Gesture.Pan()
      .activeOffsetX([-20, 20]) // Activate after 20px horizontal movement
      .failOffsetY([-15, 15]) // Fail if vertical movement is dominant
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        // Only update drawer progress for rightward swipes (opening) or when drawer is open
        // For leftward swipes when drawer is closed, don't move the drawer
        if (e.translationX > 0 || gestureStartProgress.value > 0) {
          const dragProgress = e.translationX / DRAWER_WIDTH;
          const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
          drawerProgress.value = newProgress;
        }
      })
      .onEnd((e) => {
        const startedClosed = gestureStartProgress.value < 0.01;
        const swipedLeft = e.translationX < -NAV_THRESHOLD || e.velocityX < -VELOCITY_THRESHOLD;

        // If drawer was closed and user swiped left → navigate to explore
        if (startedClosed && swipedLeft) {
          runOnJS(navigateToExplore)();
          return;
        }

        // Otherwise handle drawer open/close
        const currentProgress = drawerProgress.value;
        const velocity = e.velocityX;

        let shouldOpen: boolean;

        if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
          shouldOpen = velocity > 0;
        } else {
          shouldOpen = currentProgress > OPEN_THRESHOLD;
        }

        if (shouldOpen) {
          openDrawer();
        } else {
          closeDrawer();
        }
      });
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer, navigateToExplore]);

  // Preferences (demo)
  const [lookingFor, setLookingFor] = useState<"Everyone" | "Women" | "Men">("Everyone");
  const [ageRange, setAgeRange] = useState<"18-25" | "26-35" | "36+">("26-35");
  const [distance, setDistance] = useState<"5km" | "15km" | "50km">("15km");

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
    <View className="flex-1 bg-background">
      <GestureDetector gesture={panGesture}>
      <Animated.View className="flex-1 pb-40" style={contentStyle}>
        {/* Top bar (Home only): Profile + Settings on the right */}
        <View className="pt-14 pb-5 px-6 flex-row items-start justify-between">
          <View className="flex-row items-start flex-1 pr-3 gap-3">
            <IconButton icon="menu-outline" label="Menu" onPress={openDrawerJS} />
            <View className="flex-1">
              <Text className="text-text-primary text-3xl font-bold tracking-tight">
                Rizz Rnaked
              </Text>
              <Text className="text-text-secondary mt-1">
                Gooner rehab: rizz fast, touch 🍃 grass.
              </Text>
            </View>
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
              🍃 GRASS
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
              Tip: long-press a tab to open its bottom sheet.
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
            <Text className="text-primary text-sm font-semibold">Touch more grass</Text>
          </Card>
        </View>
      </Animated.View>
      </GestureDetector>

      {/* Drawer overlay */}
      <Animated.View
        style={[styles.overlay, overlayStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawerJS} />
      </Animated.View>

      {/* Left drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.drawer, drawerStyle]}>
          <View className="pt-14 px-5 pb-5 flex-row items-start justify-between">
            <SectionHeader
              title="Preferences"
              description="Dating filters (demo)"
              right={<IconButton icon="close" label="Close" onPress={closeDrawerJS} />}
            />
          </View>

          <View className="px-5 gap-3">
            <Card variant="elevated">
              <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
                LOOKING FOR
              </Text>
              <View className="flex-row gap-2">
                {(["Everyone", "Women", "Men"] as const).map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => setLookingFor(v)}
                    className={`flex-1 rounded-2xl border px-3 py-3 items-center ${
                      lookingFor === v
                        ? "bg-surface-light border-border-subtle"
                        : "bg-surface border-border-subtle"
                    } active:opacity-90`}
                  >
                    <Text
                      className={`font-semibold ${
                        lookingFor === v ? "text-text-primary" : "text-text-secondary"
                      }`}
                    >
                      {v}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card>
              <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
                AGE RANGE
              </Text>
              <View className="gap-2">
                {(["18-25", "26-35", "36+"] as const).map((v) => (
                  <ListItem
                    key={v}
                    title={v}
                    subtitle={ageRange === v ? "Selected" : undefined}
                    onPress={() => setAgeRange(v)}
                    right={
                      ageRange === v ? (
                        <Ionicons name="checkmark" size={18} color="#ef233c" />
                      ) : undefined
                    }
                  />
                ))}
              </View>
            </Card>

            <Card variant="outlined">
              <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
                DISTANCE
              </Text>
              <View className="gap-2">
                {(["5km", "15km", "50km"] as const).map((v) => (
                  <ListItem
                    key={v}
                    title={v}
                    subtitle={distance === v ? "Selected" : undefined}
                    onPress={() => setDistance(v)}
                    right={
                      distance === v ? (
                        <Ionicons name="checkmark" size={18} color="#ef233c" />
                      ) : undefined
                    }
                  />
                ))}
              </View>
            </Card>

            <Card variant="outlined">
              <Button onPress={closeDrawerJS} title="Done" variant="primary" size="lg" />
            </Card>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#14060f",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 320,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#f6d9e1",
  },
});


