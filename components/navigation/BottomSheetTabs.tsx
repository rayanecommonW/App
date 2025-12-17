import { GlassView } from "@/components/ui/GlassView";
import ListItem from "@/components/ui/ListItem";
import SheetSection from "@/components/ui/SheetSection";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
    BottomSheetView,
    useBottomSheetSpringConfigs,
    type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { useMemo, useRef, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type TabName = "index" | "explore" | "matches" | "shop";

const TABS: { name: TabName; label: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: "index", label: "Home", icon: "home-outline", iconActive: "home" },
  { name: "explore", label: "Explore", icon: "compass-outline", iconActive: "compass" },
  { name: "matches", label: "Matches", icon: "people-outline", iconActive: "people" },
  { name: "shop", label: "Shop", icon: "bag-outline", iconActive: "bag" },
];

function Badge({ text }: { text: string }) {
  return (
    <GlassView
      effect="clear"
      tintColor="rgba(255,255,255,0.22)"
      borderRadius={12}
      style={styles.badge}
    >
      <Text style={styles.badgeText}>{text}</Text>
    </GlassView>
  );
}

function Panel({ tab }: { tab: TabName }) {
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
        <ListItem title="#1  NeonFox" subtitle="🍃 Grass 2110" right={<Badge text="GM" />} className="bg-white/55 border-white/70" />
        <ListItem title="#2  Quartz" subtitle="🍃 Grass 1984" right={<Badge text="M" />} className="bg-white/55 border-white/70" />
        <ListItem title="#3  RedPanda" subtitle="🍃 Grass 1766" right={<Badge text="D" />} className="bg-white/55 border-white/70" />
      </SheetSection>
    );
  }

  if (tab === "matches") {
    return (
      <SheetSection title="History">
        <ListItem title="AI Agent" subtitle="Correct rizz • +25 🍃 Grass" right={<Badge text="+25" />} className="bg-white/55 border-white/70" />
        <ListItem title="AI Agent" subtitle="Missed rizz • -20 🍃 Grass" right={<Badge text="-20" />} className="bg-white/55 border-white/70" />
        <ListItem title="AI Agent" subtitle="Correct rizz • +25 🍃 Grass" right={<Badge text="+25" />} className="bg-white/55 border-white/70" />
      </SheetSection>
    );
  }

  return (
    <SheetSection title="Plans">
      <ListItem title="TRUTH tier" subtitle="Match with real humans only (demo)" right={<Badge text="TOP" />} className="bg-white/55 border-white/70" />
      <ListItem title="Pro" subtitle="More matches + perks (demo)" className="bg-white/55 border-white/70" />
      <ListItem title="Free" subtitle="Standard queue" right={<Badge text="CURRENT" />} className="bg-white/55 border-white/70" />
    </SheetSection>
  );
}

function SheetBackground({ style }: BottomSheetBackgroundProps) {
  return (
    <GlassView
      effect="clear"
      tintColor="rgba(255, 236, 244, 0.18)"
      borderRadius={28}
      style={[style, styles.sheetBackground]}
    />
  );
}

function TabButton({
  tab,
  isFocused,
  onPress,
  onLongPress,
}: {
  tab: (typeof TABS)[number];
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
      <Ionicons
        name={isFocused ? tab.iconActive : tab.icon}
        size={20}
        color={isFocused ? "#14060f" : "#7a5966"}
      />
      <Text
        style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>

      {isFocused ? (
        <View pointerEvents="none" style={styles.activeIndicatorWrap}>
          <View style={styles.activeIndicator} />
        </View>
      ) : null}
    </Pressable>
  );
}

export default function BottomSheetTabs({
  activeTab,
  onNavigate,
}: {
  activeTab: TabName;
  onNavigate: (tab: TabName) => void;
}) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedIndex = useSharedValue(0);

  const collapsedHeight = 104 + insets.bottom;
  const snapPoints = useMemo(() => [collapsedHeight, "58%"], [collapsedHeight]);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 20,
    stiffness: 210,
    mass: 0.75,
    overshootClamping: false,
  });

  const navRowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0, 0.42], [1, 0], "clamp");
    const translateY = interpolate(animatedIndex.value, [0, 1], [0, 26], "clamp");
    return { opacity, transform: [{ translateY }] };
  });

  const panelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animatedIndex.value, [0.22, 0.62], [0, 1], "clamp");
    const translateY = interpolate(animatedIndex.value, [0.22, 1], [18, 0], "clamp");
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.container]}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        animationConfigs={animationConfigs}
        enablePanDownToClose={false}
        enableOverDrag
        overDragResistanceFactor={3.2}
        enableContentPanningGesture
        enableHandlePanningGesture
        style={styles.sheet}
        backgroundComponent={SheetBackground}
        handleStyle={styles.handle}
        handleIndicatorStyle={styles.indicator}
      >
        <BottomSheetView style={styles.content}>
          {/* Nav row - visible when collapsed */}
          <Animated.View style={[styles.navRow, { paddingBottom: 14 + insets.bottom }, navRowStyle]}>
            <GlassView
              effect="clear"
              tintColor="rgba(255, 255, 255, 0.18)"
              borderRadius={26}
              style={styles.navBar}
            >
              <View style={styles.tabsRow}>
                {TABS.map((tab) => {
                  const isFocused = tab.name === activeTab;
                  return (
                    <TabButton
                      key={tab.name}
                      tab={tab}
                      isFocused={isFocused}
                      onPress={() => {
                        onNavigate(tab.name);
                        bottomSheetRef.current?.snapToIndex(0);
                      }}
                      onLongPress={() => bottomSheetRef.current?.snapToIndex(1)}
                    />
                  );
                })}
              </View>
            </GlassView>
          </Animated.View>

          {/* Panel - visible when expanded */}
          <Animated.View style={[styles.panel, { paddingBottom: 28 + insets.bottom }, panelStyle]}>
            <Panel tab={activeTab} />
          </Animated.View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 50,
    elevation: 50,
  },
  sheet: {
    marginHorizontal: 12,
    shadowColor: "#14060f",
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -10 },
    elevation: 18,
  },
  sheetBackground: {
    // BottomSheet supplies positioning; we only style material.
    backgroundColor: "transparent",
  },
  handle: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  indicator: {
    width: 42,
    height: 5,
    borderRadius: 6,
    backgroundColor: "rgba(160, 110, 128, 0.35)",
  },
  content: {
    flex: 1,
  },
  navRow: {
    paddingHorizontal: 12,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  navBar: {
    padding: 10,
    width: "100%",
    alignSelf: "stretch",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    position: "relative",
    backgroundColor: "transparent",
  },
  tabButtonFocused: {
    // No background/border; focused state is handled by color + indicator
  },
  tabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#7a5966",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  tabLabelActive: {
    color: "#14060f",
    fontWeight: "700",
  },
  activeIndicatorWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: "center",
  },
  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 3,
    backgroundColor: "rgba(20, 6, 15, 0.18)",
  },
  panel: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6f4d58",
  },
});
