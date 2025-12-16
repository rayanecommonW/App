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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { clamp, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const DRAWER_WIDTH = 320;
const OPEN_THRESHOLD = 0.35;
const VELOCITY_THRESHOLD = 500;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
};

export default function HomeContent() {
  const { profile, user } = useAuthStore();
  const { startSession } = useChatStore();
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [matchError, setMatchError] = useState<string | null>(null);
  const searchRunIdRef = useRef(0);

  // Left drawer (dating preferences)
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

  const openDrawerJS = useCallback(() => {
    setDrawerOpen(true);
    drawerProgress.value = withSpring(1, SPRING_CONFIG);
  }, [drawerProgress, setDrawerOpen]);

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

  // Content moves right when drawer opens
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateX: interpolate(drawerProgress.value, [0, 1], [0, DRAWER_WIDTH * 0.15])
    }],
  }));

  // Drawer gesture - ONLY handles right swipes (opening) and closing when drawer is open
  // Left swipes are handled by TabPager for smooth pager animation
  const drawerGesture = useMemo(() => {
    return Gesture.Pan()
      // Only activate on rightward movement (>20px) - let left swipes go to TabPager
      // When drawer is open (gestureStartProgress > 0), we need to handle both directions
      .activeOffsetX(20) // Activate only on right swipe when drawer is closed
      .failOffsetY([-15, 15])
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        // Always handle when drawer is open or opening
        const dragProgress = e.translationX / DRAWER_WIDTH;
        const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
        drawerProgress.value = newProgress;
      })
      .onEnd((e) => {
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
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer]);

  // Separate gesture for when drawer is already open (needs to handle both directions)
  const drawerOpenGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onStart(() => {
        gestureStartProgress.value = drawerProgress.value;
      })
      .onUpdate((e) => {
        if (gestureStartProgress.value > 0.01) {
          const dragProgress = e.translationX / DRAWER_WIDTH;
          const newProgress = clamp(gestureStartProgress.value + dragProgress, 0, 1);
          drawerProgress.value = newProgress;
        }
      })
      .onEnd((e) => {
        if (gestureStartProgress.value < 0.01) return;
        
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
  }, [drawerProgress, gestureStartProgress, openDrawer, closeDrawer]);

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
    if (isSearching) return;
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

      await sleep(900);
      if (isStale()) return;
      setSearchStatus("Searching for opponent...");
      await sleep(1200);
      if (isStale()) return;
      setSearchStatus("Match found! Connecting...");
      console.log("[match] fetching persona");

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

      startSession(session.id, randomPersona);

      await sleep(250);
      if (isStale()) return;

      setIsSearching(false);
      setSearchStatus("");

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
    <View style={styles.container}>
      {/* Smooth gradient background */}
      <LinearGradient
        colors={['#ffe4e9', '#fff8f9', '#ffffff']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <GestureDetector gesture={drawerGesture}>
      <Animated.View className="flex-1 pb-40" style={contentStyle}>
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

        <View className="px-6 gap-3">
          <Card variant="elevated">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-lg">🍃</Text>
              <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px]">
                GRASS SCORE
              </Text>
            </View>
            <View className="flex-row items-end justify-between">
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
              <View className="flex-row items-center gap-2">
                <Ionicons name="flash" size={16} color="#ef233c" />
                <Text className="text-text-primary font-semibold">How it works</Text>
              </View>
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name="help" size={16} color="#ef233c" />
              </View>
            </View>
            <Text className="text-text-secondary mt-2 leading-5">
              Chat fast, read vibes, then guess real or AI when time runs out.
            </Text>
          </Card>
        </View>

        <View className="flex-1 justify-center px-6">
          {isSearching ? (
            <Card variant="elevated" className="items-center py-8">
              <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
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
            <View className="gap-4">
              <Button
                onPress={handleFindMatch}
                title="Find match"
                variant="primary"
                size="lg"
              />
              <Text className="text-muted text-center text-sm">
                Swipe up on bottom sheet for notifications
              </Text>
            </View>
          )}
        </View>

        <View className="px-6">
          <Card variant="outlined" className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-text-secondary text-sm">
                {Math.floor(Math.random() * 500) + 100} online
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="leaf" size={14} color="#ef233c" />
              <Text className="text-primary text-sm font-semibold">Touch grass</Text>
            </View>
          </Card>
        </View>
      </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawerJS} />
      </Animated.View>

      <GestureDetector gesture={drawerOpenGesture}>
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
  container: {
    flex: 1,
  },
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
