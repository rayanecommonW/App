import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import IconButton from "@/components/ui/IconButton";
import ListItem from "@/components/ui/ListItem";
import SectionHeader from "@/components/ui/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
    AGE_RANGE_OPTIONS,
    DISTANCE_OPTIONS,
    LOOKING_FOR_OPTIONS,
    type AgeRange,
    type Distance,
    type LookingFor,
} from "./constants";
import { styles } from "./styles";

export function HomeHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  return (
    <View className="pt-14 pb-5 px-6 flex-row items-start justify-between">
      <View className="flex-row items-start flex-1 pr-3 gap-3">
        <IconButton icon="menu-outline" label="Menu" onPress={onOpenDrawer} />
        <View className="flex-1">
          <Text className="text-text-primary text-3xl font-bold tracking-tight">Rizz Ranked</Text>
          <Text className="text-text-secondary mt-1">
            Prove you&apos;re not a gooner by touching grass
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
  );
}

export function HomeStatsCards({
  eloRating,
  tierLabel,
}: {
  eloRating: number;
  tierLabel: string;
}) {
  return (
    <View className="px-6 gap-3">
      <Card variant="elevated">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-lg">🍃</Text>
          <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px]">
            GRASS TOUCHED
          </Text>
        </View>
        <View className="flex-row items-end justify-between">
          <Text className="text-text-primary text-4xl font-bold">{eloRating}</Text>
          <View className="px-3 py-2 rounded-xl bg-surface-light border border-border-subtle">
            <Text className="text-text-secondary text-xs font-semibold">{tierLabel}</Text>
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
  );
}

function ArenaDisplay() {
  return (
    <View className="items-center mb-2">
      <Text style={styles.arenaLabel}>ARENA 1</Text>

      <View style={styles.imageGlowContainer}>
        <View style={[styles.glowLayer, styles.glowLayer1]} />
        <View style={[styles.glowLayer, styles.glowLayer2]} />
        <View style={[styles.glowLayer, styles.glowLayer3]} />
        <Image
          source={require("@/assets/images/cave.png")}
          style={styles.arenaImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.arenaTitle}>Maidenless Cave</Text>
    </View>
  );
}

export function MatchSection({
  isSearching,
  searchStatus,
  matchError,
  onCancelSearch,
  onFindMatch,
}: {
  isSearching: boolean;
  searchStatus: string;
  matchError: string | null;
  onCancelSearch: () => void;
  onFindMatch: () => void;
}) {
  if (isSearching) {
    return (
      <Card variant="elevated" className="items-center py-8">
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center">
          <ActivityIndicator size="small" color="#ef233c" />
        </View>
        <Text className="text-text-primary text-lg font-semibold mt-4">{searchStatus}</Text>
        <Text className="text-text-secondary mt-2 text-center px-6">
          Matching you with a sharp mind...
        </Text>

        {matchError ? (
          <Text className="text-danger text-sm mt-3 text-center px-6">{matchError}</Text>
        ) : null}

        <Pressable onPress={onCancelSearch} className="mt-5 active:opacity-80">
          <Text className="text-danger font-semibold">Cancel</Text>
        </Pressable>
      </Card>
    );
  }

  return (
    <View className="gap-4">
      <ArenaDisplay />

      <Button onPress={onFindMatch} title="Find match" variant="primary" size="lg" />
      <Text className="text-muted text-center text-sm">
        Swipe up on bottom sheet for notifications
      </Text>
    </View>
  );
}

export function OnlineStatusCard({ onlineCount }: { onlineCount: number }) {
  return (
    <Card variant="outlined" className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full bg-green-500" />
        <Text className="text-text-secondary text-sm">{onlineCount} online</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Ionicons name="leaf" size={14} color="#ef233c" />
        <Text className="text-primary text-sm font-semibold">Touch grass</Text>
      </View>
    </Card>
  );
}

export function DrawerOverlay({
  gesture,
  overlayStyle,
  onPress,
}: {
  gesture: any;
  overlayStyle: any;
  onPress: () => void;
}) {
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />
      </Animated.View>
    </GestureDetector>
  );
}

export function PreferencesDrawer({
  gesture,
  drawerStyle,
  onClose,
  lookingFor,
  setLookingFor,
  ageRange,
  setAgeRange,
  distance,
  setDistance,
}: {
  gesture: any;
  drawerStyle: any;
  onClose: () => void;
  lookingFor: LookingFor;
  setLookingFor: (v: LookingFor) => void;
  ageRange: AgeRange;
  setAgeRange: (v: AgeRange) => void;
  distance: Distance;
  setDistance: (v: Distance) => void;
}) {
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <View className="pt-14 px-5 pb-5 flex-row items-start justify-between">
          <SectionHeader
            title="Preferences"
            description="Dating filters (demo)"
            right={<IconButton icon="close" label="Close" onPress={onClose} />}
          />
        </View>

        <View className="px-5 gap-3">
          <Card variant="elevated">
            <Text className="text-text-secondary text-xs font-semibold tracking-[0.6px] mb-2">
              LOOKING FOR
            </Text>
            <View className="flex-row gap-2">
              {LOOKING_FOR_OPTIONS.map((v) => (
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
              {AGE_RANGE_OPTIONS.map((v) => (
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
              {DISTANCE_OPTIONS.map((v) => (
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
            <Button onPress={onClose} title="Done" variant="primary" size="lg" />
          </Card>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}


