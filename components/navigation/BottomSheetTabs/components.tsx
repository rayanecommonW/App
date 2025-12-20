import { GlassView } from "@/components/ui/GlassView";
import ListItem from "@/components/ui/ListItem";
import SheetSection from "@/components/ui/SheetSection";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetBackgroundProps } from "@gorhom/bottom-sheet";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import type { TabConfig, TabName } from "./constants";
import { styles } from "./styles";
import { ANDROID_BOTTOM_SHEET_BORDER, ANDROID_LIQUID_GLASS_FALLBACK, BOTTOM_SHEET_TABS_SHEET_RADIUS } from "./ui";

export function Badge({ text }: { text: string }) {
  return (
    <GlassView
      effect="clear"
      tintColor="rgba(255,255,255,0.22)"
      androidFallback={ANDROID_LIQUID_GLASS_FALLBACK.badge}
      borderRadius={12}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>{text}</Text>
    </GlassView>
  );
}

export function Panel({ tab }: { tab: TabName }) {
  if (tab === "index") {
    return (
      <SheetSection title="Notifications">
        <ListItem
          title="Queue tip"
          subtitle="Tap Find match to start a ranked duel."
          right={<Badge text="NEW" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="Daily streak"
          subtitle="Play 1 match today to keep your streak."
          right={<Badge text="1/1" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="Patch notes"
          subtitle="Liquid glass bottom navigation is live."
          className="bg-white/55 border-white/70"
        />
      </SheetSection>
    );
  }

  if (tab === "explore") {
    return (
      <SheetSection title="Leaderboard">
        <ListItem
          title="#1  NeonFox"
          subtitle="🍃 Grass 2110"
          right={<Badge text="GM" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="#2  Quartz"
          subtitle="🍃 Grass 1984"
          right={<Badge text="M" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="#3  RedPanda"
          subtitle="🍃 Grass 1766"
          right={<Badge text="D" />}
          className="bg-white/55 border-white/70"
        />
      </SheetSection>
    );
  }

  if (tab === "matches") {
    return (
      <SheetSection title="History">
        <ListItem
          title="AI Agent"
          subtitle="Correct rizz • +25 🍃 Grass"
          right={<Badge text="+25" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="AI Agent"
          subtitle="Missed rizz • -20 🍃 Grass"
          right={<Badge text="-20" />}
          className="bg-white/55 border-white/70"
        />
        <ListItem
          title="AI Agent"
          subtitle="Correct rizz • +25 🍃 Grass"
          right={<Badge text="+25" />}
          className="bg-white/55 border-white/70"
        />
      </SheetSection>
    );
  }

  return (
    <SheetSection title="Plans">
      <ListItem
        title="TRUTH tier"
        subtitle="Match with real humans only (demo)"
        right={<Badge text="TOP" />}
        className="bg-white/55 border-white/70"
      />
      <ListItem title="Pro" subtitle="More matches + perks (demo)" className="bg-white/55 border-white/70" />
      <ListItem
        title="Free"
        subtitle="Standard queue"
        right={<Badge text="CURRENT" />}
        className="bg-white/55 border-white/70"
      />
    </SheetSection>
  );
}

export function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <GlassView
      effect="clear"
      tintColor="rgba(255, 255, 255, 0.18)"
      androidFallback={ANDROID_LIQUID_GLASS_FALLBACK.sheetBackground}
      borderRadius={BOTTOM_SHEET_TABS_SHEET_RADIUS}
      style={[
        style,
        styles.sheetBackground,
        Platform.OS === "android"
          ? {
              borderWidth: ANDROID_BOTTOM_SHEET_BORDER.width,
              borderColor: ANDROID_BOTTOM_SHEET_BORDER.color,
            }
          : null,
      ]}
    />
  );
}

export function TabButton({
  tab,
  isFocused,
  onPress,
  onLongPress,
}: {
  tab: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tabButton,
        isFocused && styles.tabButtonFocused,
        pressed && styles.tabPressed,
      ]}
      android_ripple={{ color: "rgba(20, 6, 15, 0.06)", borderless: false }}
    >
      <View style={styles.tabContent}>
        <Ionicons
          name={isFocused ? tab.iconActive : tab.icon}
          size={20}
          color={isFocused ? "#14060f" : "#7a5966"}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
          {tab.label}
        </Text>
      </View>
    </Pressable>
  );
}


